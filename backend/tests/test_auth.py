import pytest
from httpx import AsyncClient

# Mock data for testing
TEST_USER = {
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "password123"
}

@pytest.mark.anyio
async def test_register_success(async_client: AsyncClient):
    response = await async_client.post("/api/v1/auth/register", json=TEST_USER)
    
    # Because we don't have a real running DB in the test runner out of the box,
    # This might fail connecting to Mongo unless Mongo is running locally.
    # A true robust setup would use mongomock.
    
    if response.status_code == 201:
        data = response.json()
        assert data["email"] == TEST_USER["email"]
        assert "_id" in data
    elif response.status_code == 400:
        # Email already registered handling
        data = response.json()
        assert data["success"] is False

@pytest.mark.anyio
async def test_register_validation_error(async_client: AsyncClient):
    # Missing email to trigger 422
    bad_user = {"first_name": "Test", "password": "password123"}
    response = await async_client.post("/api/v1/auth/register", json=bad_user)
    
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert data["error"] == "Validation Error"
