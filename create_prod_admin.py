import sys
sys.path.append("./backend")
from database import SessionLocal
from models import User
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

username = "principal_admin"
password = "password123"

# Check if exists
user = db.query(User).filter(User.username == username).first()
if user:
    user.password_hash = pwd_context.hash(password)
    print(f"Updated password for {username}")
else:
    user = User(
        username=username,
        password_hash=pwd_context.hash(password),
        role="ADMIN"
    )
    db.add(user)
    print(f"Created {username}")

db.commit()
db.close()
print("Done")
