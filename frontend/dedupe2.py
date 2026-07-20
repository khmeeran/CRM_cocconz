import os
import re

frontend_dir = r'E:\CRM_Cocoonz\frontend'
for root, _, files in os.walk(frontend_dir):
    if 'node_modules' in root or '.next' in root or 'out' in root: continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            original = content
            
            # Use regex to find block between { and } that contain multiple credentials: 'include'
            content = re.sub(r"credentials:\s*'include'([^\}]*)credentials:\s*'include'", r"credentials: 'include'\1", content, flags=re.MULTILINE|re.DOTALL)
            content = re.sub(r"credentials:\s*'include'([^\}]*)credentials:\s*'include'", r"credentials: 'include'\1", content, flags=re.MULTILINE|re.DOTALL)
            
            if content != original:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed: {path}")
