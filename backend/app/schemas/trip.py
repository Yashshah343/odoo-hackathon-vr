from pydantic import BaseModel, Field
from typing import List, Optional
from app.models.base import PyObjectId

class ItineraryExpense(BaseModel):
    category: str
    amount: float
    currency: str = "USD"

class FlightDetails(BaseModel):
    airline: Optional[str] = ""
    flight_number: Optional[str] = ""
    departure: Optional[str] = ""
    cost: Optional[float] = 0.0
    enabled: Optional[bool] = False

class HotelDetails(BaseModel):
    hotel_name: Optional[str] = ""
    room_type: Optional[str] = ""
    nights: Optional[int] = 1
    cost: Optional[float] = 0.0
    enabled: Optional[bool] = False

class ItinerarySection(BaseModel):
    section_id: str
    destination: str
    type: Optional[str] = "destination" # flight, hotel, activity, destination
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget_allocated: float = 0.0
    flight: Optional[FlightDetails] = None
    hotel: Optional[HotelDetails] = None
    activities: List[str] = []
    expenses: List[ItineraryExpense] = []

class TripBase(BaseModel):
    name: str = Field(..., example="Summer in Paris")
    description: Optional[str] = ""
    cover_image: Optional[str] = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
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
