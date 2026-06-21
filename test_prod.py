import requests

url = "https://crm-cocconz.vercel.app/token"
response = requests.post(url, data={"username": "admin", "password": "AdminReset2026!"})
print("Status:", response.status_code)
print("Cookies:", response.cookies.get_dict())
print("Headers:", dict(response.headers))
