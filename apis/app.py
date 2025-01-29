#from datetime import timedelta
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import DevelopmentConfig
from resources import api
from models import db
import math # New

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config.from_object(DevelopmentConfig)
db.init_app(app)
api.init_app(app)


#Aniket New routes down here
def calculate_search_zones(lat, lng, time_elapsed):
    """
    Computes three probability zones based on the time elapsed since last seen.
    """
    speed_walk = 2  # km/h
    speed_run = 5  # km/h
    time_hours = time_elapsed / 60.0  # Convert minutes to hours

    zones = [
        {"radius": speed_walk * time_hours * 1000, "color": "red"},      # Highly probable
        {"radius": speed_run * time_hours * 1000, "color": "orange"},    # Less probable
        {"radius": speed_run * time_hours * 1500, "color": "yellow"}     # Least probable
    ]

    return zones

@app.route("/api/search_zones", methods=["GET"])
def get_search_zones():
    """
    Endpoint to fetch probable zones based on last seen time.
    """
    lat = float(request.args.get("lat"))
    lng = float(request.args.get("lng"))
    time_elapsed = float(request.args.get("timeElapsed"))

    zones = calculate_search_zones(lat, lng, time_elapsed)
    return jsonify(zones)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)