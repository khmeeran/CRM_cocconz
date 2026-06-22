import sqlite3

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='payment_history'")
print(cursor.fetchone()[0])

cursor.execute("PRAGMA index_list(payment_history)")
indexes = cursor.fetchall()
print("\nINDEXES:")
for i in indexes:
    print(i)

conn.close()
