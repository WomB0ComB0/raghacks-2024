from fastapi.testclient import TestClient
from main import app
import pytest
from unittest.mock import patch, AsyncMock

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_get_current_gps_coordinates():
    with patch('geocoder.ip') as mock_geocoder:
        mock_geocoder.return_value.latlng = [40.7128, -74.0060]
        response = client.get("/coordinates/")
        assert response.status_code == 200
        assert response.json() == {"latitude": 40.7128, "longitude": -74.0060}

@pytest.mark.asyncio
async def test_get_poi():
    mock_latitude = 40.7128
    mock_longitude = -74.0060
    mock_poi_type = "restaurant"
    mock_response = {
        "query": "Finding the nearest restaurant...",
        "nearest_place": "Test Restaurant",
        "address": "123 Test St, Test City"
    }

    with patch('main.get_localized_information', new_callable=AsyncMock) as mock_get_info:
        mock_get_info.return_value = mock_response
        response = client.get(f"/poi/?latitude={mock_latitude}&longitude={mock_longitude}&poi_type={mock_poi_type}")
        assert response.status_code == 200
        assert response.json() == mock_response

def test_get_current_gps_coordinates_failure():
    with patch('geocoder.ip') as mock_geocoder:
        mock_geocoder.return_value.latlng = None
        response = client.get("/coordinates/")
        assert response.status_code == 404
        assert response.json() == {"detail": "Unable to retrieve GPS coordinates."}

@pytest.mark.asyncio
async def test_get_poi_failure():
    mock_latitude = 40.7128
    mock_longitude = -74.0060
    mock_poi_type = "restaurant"

    with patch('main.get_localized_information', new_callable=AsyncMock) as mock_get_info:
        mock_get_info.side_effect = Exception("Test error")
        response = client.get(f"/poi/?latitude={mock_latitude}&longitude={mock_longitude}&poi_type={mock_poi_type}")
        assert response.status_code == 500
        assert response.json() == {"detail": "Test error"}