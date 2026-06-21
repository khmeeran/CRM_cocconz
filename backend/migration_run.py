import sqlite3

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

# Check row count before
cursor.execute("SELECT COUNT(*) FROM payment_history")
print("Row count before:", cursor.fetchone()[0])

# Perform migration
try:
    cursor.execute("ALTER TABLE payment_history ADD COLUMN balance_due NUMERIC(10,2) NOT NULL DEFAULT 0.00;")
    cursor.execute("ALTER TABLE payment_history ADD COLUMN receipt_status VARCHAR NOT NULL DEFAULT 'ACTIVE';")
    cursor.execute("ALTER TABLE payment_history ADD COLUMN remarks TEXT;")
    
    # In SQLite, altering an existing column to UNIQUE requires creating an index
    cursor.execute("CREATE UNIQUE INDEX ix_payment_history_receipt_no ON payment_history(receipt_no);")
    cursor.execute("CREATE INDEX ix_payment_history_receipt_status ON payment_history(receipt_status);")
    
    conn.commit()
    print("Migration successful.")
except Exception as e:
    print("Migration failed:", e)

# Check row count after
cursor.execute("SELECT COUNT(*) FROM payment_history")
print("Row count after:", cursor.fetchone()[0])

conn.close()
