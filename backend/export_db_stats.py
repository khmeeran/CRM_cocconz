import sqlite3

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence'")
tables = [r[0] for r in cursor.fetchall()]

print("TABLE COUNTS:")
for t in tables:
    cursor.execute(f"SELECT COUNT(*) FROM {t}")
    count = cursor.fetchone()[0]
    print(f"{t}: {count}")

conn.close()
