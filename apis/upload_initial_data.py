from app import app
from models import db
from models import *
from werkzeug.security import generate_password_hash
import uuid

with app.app_context():
    db.create_all()
    db.session.commit()
    try:
        hashed_password = generate_password_hash("admin", method='pbkdf2:sha256')
    except Exception as e:
        db.session.rollback()

    print("database created")