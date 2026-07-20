import urllib.request
import urllib.error
import time

def check_endpoint(url, expected_status=200):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == expected_status:
                return True, response.read().decode('utf-8')
            return False, f"Expected {expected_status}, got {response.status}"
    except urllib.error.URLError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)

print("Checking endpoints...")

health_url = "http://localhost:8000/api/health/liveness"
success, msg = check_endpoint(health_url)
if success:
    print("Backend is healthy!")
else:
    print(f"Backend health check failed: {msg}")

frontend_url = "http://localhost:80"
try:
    req = urllib.request.Request(frontend_url)
    with urllib.request.urlopen(req, timeout=5) as f_res:
        if f_res.status == 200:
            print("Frontend is reachable!")
        else:
            print(f"Frontend returned {f_res.status}")
except Exception as e:
    print(f"Frontend check failed: {e}")
