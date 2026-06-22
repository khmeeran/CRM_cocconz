import requests
import json
import sqlite3
import uuid

BASE_URL = 'http://127.0.0.1:8000'

print("=== PHASE U1: AUTHENTICATION AUDIT ===")
# 1. Invalid Password
res_inv_pass = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "WrongPassword!"})
print(f"Invalid Password: {res_inv_pass.status_code}")

# 2. Missing Token
res_miss_token = requests.get(f"{BASE_URL}/api/students")
print(f"Missing Token: {res_miss_token.status_code}")

# 3. Invalid Token
headers_inv = {"Authorization": "Bearer INVALID_TOKEN_ABC123"}
res_inv_token = requests.get(f"{BASE_URL}/api/students", headers=headers_inv)
print(f"Invalid Token: {res_inv_token.status_code}")

# 4. Valid Login
res_login = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
token = res_login.json().get('access_token')
headers = {"Authorization": f"Bearer {token}"}
print(f"Valid Login: {res_login.status_code}")

print("\n=== PHASE U3: FULL WORKFLOW AUDIT ===")
try:
    # 1. Enquiry
    enq_payload = {"name": "UAT Test Student", "parent_name": "UAT Parent", "phone": "9998887776", "class_requested": "Pre-KG"}
    enq_res = requests.post(f"{BASE_URL}/api/admissions", json=enq_payload, headers=headers).json()
    enq_id = enq_res.get('id')
    print(f"Enquiry Created: {enq_id}")

    # 2. Admission (Convert to ADMITTED)
    adm_payload = {**enq_res, "status": "ADMITTED"}
    adm_res = requests.put(f"{BASE_URL}/api/admissions/{enq_id}", json=adm_payload, headers=headers).json()
    print("Converted to Admitted:", adm_res.get('status'))

    # 3. Student (Find in students)
    stu_res = requests.get(f"{BASE_URL}/api/students", headers=headers).json()
    student = next(s for s in stu_res if s['name'] == 'UAT Test Student')
    print(f"Student Created: {student['id']}")

    # 4. Fee Assignment (Automatically done inside DB/api when admitted depending on phase 2C/D?)
    # Wait, our Phase 2C required a manual POST to /api/fee-structures? Let's check outstanding.
    out_res = requests.get(f"{BASE_URL}/api/students/{student['id']}/outstanding", headers=headers).json()
    total_due = out_res.get('total_due', 0)
    print(f"Total Due Assigned: {total_due}")

    # 5. Collection (If due exists, pay it)
    if out_res.get('assignments'):
        a = out_res['assignments'][0]
        pay_payload = {
            "student_id": student['id'],
            "assignment_id": a['assignment_id'],
            "fee_head_id": a['fee_head_id'],
            "amount": a['balance'],
            "payment_mode": "BANK"
        }
        pay_res = requests.post(f"{BASE_URL}/api/collections", json=pay_payload, headers=headers).json()
        print(f"Collection Success: {pay_res.get('receipt_no')}")
        
        # 6. Receipt
        rect_no = pay_res.get('receipt_no')
        rect_res = requests.get(f"{BASE_URL}/api/receipts/{rect_no}", headers=headers).json()
        print(f"Receipt Validated: {rect_res['amount_paid']} / Balance: {rect_res['balance_remaining']}")
        
        # 7. Due Check again
        out_res2 = requests.get(f"{BASE_URL}/api/students/{student['id']}/outstanding", headers=headers).json()
        print(f"Final Due Balance: {out_res2.get('total_balance')}")
except Exception as e:
    print("Error in Workflow:", e)
