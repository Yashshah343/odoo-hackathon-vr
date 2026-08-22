import pytest
import asyncio
from httpx import AsyncClient
from app.main import app
from app.core.config import settings
from app.db.database import connect_to_mongo, close_mongo_connection, db

# Override DB name for testing
settings.DATABASE_NAME = "globetrotter_test_db"

@pytest.fixture(scope="session")
def anyio_backend():
    return 'asyncio'

@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    await connect_to_mongo()
    # Clean the test database before running tests
    if db.client:
        await db.client.drop_database(settings.DATABASE_NAME)
    yield
    # Clean up after all tests
    if db.client:
        await db.client.drop_database(settings.DATABASE_NAME)
    await close_mongo_connection()

from httpx import AsyncClient, ASGITransport

@pytest.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def test_user(async_client):
    user_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": "test@example.com",
        "password": "password123"
    }
    response = await async_client.post("/api/v1/auth/register", json=user_data)
    # If already exists (due to test failure cleanup issue), just login
    if response.status_code == 400:
        pass
    return user_data

@pytest.fixture
async def auth_headers(async_client, test_user):
    response = await async_client.post(
        "/api/v1/auth/login", 
        data={"username": test_user["email"], "password": test_user["password"]}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
