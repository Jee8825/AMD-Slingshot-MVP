import requests

login_data = {"username": "official2@test.com", "password": "password123"}
r = requests.post("http://localhost:8000/api/auth/login", data=login_data)
if r.status_code != 200:
    print("Login err:", r.text)
    exit(1)

token = r.json()["access_token"]
print("Token acquired.")

project_data = {
    "title": "Road Repair in Village X",
    "description": "Repairing the main approach road.",
    "allocated_budget": 500000,
    "disbursed_amount": 100000,
    "status": "In Progress"
}

headers = {"Authorization": f"Bearer {token}"}
r2 = requests.post("http://localhost:8000/api/v1/projects", json=project_data, headers=headers)
print("Create Project:", r2.text)
