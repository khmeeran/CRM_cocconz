from passlib.context import CryptContext
import sqlite3

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
new_hash = pwd_context.hash("AdminReset2026!")

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET password_hash = ? WHERE username = 'admin'", (new_hash,))
conn.commit()
print("Password reset successful!")
