import sqlite3
import pandas as pd

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')

query = '''
SELECT 
    b.name,
    b.created_at,
    (SELECT COUNT(*) FROM classes c WHERE c.branch_id = b.id) as class_count,
    (SELECT COUNT(*) FROM students s WHERE s.branch_id = b.id) as student_count,
    (SELECT COUNT(*) FROM students s WHERE s.branch_id = b.id AND s.status != 'ADMITTED') as admission_count
FROM branches b;
'''

# Wait, Phase 2B might have a separate admissions table or it reused Student model: 
# "2. Reuse Student model wherever possible."
# "4. Admission statuses: ENQUIRY, FOLLOW_UP, ADMITTED"
# "10. Existing student management must continue working."

# Let's check the schema just in case:
try:
    df = pd.read_sql_query(query, conn)
    print(df.to_string())
except Exception as e:
    print("Error:", e)

conn.close()
