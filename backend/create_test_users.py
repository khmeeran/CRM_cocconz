import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal
import models
from main import get_password_hash

def ensure_users():
    db = SessionLocal()
    roles = {
        "superadmin": "ADMIN",
        "branchadmin": "OFFICE",
        "accountant": "ACCOUNTANT",
        "teacher": "TEACHER"
    }

    print("Checking Test Accounts...")
    for username, role in roles.items():
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            print(f"Creating user {username} with role {role}...")
            user = models.User(
                id=username + "_id",
                username=username,
                password_hash=get_password_hash("Testing@123!"),
                role=role
            )
            db.add(user)
        else:
            print(f"User {username} already exists with role {user.role}. Resetting password.")
            user.password_hash = get_password_hash("Testing@123!")
            user.role = role
    
    db.commit()
    print("Done checking/creating users.")
    db.close()

if __name__ == "__main__":
    ensure_users()
