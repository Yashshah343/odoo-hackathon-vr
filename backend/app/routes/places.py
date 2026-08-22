import httpx
from fastapi import APIRouter, Query, Depends
from typing import List, Optional
from app.db.database import get_db
router = APIRouter(prefix="/places", tags=["Places Autocomplete"])

# Comprehensive global & Indian destinations with authentic high-res photos
POPULAR_DESTINATIONS = [
    {"name": "Ahmedabad", "region": "Gujarat", "country": "India", "type": "city", "badge": "Heritage City", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1609137144822-44673fb39bf9?w=600&auto=format&fit=crop&q=80"},
    {"name": "Mumbai", "region": "Maharashtra", "country": "India", "type": "city", "badge": "Financial Capital", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80"},
    {"name": "Jaipur", "region": "Rajasthan", "country": "India", "type": "city", "badge": "Pink City", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80"},
    {"name": "Delhi", "region": "NCR", "country": "India", "type": "city", "badge": "Capital", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80"},
    {"name": "Goa", "region": "Goa", "country": "India", "type": "city", "badge": "Beach & Sunset", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80"},
    {"name": "Udaipur", "region": "Rajasthan", "country": "India", "type": "city", "badge": "City of Lakes", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=600&auto=format&fit=crop&q=80"},
    {"name": "Varanasi", "region": "Uttar Pradesh", "country": "India", "type": "city", "badge": "Spiritual Capital", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=600&auto=format&fit=crop&q=80"},
    {"name": "Bengaluru", "region": "Karnataka", "country": "India", "type": "city", "badge": "Garden City", "flag": "🇮🇳", "image": "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80"},
    {"name": "Paris", "region": "Île-de-France", "country": "France", "type": "city", "badge": "City of Light", "flag": "🇫🇷", "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80"},
    {"name": "Tokyo", "region": "Kanto", "country": "Japan", "type": "city", "badge": "Metropolis", "flag": "🇯🇵", "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80"},
    {"name": "Rome", "region": "Lazio", "country": "Italy", "type": "city", "badge": "Eternal City", "flag": "🇮🇹", "image": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&auto=format&fit=crop&q=80"},
    {"name": "Bali", "region": "Bali Province", "country": "Indonesia", "type": "city", "badge": "Tropical Island", "flag": "🇮🇩", "image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80"},
    {"name": "Dubai", "region": "Dubai", "country": "United Arab Emirates", "type": "city", "badge": "Futuristic Hub", "flag": "🇦🇪", "image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80"},
    {"name": "Interlaken", "region": "Bernese Alps", "country": "Switzerland", "type": "city", "badge": "Swiss Alps", "flag": "🇨🇭", "image": "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&auto=format&fit=crop&q=80"},
    {"name": "London", "region": "England", "country": "United Kingdom", "type": "city", "badge": "Historic Capital", "flag": "🇬🇧", "image": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&auto=format&fit=crop&q=80"},
    {"name": "New York City", "region": "New York", "country": "United States", "type": "city", "badge": "The Big Apple", "flag": "🇺🇸", "image": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&auto=format&fit=crop&q=80"}
]

# Real Authentic Attractions per City in INR (₹)
CITY_ATTRACTIONS = {
    "ahmedabad": [
        {
            "name": "Sabarmati Ashram (Gandhi Ashram)",
            "category": "National Heritage",
            "duration": "2.5h",
            "cost": 0,
            "cost_inr": "Free Entry",
            "image": "https://images.unsplash.com/photo-1609137144822-44673fb39bf9?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Atal Pedestrian Bridge & Riverfront Walk",
            "category": "Architecture & Scenic",
            "duration": "2h",
            "cost": 30,
            "cost_inr": "₹30",
            "image": "https://images.unsplash.com/photo-1662974950392-f0bc88e1e7fa?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Adalaj Stepwell (Adalaj ni Vav)",
            "category": "Historical Monument",
            "duration": "1.5h",
            "cost": 25,
            "cost_inr": "₹25",
            "image": "https://images.unsplash.com/photo-1600681977797-158d626da44b?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Kankaria Lakefront & Light Show",
            "category": "Recreation & Lake",
            "duration": "3h",
            "cost": 50,
            "cost_inr": "₹50",
            "image": "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Sidi Saiyyed Mosque (Tree of Life Jali)",
            "category": "Heritage & Art",
            "duration": "1h",
            "cost": 0,
            "cost_inr": "Free Entry",
            "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Law Garden & Manek Chowk Night Food Trail",
            "category": "Culinary & Street Food",
            "duration": "2.5h",
            "cost": 350,
            "cost_inr": "₹350",
            "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
        }
    ],
    "mumbai": [
        {
            "name": "Gateway of India & Elephanta Ferry",
            "category": "Iconic Heritage",
            "duration": "3h",
            "cost": 250,
            "cost_inr": "₹250",
            "image": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Marine Drive Promenade Sunset Walk",
            "category": "Scenic Queen's Necklace",
            "duration": "2h",
            "cost": 0,
            "cost_inr": "Free",
            "image": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Chhatrapati Shivaji Maharaj Terminus (CSMT)",
            "category": "Victorian Gothic UNESCO",
            "duration": "1.5h",
            "cost": 50,
            "cost_inr": "₹50",
            "image": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Bandra Fort & Sea Link Panorama",
            "category": "Coastal Landmark",
            "duration": "2h",
            "cost": 0,
            "cost_inr": "Free",
            "image": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Juhu Beach Street Food Experience",
            "category": "Culinary",
            "duration": "2h",
            "cost": 300,
            "cost_inr": "₹300",
            "image": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=600&auto=format&fit=crop&q=80"
        }
    ],
    "jaipur": [
        {
            "name": "Amber Palace & Elephant Pathway",
            "category": "Royal Fort",
            "duration": "4h",
            "cost": 500,
            "cost_inr": "₹500",
            "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Hawa Mahal (Palace of Winds)",
            "category": "Royal Architecture",
            "duration": "1.5h",
            "cost": 200,
            "cost_inr": "₹200",
            "image": "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "City Palace & Jantar Mantar Observatory",
            "category": "Museum & Astronomy",
            "duration": "3h",
            "cost": 400,
            "cost_inr": "₹400",
            "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop&q=80"
        }
    ],
    "delhi": [
        {
            "name": "Qutub Minar Complex",
            "category": "UNESCO Monument",
            "duration": "2.5h",
            "cost": 250,
            "cost_inr": "₹250",
            "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "India Gate & Kartavya Path Walk",
            "category": "National Memorial",
            "duration": "1.5h",
            "cost": 0,
            "cost_inr": "Free",
            "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Humayun's Tomb Mughal Gardens",
            "category": "Mughal Architecture",
            "duration": "2h",
            "cost": 250,
            "cost_inr": "₹250",
            "image": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80"
        }
    ],
    "paris": [
        {
            "name": "Eiffel Tower Summit Access",
            "category": "Iconic Landmark",
            "duration": "3h",
            "cost": 2500,
            "cost_inr": "₹2,500",
            "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Louvre Museum Mona Lisa Tour",
            "category": "Art & History",
            "duration": "4h",
            "cost": 2000,
            "cost_inr": "₹2,000",
            "image": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Seine River Evening Sightseeing Cruise",
            "category": "Scenic Cruise",
            "duration": "1.5h",
            "cost": 1500,
            "cost_inr": "₹1,500",
            "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80"
        }
    ],
    "tokyo": [
        {
            "name": "Shibuya Sky 360 Observatory Deck",
            "category": "Modern Skyline",
            "duration": "2h",
            "cost": 1800,
            "cost_inr": "₹1,800",
            "image": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80"
        },
        {
            "name": "Senso-ji Asakusa Historic Temple",
            "category": "Cultural Heritage",
            "duration": "2h",
            "cost": 0,
            "cost_inr": "Free",
            "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80"
        }
    ]
}

@router.get("/attractions")
async def get_city_attractions(destination: str = Query("ahmedabad")):
    dest_lower = destination.lower()
    for key, items in CITY_ATTRACTIONS.items():
        if key in dest_lower:
            return {"city": destination, "attractions": items}
    
    # Generic real place builder with INR pricing
    return {
        "city": destination,
        "attractions": [
            {
                "name": f"{destination} Historic Old Town & Heritage Walk",
                "category": "Heritage",
                "duration": "2.5h",
                "cost": 200,
                "cost_inr": "₹200",
                "image": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": f"{destination} Central Art & Culture Museum",
                "category": "Museum",
                "duration": "3h",
                "cost": 350,
                "cost_inr": "₹350",
                "image": "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": f"{destination} Scenic Sunset Viewpoint",
                "category": "Scenic",
                "duration": "1.5h",
                "cost": 100,
                "cost_inr": "₹100",
                "image": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
            },
            {
                "name": f"{destination} Local Food & Night Market Experience",
                "category": "Culinary",
                "duration": "2h",
                "cost": 400,
                "cost_inr": "₹400",
                "image": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80"
            }
        ]
    }

@router.get("/search")
async def search_places(
    q: str = Query(..., min_length=1),
    limit: int = Query(8),
    country: Optional[str] = Query(None),
    db=Depends(get_db)
):
    query_clean = q.strip().lower()
    results = []
    seen_keys = set()

    # 1. Search database trips
    try:
        trips_col = TripModel.get_collection(db)
        db_cursor = trips_col.find(
            {"name": {"$regex": query_clean, "$options": "i"}},
            {"_id": 1, "name": 1, "status": 1}
        ).limit(3)
        async for doc in db_cursor:
            key = f"trip_{doc['_id']}"
            if key not in seen_keys:
                seen_keys.add(key)
                results.append({
                    "id": str(doc["_id"]),
                    "title": doc["name"],
                    "subtitle": f"Trip · {doc.get('status', 'upcoming').capitalize()}",
                    "type": "trip",
                    "badge": "Trip",
                    "url": f"/trips/{doc['_id']}",
                    "icon": "plane"
                })
    except Exception:
        pass

    # 2. Search curated popular landmarks and destinations (prioritizing user country if matching)
    matching_destinations = []
    for item in POPULAR_DESTINATIONS:
        match_str = f"{item['name']} {item.get('region', '')} {item['country']}".lower()
        if query_clean in match_str:
            matching_destinations.append(item)

    # Sort matching destinations so user's country appears first
    if country:
        matching_destinations.sort(key=lambda x: 0 if x.get("country", "").lower() == country.lower() else 1)

    for item in matching_destinations:
        key = f"{item['name']}_{item['country']}"
        if key not in seen_keys:
            seen_keys.add(key)
            results.append({
                "id": key,
                "title": item["name"],
                "subtitle": f"{item.get('region', '') + ', ' if item.get('region') else ''}{item['country']}",
                "type": item["type"],
                "badge": item.get("badge", "Place"),
                "flag": item.get("flag", "📍"),
                "image": item.get("image"),
                "url": f"/explore?destination={item['name']}",
                "icon": "map-pin"
            })

    # 3. Live Geocoding API Search
    if len(results) < limit:
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": q.strip(), "count": 6, "language": "en", "format": "json"}
                )
                if resp.status_code == 200:
                    geo_data = resp.json().get("results", [])
                    for item in geo_data:
                        name = item.get("name", "")
                        admin1 = item.get("admin1", "")
                        c_name = item.get("country", "")
                        country_code = item.get("country_code", "")
                        key = f"{name}_{c_name}"
                        if key not in seen_keys:
                            seen_keys.add(key)
                            sub = f"{admin1 + ', ' if admin1 else ''}{c_name}"
                            results.append({
                                "id": key,
                                "title": name,
                                "subtitle": sub,
                                "type": "city",
                                "badge": "City",
                                "latitude": item.get("latitude"),
                                "longitude": item.get("longitude"),
                                "country_code": country_code,
                                "url": f"/explore?destination={name}",
                                "icon": "map-pin"
                            })
                            if len(results) >= limit:
                                break
        except Exception:
            pass

    return {
        "query": q,
        "count": len(results),
        "results": results[:limit]
    }

@router.get("/popular")
async def get_popular_places(country: Optional[str] = Query(None)):
    """Returns top places prioritizing user's country"""
    sorted_places = list(POPULAR_DESTINATIONS)
    if country:
        sorted_places.sort(key=lambda x: 0 if x.get("country", "").lower() == country.lower() else 1)
    return {
        "trending": sorted_places[:8]
    }
