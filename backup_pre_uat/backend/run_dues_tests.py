import requests
import sqlite3
from datetime import date, timedelta
import json

BASE_URL = 'http://127.0.0.1:8000'

try:
    # 1. First, artificially update a due date to make something OVERDUE
    conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
    cursor = conn.cursor()
    past_date = (date.today() - timedelta(days=5)).isoformat()
    cursor.execute("UPDATE student_fee_assignments SET due_date = ? WHERE final_amount > amount_paid", (past_date,))
    conn.commit()
    conn.close()

    # 2. Test APIs
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    print("--- DUES SUMMARY ---")
    sum_r = requests.get(f"{BASE_URL}/api/dues/summary", headers=headers)
    print(json.dumps(sum_r.json(), indent=2))

    print("--- FIRST DUE ROW ---")
    dues_r = requests.get(f"{BASE_URL}/api/dues", headers=headers)
    dues = dues_r.json()
    if dues:
        print(json.dumps(dues[0], indent=2))

except Exception as e:
    print("Error:", e)
