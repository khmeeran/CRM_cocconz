import os
import io
import sys
import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
import uuid
import datetime

# Override environment for testing
test_db_path = os.path.join(os.path.dirname(__file__), "test.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"
os.environ["SECRET_KEY"] = "supersecretkey32charsminblablablabla"
os.environ["ENV"] = "production" # to skip create_all locally if we want, but wait, if it's production, it skips create_all.
os.environ["ENV"] = "development" # so it creates tables

# Add current dir to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import main
import models
import database
import schemas
from database import engine, SessionLocal

# Re-create tables
models.Base.metadata.create_all(bind=engine)

# Setup test client
client = TestClient(main.app)

def mock_get_password_hash(pwd):
    return "mock_hash"

main.get_password_hash = mock_get_password_hash
main.verify_password = lambda p, h: True

def create_admin_user():
    db = SessionLocal()
    user = models.User(id="admin_id", username="admin", password_hash="mock_hash", role="ADMIN")
    db.add(user)
    db.commit()
    db.close()
    return main.create_access_token({"sub": "admin"})

admin_token = create_admin_user()
headers = {"Authorization": f"Bearer {admin_token}", "X-CSRF-Token": "test"}

# Also patch CSRF check for test client
main.app.dependency_overrides[main.get_current_user] = lambda: models.User(id="admin_id", username="admin", role="ADMIN")

print("--- STARTING VALIDATION ---")

# 1. PATH TRAVERSAL VALIDATION
print("\n--- Validating Path Traversal ---")
filename = "../../../test_traversal.txt"
file_content = b"hacked"
files = {"file": (filename, file_content, "text/plain")}

# Create a dummy CSRF token and set it in cookies and headers
test_csrf = "dummycsrf"
client.cookies.set("csrf_token", test_csrf)
upload_headers = {"X-CSRF-Token": test_csrf}

response = client.post("/api/upload", files=files, headers=upload_headers)
print(f"Upload Response: {response.status_code}, {response.json()}")

test_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads", filename))
if os.path.exists(test_file_path):
    print(f"[VULNERABILITY CONFIRMED] File written to {test_file_path}")
    os.remove(test_file_path)
else:
    print(f"[FALSE POSITIVE] Path traversal prevented. Path: {test_file_path}")


# 2. CONCURRENCY VALIDATION (RACE CONDITION IN FEES)
print("\n--- Validating Race Condition ---")
db = SessionLocal()
cls = models.Class(id="c1", name="10", section="A")
parent = models.Parent(id="p1", primary_phone="1234567890")
student = models.Student(id="s1", name="John", roll_no="1", class_id="c1", parent_id="p1")
fee_summary = models.FeeSummary(student_id="s1", total_amount=1000, paid_amount=0, pending_balance=1000)

db.add_all([cls, parent, student, fee_summary])
db.commit()
db.close()

def pay_fee():
    db = SessionLocal()
    # Direct function call simulation to replicate endpoint behavior with same session issue
    payment = schemas.PaymentCreate(student_id="s1", amount=10, payment_mode="CASH")
    try:
        # Replicate code in /api/fees/pay
        db_payment = models.PaymentHistory(
            student_id=payment.student_id,
            amount=payment.amount,
            payment_mode=payment.payment_mode,
            receipt_no=payment.receipt_no
        )
        db.add(db_payment)
        
        fee_summary = db.query(models.FeeSummary).filter(models.FeeSummary.student_id == payment.student_id).first()
        if fee_summary:
            # Sleep tiny bit to force race condition overlap
            import time; time.sleep(0.01)
            fee_summary.paid_amount += payment.amount
            fee_summary.pending_balance -= payment.amount
            
        ledger_entry = models.GeneralLedger(
            transaction_type='INCOME',
            category='FEE',
            amount=payment.amount,
            description="Fee",
        )
        db.add(ledger_entry)
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

with ThreadPoolExecutor(max_workers=50) as executor:
    futures = [executor.submit(pay_fee) for _ in range(50)]
    for f in futures:
        f.result()

db = SessionLocal()
final_fees = db.query(models.FeeSummary).filter(models.FeeSummary.student_id == "s1").first()
payments_count = db.query(models.PaymentHistory).filter(models.PaymentHistory.student_id == "s1").count()

print(f"Total payments made: {payments_count} (Expected 50)")
print(f"Expected final balance: {1000 - (50*10)} = 500")
print(f"Actual final balance: {final_fees.pending_balance}")
if final_fees.pending_balance > 500:
    print("[VULNERABILITY CONFIRMED] Lost update detected due to missing row lock.")
else:
    print("[FALSE POSITIVE] No race condition detected.")

db.close()


# 3. N+1 QUERY VALIDATION
print("\n--- Validating N+1 Query ---")
import logging
# Enable SQLAlchemy logging to count queries
logging.basicConfig()
logger = logging.getLogger('sqlalchemy.engine')
logger.setLevel(logging.INFO)

# Stream to string
log_stream = io.StringIO()
handler = logging.StreamHandler(log_stream)
logger.addHandler(handler)

db = SessionLocal()
for i in range(10):
    p = models.Parent(id=f"p_n1_{i}", primary_phone=f"111{i}")
    s = models.Student(id=f"s_n1_{i}", name=f"Stu {i}", roll_no=f"R{i}", class_id="c1", parent_id=f"p_n1_{i}")
    f = models.FeeSummary(student_id=f"s_n1_{i}", total_amount=100, pending_balance=100)
    db.add_all([p, s, f])
db.commit()
db.close()

# Clear log stream
log_stream.truncate(0)
log_stream.seek(0)

# Call endpoint
response = client.get("/api/students")
log_output = log_stream.getvalue()
queries = [line for line in log_output.split('\n') if "SELECT" in line]

print(f"Number of students fetched: {len(response.json())}")
print(f"Number of SELECT queries executed: {len(queries)}")
if len(queries) > 2:
    print(f"[VULNERABILITY CONFIRMED] N+1 Queries detected. Found {len(queries)} queries.")
else:
    print("[FALSE POSITIVE] No N+1 query issue.")

logger.removeHandler(handler)

