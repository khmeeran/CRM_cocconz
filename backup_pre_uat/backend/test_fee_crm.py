import sys
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import decimal

# Setup python path to find backend modules
sys.path.insert(0, os.path.dirname(__file__))

os.environ["SECRET_KEY"] = "supersecretkey32charsminblablablabla"
os.environ["ENV"] = "development"

# Setup testing DB path
test_db_path = os.path.join(os.path.dirname(__file__), "test_crm_suite.db")
if os.path.exists(test_db_path):
    try:
        os.remove(test_db_path)
    except Exception:
        pass
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

import main
import models
from database import get_db

# Shared state across sequential tests
test_admin_password = "password123"
token = None
headers = {}
branch_id = None
class_id = None
student_id = None
tuition_due_id = None
admission_due_id = None
receipt_number = None

@pytest.fixture(scope="module")
def client():
    # Make sure DB schema is created
    models.Base.metadata.create_all(bind=main.engine)
    
    # Run startup seeding to populate roles, fee heads
    main.startup_seeding()
    
    # Manually overwrite default admin password for testing reproducibility
    db = next(get_db())
    admin = db.query(models.User).filter(models.User.username == "admin").first()
    if admin:
        admin.password_hash = main.pwd_context.hash(test_admin_password)
        db.commit()
    db.close()
        
    with TestClient(main.app) as c:
        yield c
        
    # Cleanup DB
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except Exception:
            pass

# 1. AUTHENTICATION TESTS
def test_login_validation_missing_username(client):
    res = client.post("/token", data={"password": "password123"})
    assert res.status_code == 422

def test_login_validation_missing_password(client):
    res = client.post("/token", data={"username": "admin"})
    assert res.status_code == 422

def test_login_invalid_credentials(client):
    res = client.post("/token", data={"username": "admin", "password": "wrongpassword"})
    assert res.status_code == 401
    assert "Incorrect username or password" in res.json()["detail"]

def test_login_success(client):
    global token, headers
    res = client.post("/token", data={"username": "admin", "password": test_admin_password})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "Super Admin"
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}", "X-CSRF-Token": "csrf_mock_val"}
    client.cookies.set("csrf_token", "csrf_mock_val")

# 2. BRANCH MANAGEMENT TESTS
def test_create_branch_validation(client):
    # Missing email and address
    bad_payload = {
        "name": "SP Kovil Branch 1",
        "contact_number": "+919876543210"
    }
    res = client.post("/api/branches", json=bad_payload, headers=headers)
    assert res.status_code == 422

def test_create_branch_success(client):
    global branch_id
    branch_payload = {
        "name": "SP Kovil Branch 1",
        "address": "10 School Road, SP Kovil, Chennai",
        "contact_number": "+919876543210",
        "email": "spkovil1@cocoonz.com",
        "status": "Active"
    }
    res = client.post("/api/branches", json=branch_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "SP Kovil Branch 1"
    assert "id" in data
    branch_id = data["id"]

def test_get_branches(client):
    res = client.get("/api/branches", headers=headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1
    assert any(b["id"] == branch_id for b in res.json())

def test_deactivate_branch(client):
    res = client.patch(f"/api/branches/{branch_id}/status", json={"status": "Inactive"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "Inactive"

def test_activate_branch(client):
    res = client.patch(f"/api/branches/{branch_id}/status", json={"status": "Active"}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "Active"

# 3. CLASS MANAGEMENT TESTS
def test_create_class(client):
    global class_id
    class_payload = {
        "name": "LKG",
        "section": "A",
        "academic_year": "2026-2027",
        "branch_id": branch_id
    }
    res = client.post("/api/classes", json=class_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["name"] == "LKG"
    assert data["section"] == "A"
    class_id = data["id"]

def test_create_duplicate_class(client):
    class_payload = {
        "name": "LKG",
        "section": "A",
        "academic_year": "2026-2027",
        "branch_id": branch_id
    }
    res = client.post("/api/classes", json=class_payload, headers=headers)
    assert res.status_code == 400
    assert "Class already exists" in res.json()["detail"]

def test_get_classes(client):
    res = client.get(f"/api/classes?branch_id={branch_id}", headers=headers)
    assert res.status_code == 200
    classes = res.json()
    assert len(classes) >= 1
    assert any(c["id"] == class_id for c in classes)

# 4. ADMISSIONS WORKFLOW TESTS
def test_create_enquiry_invalid(client):
    # Missing parent details
    enquiry_payload = {
        "student_name": "Rohan Kumar",
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_type": "Full Fee"
    }
    res = client.post("/api/admissions/enquiry", json=enquiry_payload, headers=headers)
    assert res.status_code == 400
    assert "Parent details are required" in res.json()["detail"]

def test_create_enquiry_success(client):
    global student_id
    enquiry_payload = {
        "student_name": "Rohan Kumar",
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_type": "Full Fee",
        "address": "No. 5 Lake View Road, Chennai",
        "parent": {
            "parent_name": "Suresh Kumar",
            "parent_contact_number": "+919988776655",
            "parent_email": "suresh@example.com",
            "address": "No. 5 Lake View Road, Chennai"
        }
    }
    res = client.post("/api/admissions/enquiry", json=enquiry_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Enquiry"
    assert data["student_name"] == "Rohan Kumar"
    student_id = data["id"]

def test_promote_to_registered(client):
    res = client.post(f"/api/admissions/{student_id}/register", json={"class_id": class_id}, headers=headers)
    assert res.status_code == 200
    assert res.json()["status"] == "Registered"

def test_promote_to_admitted_validation_error(client):
    # Promoting with wrong student_id
    res = client.post("/api/admissions/nonexistent_id/admit", json={"fee_type": "Full Fee"}, headers=headers)
    assert res.status_code == 404

def test_promote_to_admitted_success(client):
    admit_payload = {
        "fee_type": "Full Fee",
        "documents_url": ["/api/uploads/birth_certificate.pdf", "/api/uploads/aadhaar.pdf"]
    }
    res = client.post(f"/api/admissions/{student_id}/admit", json=admit_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "Admitted"
    assert data["fee_type"] == "Full Fee"

# 5. FEE STRUCTURE AND ASSIGNMENT TESTS
def test_create_fee_structures(client):
    # Fetch fee heads
    res = client.get("/api/fee-heads", headers=headers)
    assert res.status_code == 200
    fee_heads = res.json()
    
    tuition_head_id = next(h["id"] for h in fee_heads if h["name"] == "Tuition Fee")
    admission_head_id = next(h["id"] for h in fee_heads if h["name"] == "Admission Fee")
    
    tuition_structure = {
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_head_id": tuition_head_id,
        "amount": 20000.00,
        "academic_year": "2026-2027"
    }
    admission_structure = {
        "branch_id": branch_id,
        "class_id": class_id,
        "fee_head_id": admission_head_id,
        "amount": 5000.00,
        "academic_year": "2026-2027"
    }
    
    res1 = client.post("/api/fee-structures", json=tuition_structure, headers=headers)
    assert res1.status_code == 200
    res2 = client.post("/api/fee-structures", json=admission_structure, headers=headers)
    assert res2.status_code == 200

def test_assign_student_fees_and_discount(client):
    res = client.post(f"/api/students/{student_id}/assign-fee", json={}, headers=headers)
    assert res.status_code == 200
    mapping = res.json()
    # 5% discount on Tuition (20,000 * 0.05 = 1,000)
    # Total payable = 20,000 - 1,000 + 5,000 = 24,000
    assert float(mapping["discount"]) == 1000.00
    assert float(mapping["total_payable"]) == 24000.00
    assert float(mapping["outstanding_amount"]) == 24000.00

def test_get_outstanding_dues(client):
    global tuition_due_id, admission_due_id
    res = client.get(f"/api/dues?student_id={student_id}", headers=headers)
    assert res.status_code == 200
    dues = res.json()
    assert len(dues) == 2
    
    tuition_due = next(d for d in dues if d["fee_head"] == "Tuition Fee")
    admission_due = next(d for d in dues if d["fee_head"] == "Admission Fee")
    
    tuition_due_id = tuition_due["due_id"]
    admission_due_id = admission_due["due_id"]
    
    assert float(tuition_due["payable_amount"]) == 19000.00
    assert float(admission_due["payable_amount"]) == 5000.00

# 6. PAYMENT AND COLLECTION TESTS
def test_collect_payment_validation_overpay(client):
    collect_payload = {
        "student_id": student_id,
        "amount": 30000.00,  # exceeds 24,000
        "payment_mode": "UPI",
        "allocations": [
            {"student_fee_due_id": tuition_due_id, "amount": 30000.00}
        ]
    }
    res = client.post("/api/collections", json=collect_payload, headers=headers)
    assert res.status_code == 400
    assert "exceeds" in res.json()["detail"].lower()

def test_collect_partial_payment_success(client):
    global receipt_number
    collect_payload = {
        "student_id": student_id,
        "amount": 10000.00,
        "payment_mode": "UPI",
        "remarks": "Part payment of 10k",
        "allocations": [
            {"student_fee_due_id": tuition_due_id, "amount": 8000.00},
            {"student_fee_due_id": admission_due_id, "amount": 2000.00}
        ]
    }
    res = client.post("/api/collections", json=collect_payload, headers=headers)
    assert res.status_code == 200
    receipt = res.json()
    assert receipt["receipt_number"].startswith("REC-")
    receipt_number = receipt["receipt_number"]
    assert float(receipt["balance_amount"]) == 14000.00

def test_get_receipt_details(client):
    res = client.get(f"/api/receipts/{receipt_number}", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["receipt_number"] == receipt_number
    assert len(data["breakdown"]) == 2

# 7. DASHBOARD AND REPORTS TESTS
def test_dashboard_stats(client):
    res = client.get("/api/dashboard/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert float(data["todays_collection"]) == 10000.00
    assert float(data["outstanding_dues"]) == 14000.00

def test_reports_generation_json(client):
    report_types = ["daily-collection", "monthly-collection", "branch-collection", "class-collection", "outstanding-fees", "discounts", "student-list"]
    for rt in report_types:
        res = client.get(f"/api/reports/{rt}", headers=headers)
        assert res.status_code == 200
        assert type(res.json()) == list

def test_reports_generation_pdf(client):
    res = client.get("/api/reports/daily-collection?format=pdf", headers=headers)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"

# 8. NOTIFICATIONS AND AUDIT TESTS
def test_notifications_send(client):
    notify_payload = {
        "notification_type": "Fee Due Reminder",
        "channel": "WhatsApp",
        "student_ids": [student_id],
        "message_custom": "Friendly reminder: your outstanding balance is Rs. 14,000.00"
    }
    res = client.post("/api/notifications/send", json=notify_payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["messages_queued"] == 1

def test_audit_logs_exist(client):
    db = next(get_db())
    logs = db.query(models.AuditLog).all()
    assert len(logs) > 0
    actions = [log.action for log in logs]
    assert "CREATE_BRANCH" in actions or "CREATE_CLASS" in actions
    db.close()

def test_create_user_valid_role(client):
    user_payload = {
        "username": "new_accountant",
        "password": "securepassword123",
        "role": "Accountant",
        "email": "acct@cocoonz.com"
    }
    res = client.post("/api/users", json=user_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "new_accountant"
    assert data["role"] == "Accountant"

def test_create_user_invalid_role(client):
    user_payload = {
        "username": "custom_role_user",
        "password": "securepassword123",
        "role": "Custom Administrator Role",
        "email": "custom@cocoonz.com"
    }
    res = client.post("/api/users", json=user_payload, headers=headers)
    assert res.status_code == 400
    assert "Invalid role" in res.json()["detail"]
