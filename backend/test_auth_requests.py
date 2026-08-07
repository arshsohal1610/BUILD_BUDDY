import requests
payload = {"username": "dbtest2", "email": "dbtest2@example.com", "password": "secret123"}
for url, data in [
    ("http://127.0.0.1:8000/signup", payload),
    ("http://127.0.0.1:8000/login", {"email": payload["email"], "password": payload["password"]}),
]:
    r = requests.post(url, json=data, timeout=20)
    print(url, r.status_code)
    print(r.text)
