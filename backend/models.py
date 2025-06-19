from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

class Post(db.Model):
    __tablename__ = 'posts'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    source_url = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500))
    release_date = db.Column(db.String(50), nullable=False)
    provider = db.Column(db.String(100))
    type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'summary': self.summary,
            'source_url': self.source_url,
            'image_url': self.image_url,
            'release_date': self.release_date,
            'provider': self.provider,
            'type': self.type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
