import sys
sys.path.append('E:/CRM_Cocoonz/backend')
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)
res_token = client.post('/token', data={'username': 'admin', 'password': 'AdminReset2026!'})
token = res_token.json()['access_token']
res = client.get(f'/api/reports/outstanding?token={token}')
print("Outstanding Report:", res.status_code)
print(res.json()[:1])
