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
import logging

from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
import os
from werkzeug.utils import secure_filename
import requests
from deepface import DeepFace


# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = Flask(__name__)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})



app.config.from_object(DevelopmentConfig)
api.init_app(app)
db.init_app(app)

# Aniket New routes down here

# def assign_age_group(age):
#     if age < 13:
#         return 'Child (0-12)'
#     elif age < 20:
#         return 'Teen (13-19)'
#     elif age < 40:
#         return 'Young Adult (20-39)'
#     elif age < 60:
#         return 'Middle Age (40-59)'
#     elif age < 80:
#         return 'Senior (60-79)'
#     else:
#         return 'Elderly (80+)'

# def predict_walking_speed_with_ci(age, gender, model_params):
#     age_group = assign_age_group(age)
#     try:
#         mean_speed = model_params.loc[(age_group, gender), 'mean']
#         std_speed = model_params.loc[(age_group, gender), 'std']
#         return {
#             'predicted_speed': float(mean_speed),
#             'confidence_interval': (float(mean_speed - std_speed), float(mean_speed + std_speed))
#         }
#     except:
#         return None
    
# def predict_walking_speed(age, gender, model_params):
#     age_group = assign_age_group(age)
#     try:
#         mean_speed = model_params.loc[(age_group, gender), 'mean']
#         return float(mean_speed)
#     except:
#         return None

# with open('./walking_speed_model.pkl', 'rb') as file:
#     loaded_model = pickle.load(file)
    
# def get_run_speed_based_on_age(age):
#     """
#     Returns a realistic running speed (in km/h) based on the age group.
#     """
#     if age < 13:
#         return 5  # km/h for children
#     elif age < 20:
#         return 7  # km/h for teens
#     elif age < 40:
#         return 6  # km/h for young adults
#     elif age < 60:
#         return 5  # km/h for middle-aged individuals
#     elif age < 80:
#         return 4  # km/h for seniors
#     else:
#         return 3  # km/h for elderly individuals

# def calculate_search_zones(lat, lng, time_elapsed, age, gender):
#     """
#     Computes three probability zones based on the time elapsed since last seen.
#     """
#     # Get walking speed from model using the loaded predict_function
#     speed_walk = loaded_model['predict_function'](age, gender, loaded_model['model_params'])
    
#     # If walking speed couldn't be predicted, use default values
#     if speed_walk is None:
#         speed_walk = 2  # km/h (default walking speed if model fails)

#     # Get realistic running speed based on age
#     speed_run = get_run_speed_based_on_age(age)
    
#     time_hours = time_elapsed / 60.0  # Convert minutes to hours

#     # Calculate search zones based on walking speed and time elapsed
#     zones = [
#         {"radius": speed_walk * time_hours * 1000, "color": "red"},      # Highly probable
#         {"radius": speed_walk * time_hours * 2000, "color": "orange"},    # Less probable
#         {"radius": speed_run * time_hours * 1000, "color": "yellow"}     # Least probable
#     ]

#     return zones

# @app.route("/api/search_zones", methods=["GET"])
# def get_search_zones():
#     """
#     Endpoint to fetch probable zones based on last seen time, age, and gender.
#     """
#     lat = float(request.args.get("lat"))
#     lng = float(request.args.get("lng"))
#     time_elapsed = float(request.args.get("timeElapsed"))
#     age = int(request.args.get("age"))
#     gender = request.args.get("gender")

#     # Get search zones based on lat, lng, time, age, and gender
#     zones = calculate_search_zones(lat, lng, time_elapsed, age, gender)
#     return jsonify(zones)

# def is_point_in_zone(point_lat, point_lng, center_lat, center_lng, radius):
#     """Calculate if a point falls within a circular zone"""
#     R = 6371000  # Earth's radius in meters
    
#     dlat = math.radians(point_lat - center_lat)
#     dlng = math.radians(point_lng - center_lng)
    
#     a = (math.sin(dlat/2) * math.sin(dlat/2) +
#          math.cos(math.radians(center_lat)) * math.cos(math.radians(point_lat)) *
#          math.sin(dlng/2) * math.sin(dlng/2))
    
#     c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
#     distance = R * c
    
#     return distance <= radius

# def get_mock_missing_persons(lat, lng, count=10):
#     """Generate mock missing persons data around a location"""
#     persons = []
#     for i in range(count):
#         # Generate random coordinates within ~5km
#         dlat = random.uniform(-0.05, 0.05)
#         dlng = random.uniform(-0.05, 0.05)
        
#         age = random.randint(5, 80)
#         hours_missing = random.randint(1, 72)
        
#         persons.append({
#             "id": i + 1,
#             "name": f"Person {i+1}",
#             "age": age,
#             "gender": random.choice(["Male", "Female"]),
#             "last_seen_lat": lat + dlat,
#             "last_seen_lng": lng + dlng,
#             "time_elapsed": hours_missing,
#             "last_seen": (datetime.now() - timedelta(hours=hours_missing)).isoformat(),
#             "description": f"Missing person {i+1} description"
#         })
#     return persons

# @app.route("/api/organization/<org_type>/<int:org_id>/dashboard", methods=["GET"])
# def get_organization_dashboard(org_type, org_id):
#     """Get dashboard data for police station or NGO"""
#     # Mock data generation
#     total_missing = random.randint(50, 200)
    
#     # Generate mock missing persons
#     missing_persons = get_mock_missing_persons(request.args.get("lat", type=float),
#                                              request.args.get("lng", type=float))
    
#     # Calculate zones for each person
#     high_priority = []
#     medium_priority = []
#     low_priority = []
    
#     for person in missing_persons:
#         time_elapsed = person["time_elapsed"]
#         zones = calculate_search_zones(
#             person["last_seen_lat"],
#             person["last_seen_lng"],
#             time_elapsed * 60,  # Convert hours to minutes
#             person["age"],
#             person["gender"]
#         )
        
#         org_lat = float(request.args.get("lat"))
#         org_lng = float(request.args.get("lng"))
        
#         if is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[0]["radius"]):
#             high_priority.append(person)
#         elif is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[1]["radius"]):
#             medium_priority.append(person)
#         elif is_point_in_zone(org_lat, org_lng, person["last_seen_lat"], person["last_seen_lng"], zones[2]["radius"]):
#             low_priority.append(person)
    
#     # Generate mock notifications
#     notifications = [
#         {
#             "id": 1,
#             "title": "New Missing Person Report",
#             "message": "A new missing person case has been reported in your area",
#             "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat()
#         },
#         {
#             "id": 2,
#             "title": "Update on Case #123",
#             "message": "New witness information available",
#             "timestamp": (datetime.now() - timedelta(hours=2)).isoformat()
#         },
#         {
#             "id": 3,
#             "title": "Alert: Similar Case Pattern",
#             "message": "Multiple cases reported with similar characteristics",
#             "timestamp": (datetime.now() - timedelta(hours=5)).isoformat()
#         }
#     ]
    
#     return jsonify({
#         "total_missing_persons": total_missing,
#         "high_priority_cases": high_priority,
#         "medium_priority_cases": medium_priority,
#         "low_priority_cases": low_priority,
#         "notifications": notifications
#     })


# Twilio credentials
from models import Missing, Sighting
from flask import jsonify, make_response

account_sid = 'Enter your account SID here'
auth_token = 'Enter your auth token here'
client = Client(account_sid, auth_token)


# Set global variable for image state
image_expected = False

# Global variables
image_expected = False
UPLOAD_FOLDER = 'static/uploads'

@app.route('/whatsapp', methods=['POST'])
def reply_whatsapp():
    print("Received WhatsApp request")
    global image_expected
    logger.info("Received WhatsApp request")
    
    resp = MessagingResponse()
    msg = resp.message()
    responded = False

    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
        logger.info(f"Created upload folder: {UPLOAD_FOLDER}")

    incoming_msg = request.values.get('Body', '').lower().strip()
    num_media = int(request.values.get('NumMedia', 0))
    # Handle image reception
    if num_media > 0 and image_expected:
        print("Image received")
        media_url = request.values.get('MediaUrl0')
        media_type = request.values.get('MediaContentType0')
        
        if 'image' in media_type:
            try:
                # Generate unique filename
                filename = secure_filename(f"whatsapp_image_{request.values.get('MessageSid')}.jpg")
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                
                # Download image using Twilio client for authentication
                response = requests.get(
                    media_url,
                    auth=(account_sid, auth_token)
                )
                
                logger.info(f"Media download response status: {response.status_code}")
                
                if response.status_code == 200:
                    with open(file_path, 'wb') as f:
                        f.write(response.content)
                    msg.body('Image saved successfully!')
                    logger.info(f"Image saved to: {file_path}")

                    try:
                        # Specify the path to your database folder
                        db_path = "missing_photos"
                        
                        # Use DeepFace.find() to search for matches in the database folder
                        results = DeepFace.find(
                            img_path=file_path,
                            db_path=db_path
                        )
                        
                        # The results will be a list of pandas DataFrames containing matches
                        if len(results) > 0 and not results[0].empty:
                            missing = Missing.query.filter_by(missingphoto=results[0]["identity"][0]).first()
                            try:
                                missing.status = "sighted"
                                missingid=missing.missingid
                                db.session.commit()
                            
                                sighting = Sighting(missingid=missingid,sightingdate=datetime.now(),sightingplace=f"Lat: 19, Lon: 72",sightingphoto="search.jpeg")
                                
                                with open(f"sightings/{missingid}_sighting_{datetime.now()}.jpeg", 'wb') as f:
                                    f.write(response.content)
                                db.session.add(sighting)
                                db.session.commit()
                            except Exception as e:
                                db.session.rollback()
                                print(e)

                            msg.body('Matches found in database!')
                        else:
                            msg.body('No matches found in database.')
                            
                    except Exception as e:
                        print(e)
                        msg.body('Error processing the image. Please try again.')
                
                else:
                    msg.body(f'Failed to save image. Status code: {response.status_code}')
                    logger.error(f"Failed to download media. Status code: {response.status_code}")
                
                image_expected = False
                return str(resp)
                
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}", exc_info=True)
                msg.body('Error processing the image. Please try again.')
                return str(resp)
        else:
            msg.body('Please send an image file.')
            return str(resp)

    # Handle text commands
    print(incoming_msg)
    if 'hi' in incoming_msg:
        msg.body("Hi! Choose from the following options:\n"
                "1. Aadhaar check status\n"
                "2. Post sightings\n"
                "3. Search by photo")
        responded = True
    
    elif 'aadhaar' in incoming_msg:
        incoming_msg = incoming_msg.split()
        aadhaar = incoming_msg[1]
        
        try:
            aadhaar_number = aadhaar
                
            # Your database search logic here
            # This is a mock response
            try:
                if Missing.query.filter_by(missing_aadhaar=aadhaar_number).first().status == 'missing':
                    status = 'missing'
                    
                elif Missing.query.filter_by(missing_aadhaar=aadhaar_number).first().status == 'sighted':
                    status = 'sighted'
                elif Missing.query.filter_by(missing_aadhaar=aadhaar_number).first().status == 'found':
                    status = 'found'
            except:
                status = 'neverlost'
            msg.body(f"Status: {status}")
            return str(resp)
            
        except Exception as e:
            logger.error(f"Error processing Aadhaar: {str(e)}", exc_info=True)
            msg.body('Error processing Aadhaar. Please try again.')
            return str(resp)
        


    elif '1' in incoming_msg:
        msg.body("Enter the Aadhaar number as 'Aadhaar <number>'")
        responded = True
    elif '2' in incoming_msg:
        msg.body("Enter the location")
        responded = True
    elif '3' in incoming_msg:
        msg.body("Please send an image")
        image_expected = True
        responded = True

    if not responded:
        msg.body('I only know about coding, sorry!')
    return str(resp)



if __name__ == '__main__':
    app.run(debug=True)