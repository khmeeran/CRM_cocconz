import sqlite3
import uuid
from datetime import datetime

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

# 1. Delete orphaned NULL-branch duplicate records
cursor.execute("DELETE FROM classes WHERE branch_id IS NULL AND name = 'Class 1' AND section = 'B'")

# 2. Normalize naming
cursor.execute("UPDATE classes SET name = 'Class 1' WHERE name = '1st Std'")
cursor.execute("UPDATE classes SET name = 'Class 2' WHERE name = '2nd Std'")

# 3. Create missing classes for SP Kovil Branch 1 (74d5575b-44af-42d3-a467-ad139b0fec5d)
branch_id = '74d5575b-44af-42d3-a467-ad139b0fec5d'
now = datetime.utcnow().isoformat()
for cls in ['Class 3', 'Class 4', 'Class 5']:
    c_id = str(uuid.uuid4())
    cursor.execute(
        "INSERT INTO classes (id, name, section, branch_id, division, academic_year, created_at, updated_at) VALUES (?, ?, 'A', ?, 'Primary', '2026-2027', ?, ?)",
        (c_id, cls, branch_id, now, now)
    )

conn.commit()
conn.close()
print("Data cleanup and insertion completed successfully.")
