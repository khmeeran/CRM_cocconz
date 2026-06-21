import sqlite3
conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute("SELECT * FROM users WHERE username='admin'")
row = cursor.fetchone()
if row:
    print(dict(row))
else:
    print('Admin not found')
