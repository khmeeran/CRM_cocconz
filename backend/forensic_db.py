import sqlite3
import pandas as pd
import json

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(payment_history)")
columns = cursor.fetchall()
print("SCHEMA:")
for c in columns:
    print(c)

cursor.execute("SELECT COUNT(*) FROM payment_history")
print("\nROW COUNT:", cursor.fetchone()[0])

cursor.execute("SELECT * FROM payment_history LIMIT 5")
rows = cursor.fetchall()
print("\nSAMPLE ROWS:")
for r in rows:
    print(r)

conn.close()
