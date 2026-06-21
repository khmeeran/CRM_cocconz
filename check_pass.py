import sys
sys.path.append('E:/CRM_Cocoonz/backend')
from main import verify_password, get_password_hash
print('Match:', verify_password('NuH0SWfYhDDBiM-P', '$pbkdf2-sha256$29000$gLAWYizF2JvzPmdsjZEyJg$zTqqF64iozBO6M2.ZXA.lwUdgh.juQQV9VSY7B.VOiY'))
