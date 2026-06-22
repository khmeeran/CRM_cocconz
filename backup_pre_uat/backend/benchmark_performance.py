import time
import io
import logging
import sys
import os
import json
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Add backend to path
sys.path.insert(0, './backend')

# Set environment
os.environ["SECRET_KEY"] = "supersecretkey32charsminblablablabla"
os.environ["ENV"] = "development"
test_db_path = os.path.join(os.path.dirname(__file__), "benchmark.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

import main, models, database
from database import engine, SessionLocal

# Setup DB
models.Base.metadata.create_all(bind=engine)

# Setup Logging to capture SQL queries
logging.basicConfig()
sql_logger = logging.getLogger('sqlalchemy.engine')
sql_logger.setLevel(logging.INFO)
log_stream = io.StringIO()
handler = logging.StreamHandler(log_stream)
sql_logger.addHandler(handler)

client = TestClient(main.app)

# Seed Data
def seed_data(count=100):
    db = SessionLocal()
    cls = models.Class(id="c1", name="10", section="A")
    db.add(cls)
    
    # Add an admin user for auth
    admin = models.User(id="admin", username="admin", password_hash="hash", role="ADMIN")
    db.add(admin)
    
    for i in range(count):
        p = models.Parent(id=f"p{i}", primary_phone=f"12345{i}")
        s = models.Student(id=f"s{i}", name=f"Student {i}", roll_no=str(i), class_id="c1", parent_id=f"p{i}")
        f = models.FeeSummary(student_id=f"s{i}", total_amount=1000, paid_amount=0, pending_balance=1000)
        db.add_all([p, s, f])
    db.commit()
    db.close()

def benchmark_endpoint(endpoint):
    print(f"\n--- Benchmarking {endpoint} ---")
    
    # Auth override
    main.app.dependency_overrides[main.get_current_user] = lambda: models.User(id="admin", username="admin", role="ADMIN")
    
    # Clear logs
    log_stream.truncate(0)
    log_stream.seek(0)
    
    start_time = time.perf_counter()
    response = client.get(endpoint)
    end_time = time.perf_counter()
    
    latency = (end_time - start_time) * 1000
    log_output = log_stream.getvalue()
    query_count = log_output.count("SELECT")
    
    print(f"Latency: {latency:.2f}ms")
    print(f"Query Count: {query_count}")
    print(f"Response Size: {len(response.content) / 1024:.2f} KB")
    print(f"Item Count: {len(response.json()) if isinstance(response.json(), list) else 'N/A'}")
    
    return {
        "latency": latency,
        "query_count": query_count,
        "size": len(response.content)
    }

if __name__ == "__main__":
    count = 100
    seed_data(count)
    print(f"Seeded {count} students.")
    
    results = {}
    results["students"] = benchmark_endpoint("/api/students")
    results["users"] = benchmark_endpoint("/api/users")
    
    with open("benchmark_results_before.json", "w") as f:
        json.dump(results, f)
