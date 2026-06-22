from fastapi.testclient import TestClient
from main import app
import schemas

client = TestClient(app)

res = client.post("/token", data={"username": "admin", "password": "password"})
token = res.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

print("1. Testing GET /api/collections")
res = client.get("/api/collections", headers=headers)
print("GET Collections:", res.status_code)

print("\n2. Testing GET /api/receipts")
res = client.get("/api/receipts", headers=headers)
print("GET Receipts:", res.status_code)

if res.status_code == 200 and len(res.json()) > 0:
    receipt_no = res.json()[0]['receipt_no']
    print("\n3. Testing GET /api/receipt/{receipt_no}/pdf")
    res = client.get(f"/api/receipt/{receipt_no}/pdf", headers=headers)
    print("GET Receipt PDF:", res.status_code)

