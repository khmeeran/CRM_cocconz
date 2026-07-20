import requests
import os
import subprocess

base_url = "http://localhost:8000"

print("--- END-TO-END ROLE-BASED AUTHENTICATION TEST ---")

def test_role(username, password, expect_users_success):
    print(f"\n--- Testing Role: {username} ---")
    session = requests.Session()
    
    login_res = session.post(f"{base_url}/token", data={"username": username, "password": password})
    if login_res.status_code != 200:
        print(f"FAILED to login as {username}")
        return
        
    cookies = session.cookies.get_dict()
    print("Login successful. Checking routes...")
    
    res_students = session.get(f"{base_url}/api/students", cookies=cookies)
    print(f"GET /api/students -> {res_students.status_code}")
    
    res_users = session.get(f"{base_url}/api/users", cookies=cookies)
    print(f"GET /api/users -> {res_users.status_code}")
    if (res_users.status_code == 200) == expect_users_success:
        print(f"SUCCESS: Authorization restriction behaved as expected for /api/users.")
    else:
        print(f"ERROR: Authorization behaved incorrectly. Expected {expect_users_success}, got {res_users.status_code == 200}")

    tampered = cookies["access_token"][:-5] + "XXXXX"
    res_tampered = session.get(f"{base_url}/api/students", cookies={"access_token": tampered})
    if res_tampered.status_code == 401:
        print("SUCCESS: Tampered JWT correctly rejected with 401.")
    
    res_logout = session.post(f"{base_url}/api/logout")
    res_post_logout = session.get(f"{base_url}/api/students")
    if res_logout.status_code == 200 and res_post_logout.status_code == 401:
        print("SUCCESS: Logout successfully invalidated session.")

print("Seeding database with test users...")
seed_script = """
from main import get_db, get_password_hash
from models import User
db = next(get_db())
users = [('test_office', 'OFFICE'), ('test_accountant', 'ACCOUNTANT'), ('test_teacher', 'TEACHER')]
for u, r in users:
    if not db.query(User).filter_by(username=u).first():
        db.add(User(username=u, password_hash=get_password_hash('password123'), role=r))
db.commit()
"""
with open("temp_seed.py", "w") as f:
    f.write(seed_script)
subprocess.run(["docker", "cp", "temp_seed.py", "crm_cocoonz-backend-1:/app/temp_seed.py"])
subprocess.run(["docker", "exec", "-w", "/app", "crm_cocoonz-backend-1", "python", "temp_seed.py"])
os.remove("temp_seed.py")

test_role("principal_admin", "password123", True)
test_role("test_office", "password123", False)
test_role("test_accountant", "password123", False)
test_role("test_teacher", "password123", False)
