import requests
import json
from datetime import date

BASE_URL = 'http://127.0.0.1:8000'

try:
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    print("--- DAILY REPORT JSON ---")
    today = date.today().isoformat()
    daily_r = requests.get(f"{BASE_URL}/api/reports/daily?date_str={today}", headers=headers)
    print(json.dumps(daily_r.json(), indent=2))

    print("--- MONTHLY REPORT JSON ---")
    monthly_r = requests.get(f"{BASE_URL}/api/reports/monthly", headers=headers)
    print(json.dumps(monthly_r.json(), indent=2))
    
    print("--- OUTSTANDING REPORT PDF EXPORT ---")
    out_pdf_r = requests.get(f"{BASE_URL}/api/reports/outstanding?export=pdf", headers=headers)
    print("Status:", out_pdf_r.status_code, "Length:", len(out_pdf_r.content))

except Exception as e:
    print("Error:", e)
