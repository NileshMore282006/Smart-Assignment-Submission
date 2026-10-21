import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load .env file from backend directory if present
load_dotenv(BASE_DIR / '.env')

class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-smart-assignment-insecure-key')
    
    # SQLite database inside backend/instance or backend/
    default_db_path = BASE_DIR / 'smart_assignment.db'
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', f'sqlite:///{default_db_path}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS Origins (allow comma-separated URLs)
    cors_raw = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')
    CORS_ORIGINS = [origin.strip() for origin in cors_raw.split(',') if origin.strip()]
    
    # JWT Settings
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '24'))
    
    # Max file upload size: 15 MB
    MAX_CONTENT_LENGTH = 15 * 1024 * 1024

class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    DEBUG = False
    TESTING = True
    # Isolated in-memory SQLite for automated tests
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret-key-do-not-use-in-production'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    # In production, require an explicitly set SECRET_KEY
    SECRET_KEY = os.getenv('SECRET_KEY')

config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
