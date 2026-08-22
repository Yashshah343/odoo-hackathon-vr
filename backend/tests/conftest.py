import pytest
from httpx import AsyncClient
from app.main import app

# Create a clean pytest async fixture structure
@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.fixture
async def async_client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
