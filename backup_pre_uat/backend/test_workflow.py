import requests
import json
import sqlite3

BASE_URL = 'http://127.0.0.1:8000'

def test_workflow():
    try:
        # Login
        r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
        r.raise_for_status()
        token = r.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        # Seed Fee Heads
        r = requests.post(f"{BASE_URL}/api/seed-fee-heads", headers=headers)
        r = requests.get(f"{BASE_URL}/api/fee-heads", headers=headers)
        fee_heads = r.json()
        print(f"--- Fee Heads Seeded: {len(fee_heads)} ---")
        tuition_head = next(h for h in fee_heads if h['name'] == 'Tuition Fee')
        
        # Setup: Find a class ID and branch ID
        r = requests.get(f"{BASE_URL}/api/classes", headers=headers)
        class_id = r.json()[0]['id'] if r.json() else "dummy_class"
        
        r = requests.get(f"{BASE_URL}/api/branches", headers=headers)
        branch_id = r.json()[0]['id'] if r.json() else "dummy_branch"

        print("--- POST /api/fee-structures ---")
        payload = {
            "branch_id": branch_id,
            "class_id": class_id,
            "fee_head_id": tuition_head['id'],
            "term": "Term 1",
            "amount": 50000.0,
            "is_active": True
        }
        r = requests.post(f"{BASE_URL}/api/fee-structures", json=payload, headers=headers)
        r.raise_for_status()
        fs = r.json()
        print(f"Created Fee Structure ID: {fs['id']} - Amount: {fs['amount']}")
        
        print("--- POST /api/admissions (Full Fee) ---")
        payload = {
            "name": "Discount Test Admission",
            "class_id": class_id,
            "parent_name": "Test Parent 99",
            "primary_phone": "999-000-8888",
            "status": "ENQUIRY",
            "payment_preference": "Full Fee"
        }
        r = requests.post(f"{BASE_URL}/api/admissions", json=payload, headers=headers)
        r.raise_for_status()
        adm = r.json()
        
        print("--- PUT /api/admissions (Convert to ADMITTED) ---")
        r = requests.put(f"{BASE_URL}/api/admissions/{adm['id']}", json={"status": "ADMITTED", "payment_preference": "Full Fee"}, headers=headers)
        r.raise_for_status()
        
        print("--- GET /api/student-fee-assignments ---")
        r = requests.get(f"{BASE_URL}/api/student-fee-assignments?student_id={adm['id']}", headers=headers)
        assignments = r.json()
        print(json.dumps(assignments, indent=2))

    except Exception as e:
        print("API Test Failed:", e)
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)

test_workflow()
