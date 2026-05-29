import sqlite3
from passlib.context import CryptContext
import uuid

db_path = "E:/CRM_Cocoonz/db/school.db"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def create_admin():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Ensure users table exists (in case main.py hasn't run yet)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT,
        role TEXT
    )
    """)
    
    username = "admin"
    password = "password123"
    role = "ADMIN"
    password_hash = get_password_hash(password)
    user_id = str(uuid.uuid4())
    
    try:
        cursor.execute("INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)",
                       (user_id, username, password_hash, role))
        conn.commit()
        print(f"Admin user created: {username} / {password}")
    except sqlite3.IntegrityError:
        cursor.execute("UPDATE users SET password_hash = ? WHERE username = ?", (password_hash, username))
        conn.commit()
        print(f"Admin user password updated: {username} / {password}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_admin()
