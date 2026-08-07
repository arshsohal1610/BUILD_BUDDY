import json
import urllib.request
import urllib.error

body = {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "testpass"
}

data = json.dumps(body).encode("utf-8")
req = urllib.request.Request(
    "http://127.0.0.1:8000/signup",
    data=data,
    headers={"Content-Type": "application/json"},
)
print("Request body:", data)
try:
    with urllib.request.urlopen(req) as r:
        print("STATUS", r.status)
        print(r.read().decode("utf-8"))
except urllib.error.HTTPError as e:
    print("ERROR", e.code)
    print(e.read().decode("utf-8"))
except Exception as e:
    print("EXCEPTION", type(e).__name__, e)
