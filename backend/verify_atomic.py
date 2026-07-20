from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import bcrypt
import json
import requests

engine = create_engine("postgresql://user:password@localhost:5432/school_db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

from models import User
from main import get_password_hash

# create a test admin
user = db.query(User).filter(User.username == "test_admin2").first()
if not user:
    user = User(username="test_admin2", password_hash=get_password_hash("test_password"), role="ADMIN")
    db.add(user)
    db.commit()

# Authenticate
res = requests.post("http://localhost:8000/token", data={"username": "test_admin2", "password": "test_password"})
token = res.json()["access_token"]

# Create class
headers = {"Authorization": f"Bearer {token}"}
cls_res = requests.post("http://localhost:8000/api/classes", headers=headers, json={"name": "Test Class", "section": "A"})
class_id = cls_res.json()["id"]

# Create student
student_payload = {
    "name": "Atomic Test Student",
    "roll_no": "ATOMIC001",
    "class_id": class_id,
    "total_fees": 15000,
    "parent": {
        "primary_phone": "9998887771",
        "father_name": "Atomic Dad"
    }
}

print(f"REQUEST PAYLOAD: {json.dumps(student_payload, indent=2)}")
stud_res = requests.post("http://localhost:8000/api/students", headers=headers, json=student_payload)
print(f"RESPONSE [{stud_res.status_code}]: {json.dumps(stud_res.json(), indent=2)}")

