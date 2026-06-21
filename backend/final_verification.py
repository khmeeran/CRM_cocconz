import sqlite3
import pandas as pd

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

print("=== BRANCHES TABLE COMPLETE ===")
branches_df = pd.read_sql_query("SELECT * FROM branches", conn)
print(branches_df.to_string())

print("\n=== CLASSES TABLE COMPLETE ===")
classes_df = pd.read_sql_query("SELECT * FROM classes", conn)
print(classes_df.to_string())

print("\n=== MISSING CLASS VERIFICATION ===")
missing_check = pd.read_sql_query("SELECT * FROM classes WHERE name LIKE '%3%' OR name LIKE '%4%' OR name LIKE '%5%'", conn)
print("Records matching Class 3, 4, 5:", len(missing_check))
if len(missing_check) > 0:
    print(missing_check.to_string())

print("\n=== BRANCH-CLASS MATRIX ===")
expected_classes = ['Pre-KG', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5']
for index, branch in branches_df.iterrows():
    print(f"\n{branch['name']}")
    for exp_class in expected_classes:
        exists = False
        matching_rows = classes_df[classes_df['branch_id'] == branch['id']]
        for i, row in matching_rows.iterrows():
            if row['name'] == exp_class or (exp_class == 'Class 1' and row['name'] == '1st Std') or (exp_class == 'Class 2' and row['name'] == '2nd Std'):
                exists = True
                break
        
        icon = "├──" if exp_class != expected_classes[-1] else "└──"
        status = "[EXISTS]" if exists else "[MISSING]"
        print(f"{icon} {exp_class} {status}")

print("\n=== ORPHANED DUPLICATES FOR ROLLBACK ===")
orphans = classes_df[classes_df['branch_id'].isnull()]
for i, row in orphans.iterrows():
    print(f"INSERT INTO classes (id, name, section, branch_id, division) VALUES ('{row['id']}', '{row['name']}', '{row['section']}', NULL, '{row['division']}');")

conn.close()
