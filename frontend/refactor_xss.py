import os
import re

frontend_dir = r"E:\CRM_Cocoonz\frontend"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Remove localStorage.setItem('access_token'...)
    content = re.sub(r"localStorage\.setItem\('access_token'.*?\);\n?", "", content)
    
    # 2. Remove document.cookie token extraction
    content = re.sub(r"const token = document\.cookie.*?;?\n?", "", content)

    # 3. Replace Authorization headers with credentials: 'include'
    # Pattern 1: headers: { 'Authorization': `Bearer ...` }
    content = re.sub(r"headers:\s*\{\s*'Authorization':\s*`Bearer \$\{.*?}`\s*\}", "credentials: 'include'", content)
    # Pattern 2: headers: { 'Content-Type': 'application/json', 'Authorization': ... }
    content = re.sub(r"'Authorization':\s*`Bearer \$\{.*?}`", "", content)
    # Clean up empty commas if any
    content = re.sub(r",\s*,", ",", content)
    
    # 4. Inject credentials: 'include' into any fetch options that don't have it
    # We find `fetch(..., {` and inject `credentials: 'include',`
    content = re.sub(r"fetch\(([^,]+),\s*\{", r"fetch(\1, {\n      credentials: 'include',", content)
    
    # 5. Fix remaining headers that might have trailing commas
    content = re.sub(r"headers:\s*\{\s*,\s*", "headers: { ", content)
    content = re.sub(r"headers:\s*\{\s*'Content-Type':\s*'application/json'\s*,\s*\}", "headers: { 'Content-Type': 'application/json' }", content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Modified: {filepath}")

for root, _, files in os.walk(frontend_dir):
    if "node_modules" in root or ".next" in root or "out" in root:
        continue
    for file in files:
        if file.endswith(('.tsx', '.ts', '.js', '.jsx')):
            process_file(os.path.join(root, file))
