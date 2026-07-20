import os
import ast
import json
import time

def generate_deep_audit(target_dir):
    start_time = time.time()
    
    inventory = {
        "Python": 0,
        "TypeScript": 0,
        "React": 0,
        "SQLAlchemy": 0,
        "Alembic": 0,
        "Docker": 0,
        "Nginx": 0,
        "Tests": 0,
        "Excel": 0,
        "Utilities": 0,
        "Scripts": 0,
        "Total": 0
    }
    
    total_lines = 0
    skipped_files = []
    
    python_files_details = []
    
    for root, dirs, files in os.walk(target_dir):
        if 'venv' in root or '.git' in root or 'node_modules' in root or '__pycache__' in root or '.next' in root:
            continue
            
        for file in files:
            inventory["Total"] += 1
            path = os.path.join(root, file)
            
            try:
                if file.endswith('.py'):
                    inventory["Python"] += 1
                    if 'test' in file.lower():
                        inventory["Tests"] += 1
                    elif 'migration' in root.lower() or 'alembic' in root.lower():
                        inventory["Alembic"] += 1
                    elif 'model' in file.lower():
                        inventory["SQLAlchemy"] += 1
                    elif 'import' in file.lower() or 'excel' in file.lower():
                        inventory["Excel"] += 1
                        
                    with open(path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        num_lines = len(lines)
                        total_lines += num_lines
                        
                        content = "".join(lines)
                        todos = [i+1 for i, line in enumerate(lines) if 'TODO' in line or 'FIXME' in line]
                        
                        try:
                            tree = ast.parse(content)
                            imports = [node.names[0].name for node in ast.walk(tree) if isinstance(node, ast.Import)]
                            imports += [node.module for node in ast.walk(tree) if isinstance(node, ast.ImportFrom) and node.module]
                            
                            classes = [node.name for node in ast.walk(tree) if isinstance(node, ast.ClassDef)]
                            funcs = [node.name for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
                            
                            python_files_details.append({
                                "file": file,
                                "path": path,
                                "lines": num_lines,
                                "todos": len(todos),
                                "classes": len(classes),
                                "funcs": len(funcs),
                                "imports": len(imports)
                            })
                        except Exception as e:
                            pass
                            
                elif file.endswith('.ts') or file.endswith('.tsx') or file.endswith('.js') or file.endswith('.jsx'):
                    if file.endswith('.tsx') or file.endswith('.jsx'):
                        inventory["React"] += 1
                    else:
                        inventory["TypeScript"] += 1
                        
                    with open(path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        total_lines += len(lines)
                
                elif 'docker' in file.lower():
                    inventory["Docker"] += 1
                    with open(path, 'r', encoding='utf-8') as f:
                        total_lines += len(f.readlines())
                        
                elif 'nginx' in file.lower():
                    inventory["Nginx"] += 1
                    with open(path, 'r', encoding='utf-8') as f:
                        total_lines += len(f.readlines())
                        
            except Exception as e:
                skipped_files.append(path)
                
    end_time = time.time()
    
    report = f"TOTAL FILES SCANNED: {inventory['Total']}\n"
    report += f"TOTAL LINES OF CODE SCANNED: {total_lines}\n"
    report += f"TIME SPENT: {end_time - start_time:.2f} seconds\n"
    report += f"FILES SKIPPED: {len(skipped_files)}\n\n"
    
    report += "INVENTORY:\n"
    for k, v in inventory.items():
        report += f"  - {k}: {v}\n"
        
    report += "\nPYTHON FILES SAMPLE DETAILS (Top 20 by lines):\n"
    python_files_details.sort(key=lambda x: x['lines'], reverse=True)
    for p in python_files_details[:20]:
        report += f"  - {p['file']}: {p['lines']} lines, {p['todos']} TODOs, {p['classes']} classes, {p['funcs']} funcs, {p['imports']} imports\n"
        
    with open('deep_audit_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)

if __name__ == '__main__':
    generate_deep_audit('E:/CRM_Cocoonz')
