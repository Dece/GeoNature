from flask_sqlalchemy import SQLAlchemy
from flask import json
from geoalchemy2 import Geometry

db = SQLAlchemy()

class T_ObsContact(db.Model):
    # __tablename__       = 't_obs_contact'
    # __table_args__      = {'schema':'contact'}
    # id_obs_contact      = db.Column(db.BigInteger, primary_key=True)
    # id_lot              = db.Column(db.Integer, db.ForeignKey("meta.t_lots.id_lot"), nullable=False)
    # id_nomenclature_technique_obs   = db.Column(db.Integer, db.ForeignKey("meta.t_nomenclatures.id_nomenclature"), nullable=False)
    # id_numerisateur     = db.Column(db.Integer, db.ForeignKey("utilisateurs.t_roles.id_role"), nullable=False)
    # date_min            = db.Column(db.Date, nullable=False)
    # date_max            = db.Column(db.Date, nullable=False)
    # heure_obs           = db.Column(db.Integer)
    # insee               = db.Column(db.Text(length='5'))
    # altitude_min        = db.Column(db.Integer)
    # altitude_max        = db.Column(db.Integer)
    # saisie_initiale     = db.Column(db.Text(length='20'))
    # supprime            = db.Column(db.BOOLEAN(create_constraint=False))
    # date_insert         = db.Column(db.Date)
    # date_update         = db.Column(db.Date)
    # contexte_obs        = db.Column(db.Text)
    # commentaire         = db.Column(db.Text)
    # the_geom_local      = db.Column(Geometry)
    # the_geom_3857       = db.Column(Geometry)

    __tablename__       = 't_obs_contact'
    __table_args__      = {'schema':'contact'}
    id_obs_contact      = db.Column(db.BigInteger, primary_key=True)
    id_lot              = db.Column(db.Integer, nullable=False)
    id_nomenclature_technique_obs   = db.Column(db.Integer, nullable=False)
    id_numerisateur     = db.Column(db.Integer, nullable=False)
    date_min            = db.Column(db.Date, nullable=False)
    date_max            = db.Column(db.Date, nullable=False)
    heure_obs           = db.Column(db.Integer)
    insee               = db.Column(db.Text(length='5'))
    altitude_min        = db.Column(db.Integer)
    altitude_max        = db.Column(db.Integer)
    saisie_initiale     = db.Column(db.Text(length='20'))
    supprime            = db.Column(db.BOOLEAN(create_constraint=False))
    date_insert         = db.Column(db.DateTime(timezone=False))
    date_update         = db.Column(db.DateTime(timezone=False))
    contexte_obs        = db.Column(db.Text)
    commentaire         = db.Column(db.Text)
    the_geom_local      = db.Column(Geometry)
    the_geom_3857       = db.Column(Geometry)
    
    def json(self):
        return {column.key: getattr(self, column.key) 
                if not isinstance(column.type, (db.Date, db.DateTime)) 
                else json.dumps(getattr(self, column.key)) 
                for column in self.__table__.columns }

    @classmethod
    def find_by_id(cls, id):
        return cls.query.filter_by(id_obs_contact=id).first()

    def add_to_db(self):
        db.session.add(self)
        db.session.commit()

    def modif_db(self):
        db.session.merge(self)
        db.session.commit()

    def delete_from_db(self):
        db.session.delete(self)
        db.session.commit()
    
    def rollback(self):
        db.session.rollback()