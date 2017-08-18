
'''
Fichier de configuration générale de l'application
'''

SQLALCHEMY_DATABASE_URI = "postgresql://geonatuser:T,0602,L@51.254.242.81:5432/geonature2db"
SQLALCHEMY_TRACK_MODIFICATIONS = False


DEBUG=True


SESSION_TYPE = 'filesystem'
SECRET_KEY = 'super secret key'
COOKIE_EXPIRATION = 3600
COOKIE_AUTORENEW = True

#File
import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = 'static/medias'