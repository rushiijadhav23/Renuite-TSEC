
class Config(object):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    # SECRET_KEY = uuid.uuid4().hex
    SECRET_KEY = 'mysecret'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SECURITY_USER_IDENTITY_ATTRIBUTES = "username"
