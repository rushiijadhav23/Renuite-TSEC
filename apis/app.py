from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Importing CORS
from config import DevelopmentConfig
from resources import api
from models import db
import pickle
import math
from datetime import datetime, timedelta
import random

app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})



app.config.from_object(DevelopmentConfig)
api.init_app(app)
db.init_app(app)

# Aniket New routes down here
def assign_age_group(age):
    if age < 13:
        return 'Child (0-12)'
    elif age < 20:
        return 'Teen (13-19)'
    elif age < 40:
        return 'Young Adult (20-39)'
    elif age < 60:
        return 'Middle Age (40-59)'
    elif age < 80:
        return 'Senior (60-79)'
    else:
        return 'Elderly (80+)'

def predict_walking_speed_with_ci(age, gender, model_params):
    age_group = assign_age_group(age)
    try:
        mean_speed = model_params.loc[(age_group, gender), 'mean']
        std_speed = model_params.loc[(age_group, gender), 'std']
        return {
            'predicted_speed': float(mean_speed),
            'confidence_interval': (float(mean_speed - std_speed), float(mean_speed + std_speed))
        }
    except:
        return None
    
def predict_walking_speed(age, gender, model_params):
    age_group = assign_age_group(age)
    try:
        mean_speed = model_params.loc[(age_group, gender), 'mean']
        return float(mean_speed)
    except:
        return None

with open('./walking_speed_model.pkl', 'rb') as file:
    loaded_model = pickle.load(file)
    
def get_run_speed_based_on_age(age):
    """
    Returns a realistic running speed (in km/h) based on the age group.
    """
    if age < 13:
        return 5  # km/h for children
    elif age < 20:
        return 7  # km/h for teens
    elif age < 40:
        return 6  # km/h for young adults
    elif age < 60:
        return 5  # km/h for middle-aged individuals
    elif age < 80:
        return 4  # km/h for seniors
    else:
        return 3  # km/h for elderly individuals

def calculate_search_zones(lat, lng, time_elapsed, age, gender):
    """
    Computes three probability zones based on the time elapsed since last seen.
    """
    # Get walking speed from model using the loaded predict_function
    speed_walk = loaded_model['predict_function'](age, gender, loaded_model['model_params'])
    
    # If walking speed couldn't be predicted, use default values
    if speed_walk is None:
        speed_walk = 2  # km/h (default walking speed if model fails)

    # Get realistic running speed based on age
    speed_run = get_run_speed_based_on_age(age)
    
    time_hours = time_elapsed / 60.0  # Convert minutes to hours

    # Calculate search zones based on walking speed and time elapsed
    zones = [
        {"radius": speed_walk * time_hours * 1000, "color": "red"},      # Highly probable
        {"radius": speed_walk * time_hours * 2000, "color": "orange"},    # Less probable
        {"radius": speed_run * time_hours * 1000, "color": "yellow"}     # Least probable
    ]

    return zones

@app.route("/api/search_zones", methods=["GET"])
def get_search_zones():
    """
    Endpoint to fetch probable zones based on last seen time, age, and gender.
    """
    lat = float(request.args.get("lat"))
    lng = float(request.args.get("lng"))
    time_elapsed = float(request.args.get("timeElapsed"))
    age = int(request.args.get("age"))
    gender = request.args.get("gender")

    # Get search zones based on lat, lng, time, age, and gender
    zones = calculate_search_zones(lat, lng, time_elapsed, age, gender)
    return jsonify(zones)

def is_point_in_zone(point_lat, point_lng, center_lat, center_lng, radius):
    """Calculate if a point falls within a circular zone"""
    R = 6371000  # Earth's radius in meters
    
    dlat = math.radians(point_lat - center_lat)
    dlng = math.radians(point_lng - center_lng)
    
    a = (math.sin(dlat/2) * math.sin(dlat/2) +
         math.cos(math.radians(center_lat)) * math.cos(math.radians(point_lat)) *
         math.sin(dlng/2) * math.sin(dlng/2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance <= radius

def get_mock_missing_persons(lat, lng, count=10):
    """Generate mock missing persons data around a location"""
    persons = []
    for i in range(count):
        # Generate random coordinates within ~5km
        dlat = random.uniform(-0.05, 0.05)
        dlng = random.uniform(-0.05, 0.05)
        
        age = random.randint(5, 80)
        hours_missing = random.randint(1, 72)
        
        persons.append({
            "id": i + 1,
            "name": f"Person {i+1}",
            "age": age,
            "gender": random.choice(["Male", "Female"]),
            "last_seen_lat": lat + dlat,
            "last_seen_lng": lng + dlng,
            "time_elapsed": hours_missing,
            "last_seen": (datetime.now() - timedelta(hours=hours_missing)).isoformat(),
            "description": f"Missing person {i+1} description"
        })
    return persons

@app.route("/api/organization/<org_type>/<int:org_id>/dashboard", methods=["GET"])
def get_organization_dashboard(org_type, org_id):
    """Get dashboard data for police station or NGO"""
    # Mock data generation
    total_missing = random.randint(50, 200)
    
    # Generate mock missing persons
    missing_persons = get_mock_missing_persons(request.args.get("lat", type=float),
                                             request.args.get("lng", type=float))
    
    # Calculate zones for each person
    high_priority = []
    medium_priority = []
    low_priority = []
    
    for person in missing_persons:
        time_elapsed = person["time_elapsed"]
        zones = calculate_search_zones(
            person["last_seen_lat"],
            person["last_seen_lng"],
            time_elapsed * 60,  # Convert hours to minutes
            person["age"],
            person["gender"]
        )
        
        org_lat = float(request.args.get("lat"))
        org_lng = float(request.args.get("lng"))
        
        if is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[0]["radius"]):
            high_priority.append(person)
        elif is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[1]["radius"]):
            medium_priority.append(person)
        elif is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[2]["radius"]):
            low_priority.append(person)
    
    # Generate mock notifications
    notifications = [
        {
            "id": 1,
            "title": "New Missing Person Report",
            "message": "A new missing person case has been reported in your area",
            "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat()
        },
        {
            "id": 2,
            "title": "Update on Case #123",
            "message": "New witness information available",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": 3,
            "title": "Alert: Similar Case Pattern",
            "message": "Multiple cases reported with similar characteristics",
            "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()
        }
    ]
    
    return jsonify({
        "total_missing_persons": total_missing,
        "high_priority_cases": high_priority,
        "medium_priority_cases": medium_priority,
        "low_priority_cases": low_priority,
        "notifications": notifications
    })

if __name__ == '__main__':
    app.run(debug=True)