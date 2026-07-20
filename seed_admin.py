from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from main import get_password_hash

engine = create_engine("postgresql://cocoonz_admin:SuperSecretPassword2026!@localhost:5432/school_db")
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

user = db.query(User).filter(User.username == "principal_admin").first()
if not user:
    user = User(username="principal_admin", password_hash=get_password_hash("password123"), role="ADMIN")
    db.add(user)
    db.commit()
    print("Admin seeded.")
else:
    user.password_hash = get_password_hash("password123")
    db.commit()
    print("Admin password reset.")
