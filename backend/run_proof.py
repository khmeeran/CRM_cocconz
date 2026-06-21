import requests

BASE_URL = 'http://127.0.0.1:8000'

try:
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    r = requests.post(f"{BASE_URL}/api/seed-fee-heads", headers=headers)
    print("Seed Fee Heads:", r.status_code, r.text)

    r = requests.get(f"{BASE_URL}/api/classes", headers=headers)
    if not r.json():
        # Create a class if none
        c = requests.post(f"{BASE_URL}/api/classes", json={"name":"Class 1", "section":"A"}, headers=headers).json()
        class_id = c['id']
    else:
        class_id = r.json()[0]['id']

    r = requests.get(f"{BASE_URL}/api/branches", headers=headers)
    if not r.json():
        b = requests.post(f"{BASE_URL}/api/branches", json={"name":"Main", "code":"MN"}, headers=headers).json()
        branch_id = b['id']
    else:
        branch_id = r.json()[0]['id']

    heads = requests.get(f"{BASE_URL}/api/fee-heads", headers=headers).json()
    tuition = next(h for h in heads if h['name'] == 'Tuition Fee')

    payload = {
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_head_id": tuition['id'],
        "term": "Term 1",
        "amount": 50000.0,
        "is_active": True
    }
    r = requests.post(f"{BASE_URL}/api/fee-structures", json=payload, headers=headers)
    print("Create Fee Structure:", r.status_code, r.text)

    payload = {
        "name": "Discount Test Admission",
        "class_id": class_id,
        "parent_name": "Test Parent 99",
        "primary_phone": "999-000-8888",
        "status": "ENQUIRY",
        "payment_preference": "Full Fee"
    }
    r = requests.post(f"{BASE_URL}/api/admissions", json=payload, headers=headers)
    print("Create Admission:", r.status_code, r.text)
    adm = r.json()

    r = requests.put(f"{BASE_URL}/api/admissions/{adm['id']}", json={"status": "ADMITTED", "payment_preference": "Full Fee"}, headers=headers)
    print("Convert to ADMITTED:", r.status_code, r.text)

    r = requests.get(f"{BASE_URL}/api/student-fee-assignments?student_id={adm['id']}", headers=headers)
    print("Assignments:", r.status_code, r.text)
    
except Exception as e:
    print(e)
