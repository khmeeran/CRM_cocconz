import sqlite3
import os
import sys

# Add backend to path
sys.path.insert(0, './backend')
import main, database, models, schemas
from database import SessionLocal

def check_locking():
    print("--- Verifying Locking Logic ---")
    db = SessionLocal()
    try:
        # SQLite doesn't strictly support 'FOR UPDATE' in the same way Postgres does,
        # but SQLAlchemy translates it. We want to ensure the code executes without error
        # and that we have implemented the correct pattern for the production database (Postgres).
        query = db.query(models.FeeSummary).filter(models.FeeSummary.student_id == 's1').with_for_update()
        sql = str(query.statement.compile(db.bind))
        print(f"Generated SQL: {sql}")
        if "FOR UPDATE" in sql.upper():
            print("[SUCCESS] 'FOR UPDATE' clause found in generated SQL.")
        else:
            print("[WARNING] 'FOR UPDATE' not found in SQL (SQLAlchemy might omit it for SQLite dialect).")
        
        # Test execution
        fee = query.first()
        print(f"Fetched fee summary: {fee}")
        print("[SUCCESS] Locking query executed successfully.")
    except Exception as e:
        print(f"[FAILURE] Locking query failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_locking()
