from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

# ----------------- User Schemas -----------------
class UserBase(BaseModel):
    first_name: str = Field(..., example="Jane")
    last_name: str = Field(..., example="Doe")
    email: EmailStr = Field(..., example="jane.doe@example.com")
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    language_preference: Optional[str] = "English"
    saved_destinations: List[str] = []

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="securepassword123")

class UserResponse(UserBase):
    id: str = Field(..., alias="_id")
    role: str = "user"

    class Config:
        populate_by_name = True
