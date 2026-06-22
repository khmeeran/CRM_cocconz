import requests

BASE_URL = 'http://127.0.0.1:8000'

try:
    r = requests.post(f"{BASE_URL}/token", data={"username": "admin", "password": "AdminReset2026!"})
    token = r.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    # Find the dummy student we created earlier
    st_r = requests.get(f"{BASE_URL}/api/students", headers=headers).json()
    student = next(s for s in st_r if s['name'] == 'Discount Test Admission')
    
    # Get outstanding
    out_r = requests.get(f"{BASE_URL}/api/students/{student['id']}/outstanding", headers=headers).json()
    print("Initial Outstanding:", out_r['total_balance'])
    
    tuition = next(a for a in out_r['assignments'] if a['fee_head_name'] == 'Tuition Fee')
    print("Tuition Balance Before:", tuition['balance'])
    
    # Pay 20000
    pay_payload = {
        "student_id": student['id'],
        "assignment_id": tuition['assignment_id'],
        "fee_head_id": tuition['fee_head_id'],
        "amount": 20000,
        "payment_mode": "UPI"
    }
    pay_r = requests.post(f"{BASE_URL}/api/collections", json=pay_payload, headers=headers).json()
    print("Payment response:", pay_r)

    # Pay 50000 (Overpayment to test rejection)
    pay_payload['amount'] = 50000
    pay_fail = requests.post(f"{BASE_URL}/api/collections", json=pay_payload, headers=headers)
    print("Overpayment response (should fail):", pay_fail.status_code, pay_fail.text)
    
    # Get outstanding again
    out_r2 = requests.get(f"{BASE_URL}/api/students/{student['id']}/outstanding", headers=headers).json()
    tuition2 = next(a for a in out_r2['assignments'] if a['fee_head_name'] == 'Tuition Fee')
    print("Tuition Balance After:", tuition2['balance'])
    
    # Get Ledger
    led_r = requests.get(f"{BASE_URL}/api/students/{student['id']}/ledger", headers=headers).json()
    print("Ledger:", led_r[0]['amount'])
    
except Exception as e:
    print(e)
