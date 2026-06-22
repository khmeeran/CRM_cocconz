import sqlite3
import pandas as pd
import json

conn = sqlite3.connect('E:/CRM_Cocoonz/db/school.db')
cursor = conn.cursor()

def get_table_info():
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [r[0] for r in cursor.fetchall() if r[0] != 'sqlite_sequence']
    
    db_schema = {}
    for table in tables:
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [{"name": c[1], "type": c[2], "pk": c[5]} for c in cursor.fetchall()]
        
        cursor.execute(f"PRAGMA foreign_key_list({table})")
        fks = [{"from": f[3], "table": f[2], "to": f[4]} for f in cursor.fetchall()]
        
        cursor.execute(f"PRAGMA index_list({table})")
        indexes = [{"name": i[1], "unique": i[2]} for i in cursor.fetchall()]
        
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        
        db_schema[table] = {
            "columns": columns,
            "fks": fks,
            "indexes": indexes,
            "row_count": count
        }
    return db_schema

schema = get_table_info()
print(json.dumps(schema, indent=2))
conn.close()
