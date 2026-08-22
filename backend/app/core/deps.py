from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.db.database import get_db
from app.models.user import UserModel
from app.core.security import decode_token
from app.core.errors import AppException
from app.schemas.user import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db = Depends(get_db)) -> dict:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise AppException(status_code=401, detail="Could not validate credentials")
    
    user_id = payload.get("sub")
    if not user_id:
        raise AppException(status_code=401, detail="Could not validate credentials")
    
    collection = UserModel.get_collection(db)
    user = await collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        raise AppException(status_code=404, detail="User not found")
        
    user["_id"] = str(user["_id"])
    return user
