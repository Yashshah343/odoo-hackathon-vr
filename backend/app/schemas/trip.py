from pydantic import BaseModel, Field
from typing import List
from datetime import date
from app.models.base import PyObjectId

class ItineraryExpense(BaseModel):
    category: str
    amount: float
    currency: str = "USD"

class ItinerarySection(BaseModel):
    section_id: str
    type: str # flight, hotel, activity
    destination: str
    start_date: date
    end_date: date
    budget_allocated: float
    activities: List[str] = []
    expenses: List[ItineraryExpense] = []

class TripBase(BaseModel):
    name: str = Field(..., example="Summer in Paris")
    status: str = Field(default="upcoming") # ongoing, upcoming, completed
    is_public: bool = False

class TripCreate(TripBase):
    pass

class TripResponse(TripBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    itinerary_sections: List[ItinerarySection] = []

    class Config:
        populate_by_name = True
        json_encoders = {PyObjectId: str}
