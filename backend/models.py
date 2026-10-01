from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    farmer_name = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(15), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    village = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    farm_name = db.Column(db.String(100), nullable=True)
    farm_size = db.Column(db.Float, nullable=True)
    primary_crop = db.Column(db.String(100), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    
    reports = db.relationship('AnalysisReport', backref='farmer', lazy=True)

class AnalysisReport(db.Model):
    __tablename__ = 'analysis_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    # Schema for result_data {"input": {...}, "output": {...}}:
    # 1. Yield Prediction -> output: {"total_yield": float, "profit": float}
    # 2. Soil Health -> output: {"status": str, "fert": str}
    # 3. Irrigation Plan -> output: {"freq": str, "warning": str}
    # 4. Crop Recommendation -> output: {"recommended_crop": str, "confidence": str, "time": str, "reason": str}
    # 5. Field & Soil Metrics -> output: {"recommended_crop": str, "seed_bags": int, "water_need": str}
    analysis_type = db.Column(db.String(50), nullable=False)
    input_data = db.Column(db.JSON, nullable=True)
    result_data = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
