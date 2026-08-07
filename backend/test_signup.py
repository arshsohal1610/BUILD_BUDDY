import json
import urllib.request
import urllib.error

url = 'http://localhost:8000/signup'
payload = {'username': 'testuser', 'email': 'test@example.com', 'password': 'password123'}

try:
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
    resp = urllib.request.urlopen(req, timeout=5)
    print(f'Status: {resp.status}')
    print(f'Response: {resp.read().decode()}')
except urllib.error.HTTPError as e:
    print(f'Status: {e.code}')
    print(f'Response: {e.read().decode()}')
except Exception as e:
    print(f'Error: {type(e).__name__}: {e}')
