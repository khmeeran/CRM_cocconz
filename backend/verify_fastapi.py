from fastapi.testclient import TestClient
from main import app
import sqlite3

client = TestClient(app)

def test_initialization():
    print("=== TESTING BRANCH INITIALIZATION ===")
    
    login_payload = {'username': 'admin', 'password': 'AdminReset2026!'}
    r = client.post("/token", data=login_payload)
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    branch_payload = {"name": "Branch Initialization Test", "code": "INIT_TEST_4"}
    r = client.post("/api/branches", json=branch_payload, headers=headers)
    print("Create Branch HTTP Status:", r.status_code)
    branch = r.json()
    branch_id = branch.get("id")
    print("Branch ID:", branch_id)
    
    conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, section, division FROM classes WHERE branch_id = ?", (branch_id,))
    rows = cursor.fetchall()
    print("\n--- Classes for New Branch (DB Verification) ---")
    for r in rows:
        print(f"{r[0]} - {r[1]} ({r[2]})")
    print("\nTotal Classes Seeded:", len(rows))
    
    r = client.get("/api/classes", headers=headers)
    classes = r.json()
    print("\n--- Global Dropdown Order Verification (API response) ---")
    for i, c in enumerate(classes[:10]):
        print(f"{i+1}. {c['name']} - {c['section']}")

test_initialization()
