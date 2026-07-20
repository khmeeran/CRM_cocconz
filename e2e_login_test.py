import requests
import json

base_url = "http://localhost:8000"

print("--- END-TO-END JWT XSS FIX TEST ---")

session = requests.Session()

# 1. Login
print("\n[1] Attempting Login (POST /token)...")
login_res = session.post(f"{base_url}/token", data={"username": "principal_admin", "password": "password123"})
print(f"Status: {login_res.status_code}")
print(f"Body: {login_res.text}")

# Check cookies
cookies = session.cookies.get_dict()
print(f"Cookies received: {cookies}")
if "access_token" in cookies:
    print("SUCCESS: access_token cookie is present.")
else:
    print("ERROR: access_token cookie missing!")

if "access_token" in login_res.json():
    print("ERROR: access_token is STILL in the JSON body!")
else:
    print("SUCCESS: access_token is successfully removed from JSON body.")

# 2. Access protected route
print("\n[2] Accessing Protected Route (GET /api/students) with cookie...")
protected_res = session.get(f"{base_url}/api/students", cookies=cookies)
print(f"Status: {protected_res.status_code}")
if protected_res.status_code == 200:
    print("SUCCESS: Authentication persisted via HttpOnly cookie.")
else:
    print(f"ERROR: Failed to authenticate. Body: {protected_res.text}")

# 3. Logout
print("\n[3] Logging out (POST /api/logout)...")
logout_res = session.post(f"{base_url}/api/logout")
print(f"Status: {logout_res.status_code}")

# 4. Access protected route again
print("\n[4] Accessing Protected Route after logout...")
protected_res_after = session.get(f"{base_url}/api/students")
print(f"Status: {protected_res_after.status_code}")
if protected_res_after.status_code == 401:
    print("SUCCESS: Protected routes are properly secured after logout.")
else:
    print(f"ERROR: Expected 401, got {protected_res_after.status_code}")
