'''
    Description des options de configuration
'''

import os

from marshmallow import Schema, fields
from marshmallow.validate import OneOf, Regexp


class CasUserSchemaConf(Schema):
    URL = fields.Url(
        missing='https://inpn2.mnhn.fr/authentication/information'
    )
    ID = fields.String(
        missing='mon_id'
    )
    PASSWORD = fields.String(
        missing='mon_pass'
    )


class CasSchemaConf(Schema):
    CAS_URL_LOGIN = fields.Url(missing='https://preprod-inpn.mnhn.fr/auth/login')
    CAS_URL_LOGOUT = fields.Url(missing='https://preprod-inpn.mnhn.fr/auth/logout')
    CAS_URL_VALIDATION = fields.String(missing='https://preprod-inpn.mnhn.fr/auth/serviceValidate')
    CAS_USER_WS = fields.Nested(CasUserSchemaConf, missing=dict())


class RightsSchemaConf(Schema):
    NOTHING = fields.Integer(missing=0)
    MY_DATA = fields.Integer(missing=1)
    MY_ORGANISM_DATA = fields.Integer(missing=2)
    ALL_DATA = fields.Integer(missing=3)


class GnPySchemaConf(Schema):
    SQLALCHEMY_DATABASE_URI = fields.String(
        required=True,
        validate=Regexp(
            '^postgresql:\/\/.*:.*@\w+:\w+\/\w+$',
            0,
            'Database uri is invalid ex: postgresql://monuser:monpass@server:port/db_name'
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = fields.Boolean(missing=False)
    SESSION_TYPE = fields.String(missing='filesystem')
    SECRET_KEY = fields.String(required=True)
    COOKIE_EXPIRATION = fields.Integer(missing=7200)
    COOKIE_AUTORENEW = fields.Boolean(missing=True)

    UPLOAD_FOLDER = fields.String(missing='static/medias')
    BASE_DIR = fields.String(missing=os.path.abspath(os.path.dirname(__file__)))

class GnGeneralSchemaConf(Schema):
    appName = fields.String(missing='Geonature2')
    DEFAULT_LANGUAGE = fields.String(missing='fr')
    PASS_METHOD = fields.String(
        missing='hash',
        validate=OneOf(['hash', 'md5'])
    )
    DEBUG = fields.Boolean(missing=False)
    URL_APPLICATION = fields.Url(required=True)
    API_ENDPOINT = fields.Url(required=True)
    API_TAXHUB = fields.Url(required=True)
    ID_APPLICATION_GEONATURE = fields.Integer(missing=14)

    XML_NAMESPACE = fields.String(missing="{http://inpn.mnhn.fr/mtd}")
    MTD_API_ENDPOINT = fields.Url(missing="https://preprod-inpn.mnhn.fr/mtd")
    CAS = fields.Nested(CasSchemaConf, missing=dict())
    RIGHTS = fields.Nested(RightsSchemaConf, missing=dict())


class ConfigError(Exception):
    '''
        Configuration error class
    '''
    def __init__(self, value):
        self.value = value

    def __str__(self):
        return repr(self.value)
