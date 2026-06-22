import requests

BASE_URL = 'http://127.0.0.1:8000'

try:
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    
    r = requests.post(f"{BASE_URL}/api/seed-fee-heads", headers=headers)
    print("Seed Fee Heads:", r.status_code, r.text)

    r = requests.get(f"{BASE_URL}/api/fee-heads", headers=headers)
    print("Get Fee Heads:", r.status_code, r.text)

    r = requests.get(f"{BASE_URL}/api/classes", headers=headers)
    class_id = r.json()[0]['id']

    r = requests.get(f"{BASE_URL}/api/branches", headers=headers)
    branch_id = r.json()[0]['id']

    payload = {
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_head_id": "dummy_if_not_found", # Need to fix this
        "term": "Term 1",
        "amount": 50000.0,
        "is_active": True
    }
    
    heads = requests.get(f"{BASE_URL}/api/fee-heads", headers=headers).json()
    tuition = next(h for h in heads if h['name'] == 'Tuition Fee')
    payload['fee_head_id'] = tuition['id']

    r = requests.post(f"{BASE_URL}/api/fee-structures", json=payload, headers=headers)
    print("Create Fee Structure:", r.status_code, r.text)
    
except Exception as e:
    print(e)
