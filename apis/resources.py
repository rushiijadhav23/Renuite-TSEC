
from flask import Response, app, jsonify, make_response, render_template, request, send_file
from deepface import DeepFace
import cv2
from flask_restful import Resource, Api
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash,check_password_hash
from models import User, db, Aadhaar, Profile, Missing, Sighting
import os
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
from config import DevelopmentConfig
import uuid
from functools import wraps
import joblib
import math
import random
import numpy as np

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the Haversine distance between two points on the earth.
    """
    R = 6371  # Radius of the earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c  # Distance in km
    return distance


api=Api(prefix='/api')

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

# Default walking speed based on age and gender
def get_walk_speed_default(age, gender):
    """
    Returns a default walking speed based on age and gender.
    """
    if age < 13:
        return 3 if gender == 'female' else 3.5  # Children walking speed based on gender
    elif age < 20:
        return 4.5 if gender == 'female' else 5  # Teens walking speed based on gender
    elif age < 40:
        return 5 if gender == 'female' else 5.5  # Young adults walking speed based on gender
    elif age < 60:
        return 4.5 if gender == 'female' else 5  # Middle age walking speed based on gender
    elif age < 80:
        return 3.5 if gender == 'female' else 4  # Seniors walking speed based on gender
    else:
        return 3 if gender == 'female' else 3.5  # Elderly walking speed based on gender

# Default running speed based on age and gender
def get_run_speed_based_on_age(age, gender):
    """
    Returns a realistic running speed (in km/h) based on age and gender.
    """
    if age < 13:
        return 7 if gender == 'female' else 8  # Children running speed based on gender
    elif age < 20:
        return 9 if gender == 'female' else 10  # Teens running speed based on gender
    elif age < 40:
        return 10 if gender == 'female' else 11  # Young adults running speed based on gender
    elif age < 60:
        return 8 if gender == 'female' else 9  # Middle age running speed based on gender
    elif age < 80:
        return 6 if gender == 'female' else 7  # Seniors running speed based on gender
    else:
        return 4 if gender == 'female' else 5  # Elderly running speed based on gender

# Calculate search zones based on last seen time, age, and gender
def calculate_search_zones(lat, lng, time_elapsed, age, gender):
    """
    Computes three probability zones based on the time elapsed since last seen.
    """
    # Get walking speed based on age and gender
    speed_walk = get_walk_speed_default(age, gender)

    # Get running speed based on age and gender
    speed_run = get_run_speed_based_on_age(age, gender)
    
    time_hours = time_elapsed / 60.0  # Convert minutes to hours

    # Calculate search zones based on walking speed and time elapsed
    zones = [
        {"radius": speed_walk * time_hours * 1000, "color": "red"},      # Highly probable
        {"radius": speed_walk * time_hours * 2000, "color": "orange"},    # Less probable
        {"radius": speed_run * time_hours * 1000, "color": "yellow"}     # Least probable
    ]

    return zones

# Flask-RESTful resource class for search zones
class SearchZonesResource(Resource):
    def get(self):
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

# Add the resource to the API
api.add_resource(SearchZonesResource, '/api/search_zones')


def get_priority_cases(cases, org_lat, org_lng):
    """
    Categorize cases by priority based on various factors.
    """
    high_priority = []
    medium_priority = []
    low_priority = []

    for case in cases:
        # Calculate time elapsed since last seen
        time_elapsed = (datetime.utcnow() - case.last_seen).total_seconds() / 3600  # hours
        distance = calculate_distance(org_lat, org_lng, case.last_seen_lat, case.last_seen_lng)

        # Priority scoring based on multiple factors
        priority_score = 0
        
        # Age factor
        if case.age < 13 or case.age > 60:
            priority_score += 3
        elif case.age < 18:
            priority_score += 2
        
        # Time elapsed factor
        if time_elapsed > 48:
            priority_score += 3
        elif time_elapsed > 24:
            priority_score += 2
        elif time_elapsed > 12:
            priority_score += 1
            
        # Distance factor
        if distance < 10:  # Within 10km
            priority_score += 2
        elif distance < 20:  # Within 20km
            priority_score += 1

        case_dict = {
            'id': case.id,
            'name': case.name,
            'age': case.age,
            'gender': case.gender,
            'last_seen': case.last_seen.isoformat(),
            'time_elapsed': round(time_elapsed, 1),
            'description': case.description,
            'distance': round(distance, 2)
        }

        # Categorize based on priority score
        if priority_score >= 6:
            high_priority.append(case_dict)
        elif priority_score >= 3:
            medium_priority.append(case_dict)
        else:
            low_priority.append(case_dict)

    return high_priority, medium_priority, low_priority

class PoliceDashboardResource(Resource):
    def get(self, id):
        try:
            # Get location parameters
            lat = float(request.args.get('lat'))
            lng = float(request.args.get('lng'))

            # Get all active missing person cases
            cases = MissingPerson.query.filter_by(status='active').all()

            # Static notifications for this police station
            notifications = [
                {
                    'id': 1,
                    'title': 'High Priority Case Alert',
                    'message': 'A missing person has been reported near your station.',
                    'timestamp': '2025-01-30T12:00:00'
                },
                {
                    'id': 2,
                    'title': 'Case Update',
                    'message': 'The status of case #123 has been updated.',
                    'timestamp': '2025-01-29T15:30:00'
                },
                {
                    'id': 3,
                    'title': 'New Evidence Found',
                    'message': 'New evidence has been submitted for case #456.',
                    'timestamp': '2025-01-28T10:15:00'
                }
            ]

            # Categorize cases by priority
            high_priority, medium_priority, low_priority = get_priority_cases(cases, lat, lng)

            return {
                'total_missing_persons': len(cases),
                'high_priority_cases': high_priority,
                'medium_priority_cases': medium_priority,
                'low_priority_cases': low_priority,
                'notifications': notifications
            }

        except Exception as e:
            return {'error': str(e)}, 500


class NgoDashboardResource(Resource):
    def get(self, id):
        try:
            # Get location parameters
            lat = float(request.args.get('lat'))
            lng = float(request.args.get('lng'))

            # Get all active missing person cases
            cases = MissingPerson.query.filter_by(status='active').all()

            # Static notifications for this NGO
            notifications = [
                {
                    'id': 1,
                    'title': 'Volunteer Needed',
                    'message': 'We need volunteers to assist with search operations.',
                    'timestamp': '2025-01-30T09:00:00'
                },
                {
                    'id': 2,
                    'title': 'New Case Alert',
                    'message': 'A new missing person case has been reported in your area.',
                    'timestamp': '2025-01-29T13:45:00'
                },
                {
                    'id': 3,
                    'title': 'Awareness Campaign',
                    'message': 'Join our awareness campaign this weekend.',
                    'timestamp': '2025-01-28T08:00:00'
                }
            ]

            # Categorize cases by priority
            high_priority, medium_priority, low_priority = get_priority_cases(cases, lat, lng)

            return {
                'total_missing_persons': len(cases),
                'high_priority_cases': high_priority,
                'medium_priority_cases': medium_priority,
                'low_priority_cases': low_priority,
                'notifications': notifications
            }

        except Exception as e:
            return {'error': str(e)}, 500


# Register the resources
api.add_resource(PoliceDashboardResource, '/api/organization/police/<int:id>/dashboard')
api.add_resource(NgoDashboardResource, '/api/organization/ngo/<int:id>/dashboard')

class apiCheck(Resource):

    # Check API
    @cross_origin()
    def get(self):
        return make_response(jsonify({'status': 'Success'}), 200)
    
api.add_resource(apiCheck, '/apiCheck')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if request.headers.get('x-access-token'):
            token = request.headers['x-access-token']
            print(token)
        if not token:
            return make_response(jsonify({'message': 'Token is missing!'}), 401)
        try:
            data = jwt.decode(
                token, DevelopmentConfig.SECRET_KEY, algorithms=["HS256"])
            print(data)
            current_user = User.query.filter_by(public_id=data['public_id']).first()
            if current_user.public_id == "None":
                current_user.public_id=str(uuid.uuid4())
                db.session.commit()
                print("hi")
                return make_response(jsonify({'message': 'Token is invalid!'}), 401)
        except Exception as e:
            print(e)
            return make_response(jsonify({'message': 'Token is invalid!'}), 401)
        return f(current_user, *args, **kwargs)
    return decorated

def token_check(token):
    try:
        data = jwt.decode(
            token, DevelopmentConfig.SECRET_KEY, algorithms=["HS256"])
        current_user = User.query.filter_by(public_id=data['public_id']).first()
        if current_user.public_id == "None":
            current_user.public_id=str(uuid.uuid4())
            db.session.commit()
            return None
    except:
        return None
    return current_user

class verify_token(Resource):
    method_decorators = [token_required]

    @cross_origin()
    def get(self, current_user):
        user = User.query.filter_by(public_id=current_user.public_id).first()
        return make_response(jsonify({'message': 'Token verified successfully!', 'status': 'success','user': user.serialize()}), 200)

api.add_resource(verify_token, '/verify_token')

class Register(Resource):

    # Register a new user
    def post(self):
        data = request.json
        print(data)
        user = User.query.filter_by(aadhaarid=data['aadhaarId']).first()
        if user:
            return make_response(jsonify({'message': 'User already exists', 'status': 'error'}), 409)
        else:
            if data['name'] == "" or data['dob'] == "" or data['address'] == "" or data['phone'] == "" or data['email'] == "" or data['aadhaarId'] == "" or data['password'] == "":
                print(1)
                return make_response(jsonify({'message': 'All fields are required', 'status': 'error'}), 400)
            elif data['password'] != data['confirmPassword']:
                print(2)
                return make_response(jsonify({'message': 'Passwords do not match', 'status': 'error'}), 400)
            elif data['password'] == data['aadhaarId']:
                print(3)
                return make_response(jsonify({'message': 'Password cannot be the same as aadhaarId', 'status': 'error'}), 400)
            elif data['email'].find('@') == -1 or data['email'].find('.') == -1:
                print(4)
                return make_response(jsonify({'message': 'Invalid email', 'status': 'error'}), 400)
            # elif Aadhaar.query.filter_by(aadhaarid=data['aadhaarId']).first()==None:
            #     print(5)
            #     return make_response(jsonify({'message': 'Aadhaar ID is invalid or not in aadhaar database', 'status': 'error'}), 400)
                
            try:
                hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
                date_obj = datetime.strptime(data['dob'], '%Y-%m-%d').date()
                new_profile = Profile(
                    name=data['name'],
                    dob=date_obj,
                    address=data['address'],
                    phone=data['phone'],
                    email=data['email'],
                    aadhaarid=data['aadhaarId'],
                    status='active'
                )
                db.session.add(new_profile)
                db.session.commit()
                print(new_profile.profileid)
                new_user = User(
                    aadhaarid=data['aadhaarId'],
                    passhash=hashed_password,
                    role='user',
                    public_id = str(uuid.uuid4()),
                    profileid = new_profile.profileid
                )
                db.session.add(new_user)
                db.session.commit()
                return make_response(jsonify({'message': 'User registered successfully', 'status': 'success'}), 201)
            except Exception as e:
                db.session.rollback()
                print('except')
                print(e)
                return make_response(jsonify({'error': str(e)}), 500)
        

api.add_resource(Register, '/register')


class Login(Resource):
    def post(self):
        try:
            data = request.json
            
            # Validate input
            if not data or not data.get('aadhaarId') or not data.get('password'):
                return make_response(jsonify({
                    'message': 'Please provide Aadhaar ID and password',
                    'status': 'error'
                }), 400)

            # Find user by Aadhaar ID
            user = User.query.filter_by(aadhaarid=data['aadhaarId']).first()

            if not user:
                return make_response(jsonify({
                    'message': 'Invalid Aadhaar ID or password',
                    'status': 'error'
                }), 401)

            # Check password
            if not check_password_hash(user.passhash, data['password']):
                return make_response(jsonify({
                    'message': 'Invalid Aadhaar ID or password',
                    'status': 'error'
                }), 401)

            # Get user profile
            profile = Profile.query.filter_by(profileid=user.profileid).first()
            print(user.public_id)

            # Generate JWT token
            token = jwt.encode({
                'public_id': user.public_id,
                'role': user.role,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, DevelopmentConfig.SECRET_KEY, algorithm='HS256')

            print(token)

            return make_response(jsonify({
                'message': 'Login successful',
                'status': 'success',
                'token': token,
                'user': {
                    'aadhaarId': user.aadhaarid,
                    'role': user.role,
                    'name': profile.name,
                    'email': profile.email,
                    'phone': profile.phone,
                    'status': profile.status
                }
            }), 200)

        except Exception as e:
            return make_response(jsonify({
                'message': str(e),
                'status': 'error'
            }), 500)

# Add the resource to your API
api.add_resource(Login, '/login')


UPLOAD_FOLDER = 'database_photos'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file,path="database_photos"):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        new_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(path, new_filename)
        file.save(filepath)
        return filepath
    return None



class AadhaarData(Resource):

    def post(self):
        try:
            # Ensure upload folder exists
            os.makedirs('database_photos', exist_ok=True)

            # Get form data
            aadhaarno = request.form.get('aadhaarno')
            aadhaardob = request.form.get('aadhaardob')
            aadhaarname = request.form.get('aadhaarname')
            aadhaaraddress = request.form.get('aadhaaraddress')
            aadhaarphone = request.form.get('aadhaarphone')
            aadhaaremail = request.form.get('aadhaaremail')
            aadhaargender = request.form.get('aadhaargender')  # Add gender field


            # Validation checks
            if not all([aadhaarno, aadhaardob, aadhaarname, aadhaaraddress,aadhaargender]):
                return make_response(jsonify({
                    'message': 'Required fields missing',
                    'status': 'error'
                }), 400)

            # Check if Aadhaar number already exists
            existing_aadhaar = Aadhaar.query.filter_by(aadhaarno=aadhaarno).first()
            if existing_aadhaar:
                return make_response(jsonify({
                    'message': 'Aadhaar number already exists',
                    'status': 'error'
                }), 409)
            
            # Validate gender value
            if aadhaargender not in ['male', 'female', 'other']:
                return make_response(jsonify({
                    'message': 'Invalid gender value',
                    'status': 'error'
                }), 400)


            # Handle file uploads
            aadhaar_photo = request.files.get('aadhaarphoto')

            if not ( aadhaar_photo):
                return make_response(jsonify({
                    'message': 'photo are required',
                    'status': 'error'
                }), 400)

            # Save files and get paths
            aadhaarphoto_path = save_file(aadhaar_photo, path="database_photos")

            if not (aadhaarphoto_path):
                return make_response(jsonify({
                    'message': 'Invalid file format. Only PNG, JPG, JPEG allowed',
                    'status': 'error'
                }), 400)

            # Convert date string to date object
            try:
                date_obj = datetime.strptime(aadhaardob, '%Y-%m-%d').date()
            except ValueError:
                return make_response(jsonify({
                    'message': 'Invalid date format',
                    'status': 'error'
                }), 400)

            # Create new Aadhaar record
            new_aadhaar = Aadhaar(
                aadhaarno=aadhaarno,
                aadhaardob=date_obj,
                aadhaarname=aadhaarname,
                aadhaaraddress=aadhaaraddress,
                aadhaarphone=aadhaarphone,
                aadhaaremail=aadhaaremail,
                aadhaargender=aadhaargender, 
                aadhaarphoto=aadhaarphoto_path
            )

            db.session.add(new_aadhaar)
            db.session.commit()

            return make_response(jsonify({
                'message': 'Aadhaar data added successfully',
                'status': 'success',
                'aadhaar_id': new_aadhaar.aadhaarid
            }), 201)

        except Exception as e:
            db.session.rollback()
            print(e)
            return make_response(jsonify({
                'message': str(e),
                'status': 'error'
            }), 500)

# Add the resource to your API
api.add_resource(AadhaarData, '/aadhaardata')

UPLOAD_FOLDER = 'missing_photos'

class ReportMissing(Resource):
    method_decorators = [token_required]

    def post(self, current_user):
        try:
            # Ensure upload folder exists
            os.makedirs('missing_photos', exist_ok=True)

            # Get form data
            missing_aadhaar = request.form.get('missing_aadhaar')
            missingdate = request.form.get('missingdate')
            missingplace = request.form.get('missingplace')
            characteristics = request.form.get('characteristics')
            contactno = request.form.get('contactno')
            email = request.form.get('email')
            

            # Validation checks
            if not all([missing_aadhaar, missingdate, missingplace, contactno, email]):
                return make_response(jsonify({
                    'message': 'Required fields missing',
                    'status': 'error'
                }), 400)

            # Handle file upload
            missing_photo = request.files.get('missingphoto')
            if not missing_photo:
                return make_response(jsonify({
                    'message': 'Missing person photo is required',
                    'status': 'error'
                }), 400)

            photo_path = save_file(missing_photo, path="missing_photos")
            if not photo_path:
                return make_response(jsonify({
                    'message': 'Invalid file format. Only PNG, JPG, JPEG allowed',
                    'status': 'error'
                }), 400)

            # Convert date string to date object
            try:
                date_obj = datetime.strptime(missingdate, '%Y-%m-%d').date()
            except ValueError:
                return make_response(jsonify({
                    'message': 'Invalid date format',
                    'status': 'error'
                }), 400)

            # Create new Missing record
            new_missing = Missing(
                missing_aadhaar=missing_aadhaar,
                informer_aadhaar=current_user.aadhaarid,
                missingdate=date_obj,
                missingplace=missingplace,
                missingphoto=photo_path,
                contactno=contactno,
                email=email,
                characteristics=characteristics,
                status='missing'
            )

            db.session.add(new_missing)
            db.session.commit()

            return make_response(jsonify({
                'message': 'Missing person report submitted successfully',
                'status': 'success',
                'missing_id': new_missing.missingid
            }), 201)

        except Exception as e:
            db.session.rollback()
            return make_response(jsonify({
                'message': str(e),
                'status': 'error'
            }), 500)

# Add the resource to your API
api.add_resource(ReportMissing, '/report_missing')

# @app.route('/api/verify/single', methods=['GET'])
# def analyze_face_single():
#     try:
#         # Read an image file
#         img = cv2.imread('5729970001281024_photo.jpg')
        
#         # Analyze the face using Deepface
#         result = DeepFace.verify("5729970001281024_photo.jpg", "n.png")

#         # Return the analysis results as JSON
#         response = jsonify({
#             "is_verified": result["verified"]
#         })
#         return response

#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 400



class Image(Resource):
    def get(self):
        filename = request.args.get('img')
        print(filename)
        print(os.path.join(filename))
        if os.path.exists(filename):
                print(f"File size: {os.path.getsize(filename)} bytes")
                return send_file(filename, mimetype='image/jpeg')
        else:
            print(f"File not found: {filename}")
            return {"error": "File not found"}, 404
        # return Response(filename, mimetype="image/jpeg")
    
api.add_resource(Image, '/image')


class MissingList(Resource):
    def get(self):
        missing = Missing.query.all()
        print(missing)
        # print(missing[0].missing_aadhaar)
        # print([m.serialize() for m in missing])
        return make_response(jsonify({'missing': [m.serialize() for m in missing]}), 200)
    
api.add_resource(MissingList, '/missing')

class SearchMissing(Resource):
    def post(self):
        data = request.files['image']
        # get formData
        lat = request.form.get('latitude')
        long = request.form.get('longitude')
        print("hi")
        print(data)
        try:
            # Specify the path to your database folder
            db_path = "missing_photos"
            # svae file
            data.save("search.jpeg")
            
            # Use DeepFace.find() to search for matches in the database folder
            results = DeepFace.find(
                img_path='search.jpeg',
                db_path=db_path
            )
            
            # The results will be a list of pandas DataFrames containing matches
            if len(results) > 0 and not results[0].empty:
                missing = Missing.query.filter_by(missingphoto=results[0]["identity"][0]).first()
                try:
                    missing.status = "sighted"
                    missingid=missing.missingid
                    db.session.commit()
                
                    sighting = Sighting(missingid=missingid,sightingdate=datetime.now(),sightingplace=f"Lat: {lat}, Lon: {long}",sightingphoto="search.jpeg")
                    data.save(f"sightings/{missingid}_sighting_{datetime.now()}.jpeg")
                    db.session.add(sighting)
                    db.session.commit()
                except Exception as e:
                    db.session.rollback()
                    print(e)

                response = jsonify({
                    "matches_found": True,
                    "number_of_matches": len(results[0]),
                    "matched_files": results[0]["identity"].tolist()
                })
                print(response.json)
                return (make_response(response, 200))
            else:
                response = jsonify({
                    "matches_found": False,
                    "message": "No matches found in database"
                })
                print(response.json)
                return (make_response(response, 200))
                
        except Exception as e:
            print(e)
            return jsonify({
                "error": str(e)
            })
        # missing = Missing.query.filter_by(missing_aadhaar=data['aadhaarId']).all()
        # print(missing)
        # return make_response(jsonify({'missing': [m.serialize() for m in missing]}), 200)

api.add_resource(SearchMissing, '/search_missing')

class Search(Resource):
    def get(self):  # Added self parameter
        try:
            # Specify the path to your database folder
            db_path = "database_photos"
            
            # Use DeepFace.find() to search for matches in the database folder
            results = DeepFace.find(
                img_path="r3.jpeg",
                db_path=db_path
            )
            
            # The results will be a list of pandas DataFrames containing matches
            if len(results) > 0 and not results[0].empty:
                response = jsonify({
                    "matches_found": True,
                    "number_of_matches": len(results[0]),
                    "matched_files": results[0]["identity"].tolist()
                })
            else:
                response = jsonify({
                    "matches_found": False,
                    "message": "No matches found in database"
                })
            return response
                
        except Exception as e:
            return jsonify({
                "error": str(e)
            })


api.add_resource(Search,'/search')

class search_by_aadhaar(Resource):
    def post(self):
        try:
            data = request.get_json()
            aadhaar_number = data.get('aadhaar_number')
            
            if not aadhaar_number:
                return jsonify({
                    'message': 'Aadhaar number is required',
                    'status': 'error'
                }), 400
                
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
            
            return jsonify({
                'status': status
            })
            
        except Exception as e:
            return jsonify({
                'message': str(e),
                'status': 'error'
            }), 500
    
api.add_resource(search_by_aadhaar, '/search_by_aadhaar')


# whatsapp api _______________________________________________________________________________________________________________________________________whatsapp api
