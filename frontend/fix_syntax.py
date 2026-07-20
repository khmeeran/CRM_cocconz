import os
import re

frontend_dir = r"E:\CRM_Cocoonz\frontend"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Fix leftover .split('; ') expressions
    content = re.sub(r"^\s*\.split\('; '\)\.find[^\n]+\n?", "", content, flags=re.MULTILINE)
    
    # Fix `{ , 'Content-Type'` -> `{ 'Content-Type'`
    content = re.sub(r"\{\s*,\s*'Content-Type'", "{ 'Content-Type'", content)
    
    # Fix `return { , };` -> `return {};`
    content = re.sub(r"\{\s*,\s*\}", "{}", content)
    
    # In some places, we have `return {  };` which is fine.
    
    # Just in case `credentials: 'include'` was added weirdly after a `.split` failure
    content = re.sub(r"credentials:\s*'include'\s*,\s*credentials:\s*'include'", "credentials: 'include'", content)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed: {filepath}")

for root, _, files in os.walk(frontend_dir):
    if "node_modules" in root or ".next" in root or "out" in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            fix_file(os.path.join(root, file))
