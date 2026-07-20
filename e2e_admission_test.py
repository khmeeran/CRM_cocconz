import requests
import uuid

base_url = "http://localhost:8000"

print("--- END-TO-END ADMISSION (SERVER-SIDE PRICING) TEST ---")

session = requests.Session()
login = session.post(f"{base_url}/token", data={"username": "principal_admin", "password": "password123"})
if login.status_code != 200:
    print("Failed to login.")
    exit(1)

cookies = session.cookies.get_dict()

import subprocess
print("Seeding a Class...")
script = """
from main import get_db
from models import Class
import uuid
db = next(get_db())
if not db.query(Class).first():
    db.add(Class(id=str(uuid.uuid4()), name="Test Class", section="A", division="Primary"))
    db.commit()
"""
with open("temp_class.py", "w") as f:
    f.write(script)
subprocess.run(["docker", "cp", "temp_class.py", "crm_cocoonz-backend-1:/app/temp_class.py"])
subprocess.run(["docker", "exec", "-w", "/app", "crm_cocoonz-backend-1", "python", "temp_class.py"])

# First get a valid class_id
classes_res = session.get(f"{base_url}/api/classes", cookies=cookies)
if classes_res.status_code != 200 or not classes_res.json():
    print("Failed to fetch classes or no classes available.")
    exit(1)

class_id = classes_res.json()[0]['id']

# Create a FeeStructure entry for this class directly
fee_amount = 55000.00
import subprocess
print("Creating FeeStructure for the class...")
script = f"""
from main import get_db
from models import FeeStructure, FeeHead
import uuid
db = next(get_db())

# Ensure a branch exists
from models import Branch
branch = db.query(Branch).first()
if not branch:
    branch = Branch(id=str(uuid.uuid4()), name="Test Branch", code="TB", address="Test")
    db.add(branch)
    db.commit()

# Ensure a fee head exists
head = db.query(FeeHead).first()
if not head:
    head = FeeHead(id=str(uuid.uuid4()), name="Tuition Fee")
    db.add(head)
    db.commit()

# Create fee structure
fee = FeeStructure(id=str(uuid.uuid4()), branch_id=branch.id, class_id=f"{class_id}", fee_head_id=head.id, amount={fee_amount})
db.add(fee)
db.commit()
"""
with open("temp_fee.py", "w") as f:
    f.write(script)
subprocess.run(["docker", "cp", "temp_fee.py", "crm_cocoonz-backend-1:/app/temp_fee.py"])
subprocess.run(["docker", "exec", "-w", "/app", "crm_cocoonz-backend-1", "python", "temp_fee.py"])

print("Submitting Admission payload without total_fees...")
payload = {
    "name": "Test Student Logic",
    "roll_no": f"R{uuid.uuid4().hex[:4]}",
    "class_id": class_id,
    "parent": {
        "father_name": "Test Father",
        "mother_name": "Test Mother",
        "primary_phone": f"999{uuid.uuid4().hex[:7]}"
    },
    "date_of_admission": "2024-01-01"
}

res = session.post(f"{base_url}/api/students", json=payload, cookies=cookies)
print(f"Admission Status: {res.status_code}")
if res.status_code != 200:
    print(res.text)
    exit(1)

student_id = res.json()["id"]
print(f"Student created: {student_id}")

print("Verifying Server-Side Fee Calculation...")
fees_res = session.get(f"{base_url}/api/students", cookies=cookies)
students = fees_res.json()
created_student = next((s for s in students if s['id'] == student_id), None)

if not created_student:
    print("ERROR: Student not found in list.")
    exit(1)

total_amount = float(created_student.get("pending_balance", 0))

print(f"Total Amount Assigned: {total_amount}")
if total_amount >= fee_amount: # Can be larger if previous fee structures exist
    print("SUCCESS: Server-side pricing correctly assigned the fee balance without client trust.")
else:
    print("ERROR: Total amount assigned does not match FeeStructure!")

