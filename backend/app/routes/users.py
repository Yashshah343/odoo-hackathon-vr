from fastapi import APIRouter, Depends
from bson import ObjectId
from app.schemas.user import UserResponse
from app.models.user import UserModel
from app.models.trip import TripModel
from app.db.database import get_db
from app.core.deps import get_current_user
from app.core.errors import AppException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter(prefix="/users", tags=["Users"])

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    language_preference: Optional[str] = None
    saved_destinations: Optional[List[str]] = None

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_users_me(update_data: UserUpdate, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    collection = UserModel.get_collection(db)
    
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if not update_dict:
        return current_user
        
    result = await collection.find_one_and_update(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise AppException(status_code=404, detail="User not found")
        
    result["_id"] = str(result["_id"])
    return result

@router.delete("/me")
async def delete_users_me(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    users_col = UserModel.get_collection(db)
    trips_col = TripModel.get_collection(db)
    
    user_id = current_user["_id"]
    await trips_col.delete_many({"user_id": user_id})
    await users_col.delete_one({"_id": ObjectId(user_id)})
    
    return {"success": True, "message": "User account and all associated trips permanently deleted"}
