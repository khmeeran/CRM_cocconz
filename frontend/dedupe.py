import os
import re

frontend_dir = r"E:\CRM_Cocoonz\frontend"

for root, _, files in os.walk(frontend_dir):
    if "node_modules" in root or ".next" in root or "out" in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            content = re.sub(r"credentials:\s*'include',\s*credentials:\s*'include'", "credentials: 'include'", content)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
