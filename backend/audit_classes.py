import sqlite3

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

# Check table structure just in case there is a branch_id mapping
cursor.execute("PRAGMA table_info(classes);")
cols = cursor.fetchall()

# Query all classes
query = "SELECT * FROM classes;"
cursor.execute(query)
rows = cursor.fetchall()

print("Columns:", cols)
print("\n--- ALL CLASSES ---")
for r in rows:
    print(r)

conn.close()
