import requests
resp = requests.get('http://localhost:3001/getstocks')
print(resp.content.decode())
