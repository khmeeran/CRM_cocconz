import sys
import os
from fastapi.testclient import TestClient
from unittest.mock import patch

sys.path.insert(0, './backend')
os.environ["SECRET_KEY"] = "supersecretkey32charsminblablablabla"
os.environ["ENV"] = "development"

# Add dummy test DB
test_db_path = os.path.join(os.path.dirname(__file__), "c_test.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

import main
import celery_app

client = TestClient(main.app)

def test_probes():
    print("--- Testing Health Probes ---")
    live_res = client.get("/api/health/liveness")
    print(f"Liveness: {live_res.status_code} - {live_res.json()}")
    
    ready_res = client.get("/api/health/readiness")
    print(f"Readiness: {ready_res.status_code} - {ready_res.json()}")

def test_celery():
    print("\n--- Testing Celery Configuration ---")
    # Verify task is registered
    if "tasks.send_broadcast" in celery_app.celery_app.tasks:
        print("[SUCCESS] Celery task 'tasks.send_broadcast' is registered.")
    else:
        print("[FAILURE] Task not found.")
        
    print(f"Celery Backend: {celery_app.celery_app.conf.result_backend}")
    print(f"Celery Broker: {celery_app.celery_app.conf.broker_url}")
    print(f"Acks Late Enabled: {celery_app.celery_app.conf.task_acks_late}")

if __name__ == "__main__":
    test_probes()
    test_celery()
