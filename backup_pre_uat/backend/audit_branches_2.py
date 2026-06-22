import sqlite3
import pandas as pd

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')

query = '''
SELECT 
    b.name,
    (SELECT COUNT(*) FROM classes c WHERE c.branch_id = b.id) as class_count,
    (SELECT COUNT(*) FROM students s WHERE s.branch_id = b.id AND s.status = 'ADMITTED') as student_count,
    (SELECT COUNT(*) FROM students s WHERE s.branch_id = b.id AND s.status != 'ADMITTED') as admission_count
FROM branches b;
'''

try:
    df = pd.read_sql_query(query, conn)
    print(df.to_string())
except Exception as e:
    print("Error:", e)

conn.close()
