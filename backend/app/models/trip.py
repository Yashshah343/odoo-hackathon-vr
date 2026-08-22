from app.schemas.trip import TripCreate

class TripModel:
    collection_name = "trips"

    @staticmethod
    def get_collection(db):
        return db[TripModel.collection_name]
