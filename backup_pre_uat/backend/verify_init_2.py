import requests
import sqlite3

BASE_URL = 'http://127.0.0.1:8000'

def test_initialization():
    print("=== TESTING BRANCH INITIALIZATION ===")
    
    # 1. Login to get token
    login_payload = {'username': 'admin', 'password': 'AdminReset2026!'}
    r = requests.post(f"{BASE_URL}/token", data=login_payload)
    if r.status_code != 200:
        print("Login failed:", r.text)
        return
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create "Branch Initialization Test 2"
    branch_payload = {"name": "Branch Initialization Test", "code": "INIT_TEST_3"}
    r = requests.post(f"{BASE_URL}/api/branches", json=branch_payload, headers=headers)
    print("Create Branch HTTP Status:", r.status_code)
    branch = r.json()
    branch_id = branch.get("id")
    print("Branch ID:", branch_id)
    
    # 3. Check classes in DB
    conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
    cursor = conn.cursor()
    cursor.execute("SELECT name, section, division FROM classes WHERE branch_id = ?", (branch_id,))
    rows = cursor.fetchall()
    print("\n--- Classes for New Branch (DB) ---")
    for r in rows:
        print(f"{r[0]} - {r[1]} ({r[2]})")
    print("\nTotal Classes Seeded:", len(rows))
    
    # 4. Verify Dropdown Order overall via API
    print("\n--- Global Dropdown Order Verification ---")
    r = requests.get(f"{BASE_URL}/api/classes", headers=headers)
    classes = r.json()
    for i, c in enumerate(classes):
        print(f"{i+1}. {c['name']} - {c['section']} ({c['division']})")

test_initialization()
