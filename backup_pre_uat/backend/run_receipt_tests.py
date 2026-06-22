import requests
import json
import base64

BASE_URL = 'http://127.0.0.1:8000'

try:
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Fetch receipts list
    rect_list_r = requests.get(f"{BASE_URL}/api/receipts", headers=headers)
    rects = rect_list_r.json()
    print("Receipt List Status:", rect_list_r.status_code)
    print("Receipt 0:", json.dumps(rects[0], indent=2))
    
    rect_no = rects[0]['receipt_no']
    
    # Fetch PDF
    pdf_r = requests.get(f"{BASE_URL}/api/receipt/{rect_no}/pdf", headers=headers)
    print("PDF Status:", pdf_r.status_code)
    print("PDF Content Type:", pdf_r.headers.get('Content-Type'))
    print("PDF Content Length:", len(pdf_r.content), "bytes")
    
except Exception as e:
    print("Error:", e)
