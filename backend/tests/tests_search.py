import pytest
from fastapi.testclient import TestClient
from app.main import app  

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_search_valid_prompt():
    response = client.post("/search", json={"prompt": "Need a GPU instance with 16 vCPUs and 64 GB RAM"})
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert isinstance(data["results"], list)

def test_search_empty_prompt():
    response = client.post("/search", json={"prompt": ""})
    assert response.status_code == 200  
    data = response.json()
    assert "results" in data
