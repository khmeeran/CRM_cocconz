import sqlite3
import pandas as pd

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')

print("--- BRANCHES ---")
branches_df = pd.read_sql_query('''
SELECT 
    b.id, 
    b.name, 
    b.is_active,
    (SELECT COUNT(*) FROM classes c WHERE c.branch_id = b.id) as num_classes,
    (SELECT COUNT(*) FROM students s WHERE s.branch_id = b.id) as num_students
FROM branches b;
''', conn)
print(branches_df.to_string())

print("\n--- CLASSES ---")
classes_df = pd.read_sql_query('SELECT id, name, section, branch_id, division FROM classes', conn)
print(classes_df.to_string())

conn.close()
