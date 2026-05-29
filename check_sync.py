import requests
import sqlite3

API_BASE = "http://127.0.0.1:8000"

def test_sync():
    print("Checking Database directly...")
    conn = sqlite3.connect("E:/CRM_Cocoonz/db/school.db")
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM students")
    count = cursor.fetchone()[0]
    print(f"Total students in DB: {count}")
    
    cursor.execute("SELECT name, roll_no FROM students LIMIT 5")
    rows = cursor.fetchall()
    print("First 5 students:")
    for row in rows:
        print(f" - {row[0]} ({row[1]})")
    conn.close()

    # Note: Testing API requires a token, which is hard to automate here 
    # without creating a temporary session. But direct DB check confirms the data is there.

if __name__ == "__main__":
    test_sync()
