import time
import threading
import os
import sys
import statistics
import json
from concurrent.futures import ThreadPoolExecutor
from fastapi.testclient import TestClient

# Add backend to path
sys.path.insert(0, './backend')

# Set environment
os.environ["SECRET_KEY"] = "supersecretkey32charsminblablablabla"
os.environ["ENV"] = "development"
# Use a separate DB for load test
test_db_path = os.path.join(os.path.dirname(__file__), "loadtest.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

import main, models, database
from database import engine, SessionLocal

# Setup DB
models.Base.metadata.create_all(bind=engine)

client = TestClient(main.app)

# Seed Data (Medium density)
def seed_data(count=1000):
    db = SessionLocal()
    cls = models.Class(id="c1", name="10", section="A")
    db.add(cls)
    admin = models.User(id="admin", username="admin", password_hash="hash", role="ADMIN")
    db.add(admin)
    for i in range(count):
        p = models.Parent(id=f"p{i}", primary_phone=f"12345{i}")
        s = models.Student(id=f"s{i}", name=f"Student {i}", roll_no=str(i), class_id="c1", parent_id=f"p{i}")
        f = models.FeeSummary(student_id=f"s{i}", total_amount=1000, paid_amount=0, pending_balance=1000)
        db.add_all([p, s, f])
    db.commit()
    db.close()

def run_load_test(user_count):
    print(f"\n--- Running Load Test: {user_count} Concurrent Users ---")
    
    # Auth override
    main.app.dependency_overrides[main.get_current_user] = lambda: models.User(id="admin", username="admin", role="ADMIN")
    
    latencies = []
    errors = 0
    
    def worker():
        nonlocal errors
        try:
            start = time.perf_counter()
            # Test the heavy endpoint with pagination
            response = client.get("/api/students?limit=100")
            end = time.perf_counter()
            if response.status_code == 200:
                latencies.append((end - start) * 1000)
            else:
                errors += 1
        except Exception:
            errors += 1

    with ThreadPoolExecutor(max_workers=50) as executor: # Cap workers to avoid local overhead drowning
        for _ in range(user_count):
            executor.submit(worker)
            
    if not latencies:
        print("All requests failed.")
        return
        
    avg_latency = sum(latencies) / len(latencies)
    p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) >= 20 else max(latencies)
    throughput = len(latencies) / (max(latencies)/1000) if latencies else 0 # Rough estimate

    print(f"Total Requests: {user_count}")
    print(f"Success: {len(latencies)}")
    print(f"Errors: {errors}")
    print(f"Average Latency: {avg_latency:.2f}ms")
    print(f"P95 Latency: {p95_latency:.2f}ms")
    print(f"Error Rate: {(errors/user_count)*100:.2f}%")

if __name__ == "__main__":
    seed_data(1000)
    for users in [100, 500, 1000]:
        run_load_test(users)
