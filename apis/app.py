from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # Importing CORS
from config import DevelopmentConfig
from resources import api
from models import db
import pickle
import math

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



if __name__ == '__main__':
    app.run(debug=True)