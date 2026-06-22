import requests

BASE_URL = "http://127.0.0.1:8000"

# 1. Login
login_data = {
    "username": "admin",
    "password": "AdminReset2026!"
}
resp = requests.post(f"{BASE_URL}/token", data=login_data)
if resp.status_code != 200:
    print("Login failed:", resp.text)
    exit(1)

token = resp.json().get("access_token")
headers = {"Authorization": f"Bearer {token}"}

# 2. Get current branches
branches_resp = requests.get(f"{BASE_URL}/api/branches", headers=headers)
if branches_resp.status_code == 200:
    current_branches = branches_resp.json()
    print("Current branches:", len(current_branches))
else:
    print("Failed to get branches:", branches_resp.text)
    current_branches = []

existing_names = [b['name'] for b in current_branches]

# 3. Add branches
branches = [
    {'name': 'SP Kovil Branch 1', 'code': 'BR_SPK', 'address': '10 School Road, SP Kovil, Chennai', 'is_active': True},
    {'name': 'Vandalur Branch 2', 'code': 'BR_VAN', 'address': '25 G.S.T Road, Vandalur, Chennai', 'is_active': True},
    {'name': 'Adyar Branch 3', 'code': 'BR_ADY', 'address': '15 Adyar Main Road, Adyar, Chennai', 'is_active': True}
]

for b in branches:
    if b['name'] not in existing_names:
        r = requests.post(f"{BASE_URL}/api/branches", json=b, headers=headers)
        if r.status_code == 200:
            print(f"Added {b['name']}")
        else:
            print(f"Failed to add {b['name']}: {r.text}")
    else:
        print(f"Already exists via API: {b['name']}")
