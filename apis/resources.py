
from flask import Response, app, jsonify, make_response, render_template, request, send_file
from deepface import DeepFace
import cv2
from flask_restful import Resource, Api
from flask_cors import cross_origin
from werkzeug.security import generate_password_hash,check_password_hash
from models import User, db, Aadhaar, Profile, Missing
import os
from werkzeug.utils import secure_filename
import jwt
from datetime import datetime, timedelta
from config import DevelopmentConfig
import uuid
from functools import wraps


api=Api(prefix='/api')

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

def save_file(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        new_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, new_filename)
        file.save(filepath)
        return filepath
    return None



class AadhaarData(Resource):

    def post(self):
        try:
            # Ensure upload folder exists
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
            aadhaarphoto_path = save_file(aadhaar_photo)

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
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

            photo_path = save_file(missing_photo)
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
                status='active'
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

# Convert the function to a class-based resource
class SearchZonesResource(Resource):
    def calculate_search_zones(self, lat, lng, time_elapsed):
        """
        Computes three probability zones based on the time elapsed since last seen.
        """
        speed_walk = 5  # km/h
        speed_run = 10  # km/h
        time_hours = time_elapsed / 60.0  # Convert minutes to hours

        zones = [
            {"radius": speed_walk * time_hours * 1000, "color": "red"},      # Highly probable
            {"radius": speed_run * time_hours * 1000, "color": "orange"},    # Less probable
            {"radius": speed_run * time_hours * 1500, "color": "yellow"}     # Least probable
        ]

        return zones

    def get(self):
        """
        GET endpoint to fetch probable zones based on last seen time.
        """
        lat = float(request.args.get("lat"))
        lng = float(request.args.get("lng"))
        time_elapsed = float(request.args.get("timeElapsed"))

        zones = self.calculate_search_zones(lat, lng, time_elapsed)
        return zones

# Register the resource properly
api.add_resource(SearchZonesResource, '/search_zones')


class Image(Resource):
    def get(self, filename):
        return send_file('filename', mimetype='image/jpg')
    
api.add_resource(Image, '/image/<string:filename>')

class MissingList(Resource):
    def get(self):
        missing = Missing.query.all()
        print(missing[0].missing_aadhaar)
        print([m.serialize() for m in missing])
        return make_response(jsonify({'missing': [m.serialize() for m in missing]}), 200)
    
api.add_resource(MissingList, '/missing')