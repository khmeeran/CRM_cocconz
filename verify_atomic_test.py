import requests
import uuid
import subprocess
import time

base_url = "http://localhost:8000"

print("--- END-TO-END ATOMICITY VERIFICATION ---")

session = requests.Session()
login = session.post(f"{base_url}/token", data={"username": "principal_admin", "password": "password123"})
cookies = session.cookies.get_dict()

classes_res = session.get(f"{base_url}/api/classes", cookies=cookies)
class_id = classes_res.json()[0]['id']

unique_phone = f"999{uuid.uuid4().hex[:7]}"

print("1. Submitting admission request designed to fail mid-flight...")
payload = {
    "name": "FAIL_TRANSACTION",
    "roll_no": f"R{uuid.uuid4().hex[:4]}",
    "class_id": class_id,
    "parent": {
        "father_name": "Ghost Father",
        "mother_name": "Ghost Mother",
        "primary_phone": unique_phone
    },
    "date_of_admission": "2024-01-01"
}

res = session.post(f"{base_url}/api/students", json=payload, cookies=cookies)
print(f"Admission Status: {res.status_code}")

print("\n2. Querying the database to ensure ROLLBACK occurred...")

check_script = f"""
from main import get_db
from models import Parent, Student, FeeSummary
db = next(get_db())

parent = db.query(Parent).filter(Parent.primary_phone == "{unique_phone}").first()
if parent:
    print("ERROR: Orphaned Parent found in database! (ID: " + str(parent.id) + ")")
else:
    print("SUCCESS: Parent was correctly rolled back.")

student = db.query(Student).filter(Student.name == "FAIL_TRANSACTION").first()
if student:
    print("ERROR: Orphaned Student found in database! (ID: " + str(student.id) + ")")
else:
    print("SUCCESS: Student was correctly rolled back.")
"""
with open("temp_atomic.py", "w") as f:
    f.write(check_script)
subprocess.run(["docker", "cp", "temp_atomic.py", "crm_cocoonz-backend-1:/app/temp_atomic.py"])
res_check = subprocess.run(["docker", "exec", "-w", "/app", "crm_cocoonz-backend-1", "python", "temp_atomic.py"], capture_output=True, text=True)
print(res_check.stdout)
