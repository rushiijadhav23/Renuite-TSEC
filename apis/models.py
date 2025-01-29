from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db=SQLAlchemy()

class User(db.Model):
    __TableName__ = 'user'
    userid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    aadhaarid = db.Column(db.String(12), nullable=False, unique=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    passhash = db.Column(db.String(1024), nullable=False)
    profileid = db.Column(db.String(1024), nullable=False)
    role = db.Column(db.String(10), nullable=False)
    #sessionid = db.Column(db.String(20), db.ForeignKey('session.sid'), nullable=True)
     
    @property
    def password(self):
        raise AttributeError('Password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.passhash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.passhash, password)

class Profile(db.Model):
    __TableName__ = 'profile'
    profileid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    address = db.Column(db.String(1024), nullable=False)
    phone = db.Column(db.String(10), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    aadhaarid = db.Column(db.String(12), db.ForeignKey('aadhaar.aadhaarid'), nullable=False)
    aadhaar = db.relationship('Aadhaar', backref=db.backref('profile', lazy=True))
    status = db.Column(db.String(10), nullable=False)

class Aadhaar(db.Model):
    __TableName__ = 'aadhaar'
    aadhaarid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    aadhaarno = db.Column(db.String(12), nullable=False, unique=True)
    aadhaargender = db.Column(db.String(12),nullable=False)
    aadhaardob = db.Column(db.Date, nullable=False)
    aadhaarname = db.Column(db.String(100), nullable=False)
    aadhaaraddress = db.Column(db.String(1024), nullable=False)
    aadhaarphone = db.Column(db.String(10), nullable=True)
    aadhaaremail = db.Column(db.String(100), nullable=True)
    aadhaarphoto= db.Column(db.String(1024), nullable=False)

class Missing(db.Model):
    __tablename__ = 'missing'  # Fixed tablename spelling
    missingid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    missing_aadhaar = db.Column(db.String(12), db.ForeignKey('aadhaar.aadhaarno'), nullable=False)  # Changed to aadhaarno
    missing_person = db.relationship('Aadhaar', foreign_keys=[missing_aadhaar], backref=db.backref('missing_records', lazy=True))
    informer_aadhaar = db.Column(db.String(12), db.ForeignKey('aadhaar.aadhaarno'), nullable=False)
    informer = db.relationship('Aadhaar', foreign_keys=[informer_aadhaar], backref=db.backref('missing_reports', lazy=True))
    missingdate = db.Column(db.Date, nullable=False)
    missingplace = db.Column(db.String(1024), nullable=False)
    missingphoto = db.Column(db.String(1024), nullable=True)
    contactno = db.Column(db.String(10), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(10), nullable=False)
    characteristics = db.Column(db.String(1024),nullable=True)

    def serialize(self):
        return {
            'missingid': self.missingid,
            'missing_aadhaar': self.missing_aadhaar,
            'missing_person': self.missing_person,
            'informer_aadhaar': self.informer_aadhaar,
            'informer': self.informer,
            'missingdate': self.missingdate,
            'missingplace': self.missingplace,
            'missingphoto': self.missingphoto,
            'contactno': self.contactno,
            'email': self.email,
            'status': self.status,
            'characteristics': self.characteristics
        }

class Found(db.Model):
    __tablename__ = 'found'  # Fixed tablename spelling
    foundid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    found_aadhaar = db.Column(db.String(12), db.ForeignKey('aadhaar.aadhaarno'), nullable=False)  # Changed to aadhaarno
    found_person = db.relationship('Aadhaar', foreign_keys=[found_aadhaar], backref=db.backref('found_records', lazy=True))
    informer_aadhaar = db.Column(db.String(12), db.ForeignKey('aadhaar.aadhaarno'), nullable=False)
    informer = db.relationship('Aadhaar', foreign_keys=[informer_aadhaar], backref=db.backref('found_reports', lazy=True))
    founddate = db.Column(db.Date, nullable=False)
    foundplace = db.Column(db.String(1024), nullable=False)
    foundphoto = db.Column(db.String(1024), nullable=True)
    status = db.Column(db.String(10), nullable=False)

class Sighting(db.Model):
    __tablename__ = 'sighting'  # Fixed tablename spelling
    sightingid = db.Column(db.Integer, primary_key=True, autoincrement=True, nullable=False, unique=True)
    missingid = db.Column(db.Integer, db.ForeignKey('missing.missingid'), nullable=False)
    missing = db.relationship('Missing', backref=db.backref('sightings', lazy=True))
    foundid = db.Column(db.Integer, db.ForeignKey('found.foundid'), nullable=True)
    found = db.relationship('Found', backref=db.backref('sightings', lazy=True))
    sightingdate = db.Column(db.Date, nullable=False)
    sightingplace = db.Column(db.String(1024), nullable=False)
    sightingphoto = db.Column(db.String(1024), nullable=True)
