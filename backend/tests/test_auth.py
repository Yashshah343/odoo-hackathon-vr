import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_register_and_login(async_client: AsyncClient):
    user_data = {
        "first_name": "Auth",
        "last_name": "Tester",
        "email": "auth@example.com",
        "password": "strongpassword"
    }
    
    # 1. Register
    res = await async_client.post("/api/v1/auth/register", json=user_data)
    assert res.status_code == 201
    assert res.json()["email"] == user_data["email"]
    
    # 2. Register duplicate (Edge Case)
    res_dup = await async_client.post("/api/v1/auth/register", json=user_data)
    assert res_dup.status_code == 400
    
    # 3. Login success
    res_login = await async_client.post("/api/v1/auth/login", data={
        "username": user_data["email"],
        "password": user_data["password"]
    })
    assert res_login.status_code == 200
    data = res_login.json()
    assert "access_token" in data
    assert "refresh_token" in data
    
    # 4. Login failure (Edge Case)
    res_bad = await async_client.post("/api/v1/auth/login", data={
        "username": user_data["email"],
        "password": "wrongpassword"
    })
    assert res_bad.status_code == 401

@pytest.mark.anyio
async def test_token_refresh(async_client: AsyncClient, test_user):
    # Login
    res_login = await async_client.post("/api/v1/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    refresh_token = res_login.json()["refresh_token"]
    
    # Refresh token
    res_refresh = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_refresh.status_code == 200
    new_refresh = res_refresh.json()["refresh_token"]
    
    # Try reusing old refresh token (Edge Case - Rotation security)
    res_reuse = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_reuse.status_code == 401

@pytest.mark.anyio
async def test_logout(async_client: AsyncClient, test_user):
    res_login = await async_client.post("/api/v1/auth/login", data={
        "username": test_user["email"],
        "password": test_user["password"]
    })
    refresh_token = res_login.json()["refresh_token"]
    
    # Logout
    res_logout = await async_client.post("/api/v1/auth/logout", json={"refresh_token": refresh_token})
    assert res_logout.status_code == 200
    
    # Try refresh after logout (Edge Case)
    res_refresh = await async_client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert res_refresh.status_code == 401
