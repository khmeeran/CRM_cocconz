import sys
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

# Bypass auth for a quick test
app.dependency_overrides = {}
from main import get_current_user
import models

def override_get_current_user():
    return models.User(id="test_admin_id", role="ADMIN", branch_id="b1")

app.dependency_overrides[get_current_user] = override_get_current_user

res = client.get("/api/receipts")
print("GET /api/receipts status:", res.status_code)

if res.status_code == 200 and len(res.json()) > 0:
    receipt_no = res.json()[0]['receipt_no']
    print("Testing PDF for:", receipt_no)
    res_pdf = client.get(f"/api/receipt/{receipt_no}/pdf")
    print("PDF status:", res_pdf.status_code)
    print("PDF Content-Type:", res_pdf.headers.get("content-type"))
