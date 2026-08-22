from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from typing import List, Optional
from app.schemas.trip import TripCreate, TripResponse
from app.models.trip import TripModel
from app.db.database import get_db
from app.core.deps import get_current_user
from app.core.errors import AppException

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("", response_model=TripResponse, status_code=201)
async def create_trip(trip: TripCreate, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    collection = TripModel.get_collection(db)
    trip_dict = trip.model_dump(mode='json')
    trip_dict["user_id"] = current_user["_id"]
    trip_dict["itinerary_sections"] = []
    
    result = await collection.insert_one(trip_dict)
    trip_dict["_id"] = str(result.inserted_id)
    return trip_dict

@router.get("", response_model=List[TripResponse])
async def get_my_trips(status: Optional[str] = Query(None), current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    collection = TripModel.get_collection(db)
    query = {"user_id": current_user["_id"]}
    if status:
        query["status"] = status
        
    cursor = collection.find(query)
    trips = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        trips.append(doc)
    return trips

@router.get("/community", response_model=List[TripResponse])
async def get_community_trips(db=Depends(get_db)):
    collection = TripModel.get_collection(db)
    cursor = collection.find({"is_public": True})
    trips = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        trips.append(doc)
    return trips

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip(trip_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(trip_id):
        raise AppException(status_code=400, detail="Invalid Trip ID")
        
    collection = TripModel.get_collection(db)
    trip = await collection.find_one({"_id": ObjectId(trip_id)})
    
    if not trip:
        raise AppException(status_code=404, detail="Trip not found")
        
    trip["_id"] = str(trip["_id"])
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: str, trip_update: dict, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    if not ObjectId.is_valid(trip_id):
        raise AppException(status_code=400, detail="Invalid Trip ID")
        
    collection = TripModel.get_collection(db)
    existing_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    
    if not existing_trip:
        raise AppException(status_code=404, detail="Trip not found")
        
    if existing_trip["user_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise AppException(status_code=403, detail="Not authorized to modify this trip")
        
    trip_update.pop("_id", None)
    
    result = await collection.find_one_and_update(
        {"_id": ObjectId(trip_id)},
        {"$set": trip_update},
        return_document=True
    )
    
    result["_id"] = str(result["_id"])
    return result

@router.delete("/{trip_id}", status_code=200)
async def delete_trip(trip_id: str, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    if not ObjectId.is_valid(trip_id):
        raise AppException(status_code=400, detail="Invalid Trip ID")
        
    collection = TripModel.get_collection(db)
    existing_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    
    if not existing_trip:
        raise AppException(status_code=404, detail="Trip not found")
        
    if existing_trip["user_id"] != current_user["_id"] and current_user.get("role") != "admin":
        raise AppException(status_code=403, detail="Not authorized to delete this trip")
        
    await collection.delete_one({"_id": ObjectId(trip_id)})
    return {"success": True, "message": "Trip deleted successfully"}

@router.post("/{trip_id}/clone", response_model=TripResponse, status_code=201)
async def clone_trip(trip_id: str, current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    if not ObjectId.is_valid(trip_id):
        raise AppException(status_code=400, detail="Invalid Trip ID")
        
    collection = TripModel.get_collection(db)
    source_trip = await collection.find_one({"_id": ObjectId(trip_id)})
    
    if not source_trip:
        raise AppException(status_code=404, detail="Trip not found")
        
    cloned_doc = {
        "name": f"Copy of {source_trip['name']}",
        "status": "upcoming",
        "is_public": False,
        "user_id": current_user["_id"],
        "itinerary_sections": source_trip.get("itinerary_sections", [])
    }
    
    result = await collection.insert_one(cloned_doc)
    cloned_doc["_id"] = str(result.inserted_id)
    return cloned_doc

@router.post("/{trip_id}/like", status_code=200)
async def like_trip(trip_id: str, db=Depends(get_db)):
    if not ObjectId.is_valid(trip_id):
        raise AppException(status_code=400, detail="Invalid Trip ID")
        
    collection = TripModel.get_collection(db)
    result = await collection.find_one_and_update(
        {"_id": ObjectId(trip_id)},
        {"$inc": {"likes": 1}},
        return_document=True
    )
    if not result:
        raise AppException(status_code=404, detail="Trip not found")
    return {"success": True, "likes": result.get("likes", 1)}
