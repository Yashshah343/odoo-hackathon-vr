from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserResponse
from app.models.user import UserModel
from app.db.database import get_db
from app.core.errors import AppException

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Dummy hash for hackathon brevity, in production use passlib/bcrypt
def fake_hash_password(password: str):
    return f"hashed_{password}"

@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(user: UserCreate, db=Depends(get_db)):
    collection = UserModel.get_collection(db)
    
    # Check if user exists
    existing = await collection.find_one({"email": user.email})
    if existing:
        raise AppException(status_code=400, detail="Email already registered")
    
    # Insert new user
    user_data = UserModel.format_for_db(user, fake_hash_password(user.password))
    result = await collection.insert_one(user_data)
    
    # Return response
    user_data["_id"] = str(result.inserted_id)
    return user_data
