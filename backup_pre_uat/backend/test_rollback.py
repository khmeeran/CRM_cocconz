import sqlite3

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school_rollback_test.db')
cursor = conn.cursor()

try:
    cursor.execute("DROP INDEX IF EXISTS ix_payment_history_receipt_no;")
    cursor.execute("DROP INDEX IF EXISTS ix_payment_history_receipt_status;")
    cursor.execute("ALTER TABLE payment_history DROP COLUMN balance_due;")
    cursor.execute("ALTER TABLE payment_history DROP COLUMN receipt_status;")
    cursor.execute("ALTER TABLE payment_history DROP COLUMN remarks;")
    conn.commit()
    print("Rollback test SUCCESS on copy.")
except Exception as e:
    print("Rollback test FAILED:", e)

cursor.execute("PRAGMA table_info(payment_history)")
columns = cursor.fetchall()
print("Columns after rollback:", [c[1] for c in columns])
conn.close()
