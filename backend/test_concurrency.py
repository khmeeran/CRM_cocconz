import asyncio
import httpx
import uuid

# Reusing the valid assignment_id from PaymentHistory rows
# Wait, let's just create a new fee head and assignment to test cleanly.
import sqlite3
import datetime

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

cursor.execute("SELECT id FROM users WHERE role='ADMIN' LIMIT 1")
user_id = cursor.fetchone()[0]

cursor.execute("SELECT id FROM students LIMIT 1")
student_id = cursor.fetchone()[0]

cursor.execute("SELECT id FROM fee_heads LIMIT 1")
fee_head_id = cursor.fetchone()[0]

assignment_id = str(uuid.uuid4())
cursor.execute(f"INSERT INTO student_fee_assignments (id, student_id, fee_head_id, final_amount, amount_paid, due_date) VALUES ('{assignment_id}', '{student_id}', '{fee_head_id}', 10000.00, 0, '2026-12-31')")
conn.commit()

# Ensure unique constraint is active on SQLite (sometimes PRAGMA foreign_keys is needed, but unique is enforced always)

# Now, we need the auth token
# First let's just simulate the DB uniqueness directly via async inserts since testing via HTTP requires auth token
import sqlite3
import threading

def worker(worker_id):
    c = sqlite3.connect('E:/CRM_Cocoonz/db/school.db', timeout=10)
    cur = c.cursor()
    try:
        cur.execute(f'''
        INSERT INTO payment_history (id, student_id, assignment_id, fee_head_id, amount, payment_date, payment_mode, receipt_no, recorded_by, balance_due, receipt_status) 
        VALUES ('{str(uuid.uuid4())}', '{student_id}', '{assignment_id}', '{fee_head_id}', 100, '{datetime.datetime.utcnow().isoformat()}', 'CASH', 'REC-DUP-TEST', '{user_id}', 9900, 'ACTIVE')
        ''')
        c.commit()
        print(f"Worker {worker_id}: Inserted successfully")
    except Exception as e:
        print(f"Worker {worker_id}: FAILED with {str(e)}")
    finally:
        c.close()

threads = []
for i in range(5):
    t = threading.Thread(target=worker, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("\nValidating table count for REC-DUP-TEST:")
cursor.execute("SELECT COUNT(*) FROM payment_history WHERE receipt_no='REC-DUP-TEST'")
print("Count:", cursor.fetchone()[0])
conn.close()
