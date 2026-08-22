from typing import Optional
from bson import ObjectId
from app.schemas.user import UserCreate
from app.core.config import settings

# This layer acts as the Database Model interface.
# In a raw motor setup, we keep helper classes here to format data for MongoDB.

class UserModel:
    collection_name = "users"

    @staticmethod
    def get_collection(db):
        return db[UserModel.collection_name]

    @staticmethod
    def format_for_db(user: UserCreate, hashed_password: str) -> dict:
        user_dict = user.model_dump(exclude={"password"})
        user_dict["hashed_password"] = hashed_password
        user_dict["role"] = "user"
        user_dict["refresh_tokens"] = [] # Store active refresh token JTIs for rotation
        return user_dict
