with open('schemas.py', 'r') as f:
    lines = f.readlines()

out = []
skip = False
for line in lines:
    if "class FeeStructureBase" in line:
        skip = True
    if skip and "class ClassBase" in line:
        skip = False
        with open('schemas_fee.py', 'r') as sf:
            sf_content = sf.read().split('from decimal import Decimal')[1]
            out.append(sf_content)
    if not skip:
        out.append(line)

with open('schemas.py', 'w') as f:
    f.writelines(out)
