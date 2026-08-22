import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_create_trip(async_client: AsyncClient, auth_headers):
    trip_data = {
        "name": "Paris Vacation",
        "status": "upcoming",
        "is_public": False
    }
    res = await async_client.post("/api/v1/trips", json=trip_data, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["name"] == "Paris Vacation"
    assert "_id" in res.json()

@pytest.mark.anyio
async def test_get_my_trips(async_client: AsyncClient, auth_headers):
    # Ensure there is at least one trip
    await async_client.post("/api/v1/trips", json={"name": "Rome", "status": "ongoing", "is_public": False}, headers=auth_headers)
    
    res = await async_client.get("/api/v1/trips", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
    
    # Filter edge case
    res_filtered = await async_client.get("/api/v1/trips?status=completed", headers=auth_headers)
    assert res_filtered.status_code == 200
    # assuming we haven't created a completed one yet in this test block

@pytest.mark.anyio
async def test_update_trip_unauthorized(async_client: AsyncClient, auth_headers):
    # Create a trip
    res = await async_client.post("/api/v1/trips", json={"name": "Secret", "status": "upcoming", "is_public": False}, headers=auth_headers)
    trip_id = res.json()["_id"]
    
    # Try updating without auth
    res_no_auth = await async_client.put(f"/api/v1/trips/{trip_id}", json={"name": "Hacked"})
    assert res_no_auth.status_code == 401
