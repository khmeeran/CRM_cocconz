import sys
sys.path.append('E:/CRM_Cocoonz/backend')
from fpdf import FPDF
pdf = FPDF()
pdf.add_page()
pdf.set_font("Arial", size=10)
pdf.cell(10, 10, text="Hello")
out = pdf.output()
print(type(out))
