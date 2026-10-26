import sys
sys.path.insert(0, 'backend')
from fastapi.testclient import TestClient
from app.main import app
from app.services.graph_service import graph_service

graph_service.load_from_json()
client = TestClient(app)

queries = [
    'central libraary', 'girsl hosotel', 'diploma collge polytechnic',
    'IT', 'MBA', 'Mechatronics', 'Structural', 'Electrical',
    'Mechanical', 'Civil', 'Comp', 'ECE', 'Main Gate',
    'Gym', 'Open Auditorium', 'Banquet Hall', 'Lawn Tennis Court',
    'Basketball Ground', 'Parking', 'Sanjivani University Ground',
    'Boys Hostel', 'Staff Quarters'
]

print(f"{'QUERY':25} | {'RESOLVED LOCATION':45} | {'DIST':8} | {'STEPS'}")
print("-" * 90)

for q in queries:
    resp = client.post("/api/v1/navigation/navigate", json={
        "natural_language_query": q,
        "origin_node_id": "n_main_gate"
    })
    if resp.status_code == 200:
        data = resp.json()
        loc_name = data["resolved_location"]["name"]
        dist = data["route"]["total_distance"]
        steps = len(data["route"]["instructions"])
        print(f"{q:25} | {loc_name:45} | {dist:6.1f}m | {steps} steps")
    else:
        print(f"{q:25} | FAILED ({resp.status_code}): {resp.text}")
