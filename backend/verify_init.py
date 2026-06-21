import requests
import json
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
    
    # 2. Create "Branch Initialization Test"
    branch_payload = {"name": "Branch Initialization Test", "code": "INIT_TEST"}
    r = requests.post(f"{BASE_URL}/api/branches", json=branch_payload, headers=headers)
    print("Create Branch HTTP Status:", r.status_code)
    branch = r.json()
    print("Branch ID:", branch.get("id"))
    
    # 3. Check classes
    r = requests.get(f"{BASE_URL}/api/classes", headers=headers)
    classes = r.json()
    print("\n--- Classes for New Branch ---")
    branch_classes = [c for c in classes if c.get("branch_id") == branch.get("id")]
    for c in branch_classes:
        print(f"{c['name']} - {c['section']} ({c['division']})")
        
    print("\nTotal Classes Seeded:", len(branch_classes))

    # 4. Verify Dropdown Order overall (Admissions Page Dropdown Simulation)
    print("\n--- Global Dropdown Order Verification ---")
    for i, c in enumerate(classes[:12]):
        print(f"{i+1}. {c['name']} (Branch: {c['branch_id']})")
        
test_initialization()
