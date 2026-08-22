from fastapi import APIRouter, Depends
from app.models.trip import TripModel
from app.models.user import UserModel
from app.db.database import get_db
from app.core.deps import get_current_user
from app.core.errors import AppException

router = APIRouter(prefix="/admin", tags=["Admin Analytics"])

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise AppException(status_code=403, detail="Admin access required")
    return current_user

@router.get("/analytics")
async def get_analytics(db=Depends(get_db), admin=Depends(get_admin_user)):
    trips_col = TripModel.get_collection(db)
    users_col = UserModel.get_collection(db)
    
    total_users = await users_col.count_documents({})
    total_trips = await trips_col.count_documents({})
    
    # Aggregation pipeline to find popular cities (assuming destinations are stored in itinerary_sections)
    pipeline = [
        {"$unwind": "$itinerary_sections"},
        {"$group": {"_id": "$itinerary_sections.destination", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    popular_cities_cursor = trips_col.aggregate(pipeline)
    popular_cities = []
    async for city in popular_cities_cursor:
        if city["_id"]:
            popular_cities.append({"city": city["_id"], "visits": city["count"]})
            
    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_trips": total_trips,
            "popular_cities": popular_cities
        }
    }
