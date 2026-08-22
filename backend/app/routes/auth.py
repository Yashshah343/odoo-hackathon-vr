from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
import uuid
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token, RefreshTokenRequest
from app.models.user import UserModel
from app.db.database import get_db
from app.core.errors import AppException
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(user: UserCreate, db=Depends(get_db)):
    collection = UserModel.get_collection(db)
    existing = await collection.find_one({"email": user.email})
    if existing:
        raise AppException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    user_data = UserModel.format_for_db(user, hashed_pwd)
    
    result = await collection.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    return user_data

@router.post("/login", response_model=Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    collection = UserModel.get_collection(db)
    user = await collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise AppException(status_code=401, detail="Incorrect email or password")
    
    user_id = str(user["_id"])
    access_token = create_access_token(subject=user_id)
    
    jti = str(uuid.uuid4())
    refresh_token = create_refresh_token(subject=user_id, jti=jti)
    
    # Store refresh token JTI for rotation
    await collection.update_one({"_id": ObjectId(user_id)}, {"$push": {"refresh_tokens": jti}})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db=Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise AppException(status_code=401, detail="Invalid refresh token")
    
    user_id = payload.get("sub")
    jti = payload.get("jti")
    
    collection = UserModel.get_collection(db)
    user = await collection.find_one({"_id": ObjectId(user_id)})
    
    if not user or jti not in user.get("refresh_tokens", []):
        raise AppException(status_code=401, detail="Refresh token has been revoked or is invalid")
    
    # Rotate tokens: remove old JTI, add new JTI
    new_jti = str(uuid.uuid4())
    new_access_token = create_access_token(subject=user_id)
    new_refresh_token = create_refresh_token(subject=user_id, jti=new_jti)
    
    await collection.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$pull": {"refresh_tokens": jti}}
    )
    await collection.update_one(
        {"_id": ObjectId(user_id)}, 
        {"$push": {"refresh_tokens": new_jti}}
    )
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout")
async def logout(request: RefreshTokenRequest, db=Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload and payload.get("type") == "refresh":
        user_id = payload.get("sub")
        jti = payload.get("jti")
        collection = UserModel.get_collection(db)
        await collection.update_one(
            {"_id": ObjectId(user_id)}, 
            {"$pull": {"refresh_tokens": jti}}
        )
    return {"success": True, "message": "Logged out successfully"}
