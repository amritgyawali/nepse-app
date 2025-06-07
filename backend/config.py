"""Configuration settings for the NEPSE Stock App Backend"""

import os
from typing import Dict, Any
from datetime import timedelta

class Config:
    """Base configuration class"""
    
    # Flask Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Cache Configuration
    CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', 300))  # 5 minutes
    CACHE_MAX_SIZE = int(os.getenv('CACHE_MAX_SIZE', 1000))
    
    # API Rate Limiting
    RATE_LIMIT_PER_MINUTE = int(os.getenv('RATE_LIMIT_PER_MINUTE', 60))
    RATE_LIMIT_PER_HOUR = int(os.getenv('RATE_LIMIT_PER_HOUR', 1000))
    
    # External API Configuration
    NEPSE_API_BASE_URL = os.getenv('NEPSE_API_BASE_URL', 'https://www.nepalstock.com/api')
    MEROLAGANI_API_BASE_URL = os.getenv('MEROLAGANI_API_BASE_URL', 'https://merolagani.com/api')
    
    # Request Timeout Configuration
    REQUEST_TIMEOUT = int(os.getenv('REQUEST_TIMEOUT', 30))
    MAX_RETRIES = int(os.getenv('MAX_RETRIES', 3))
    RETRY_DELAY = float(os.getenv('RETRY_DELAY', 1.0))
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FORMAT = os.getenv('LOG_FORMAT', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')
    
    # Database Configuration (for future use)
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///nepse_app.db')
    
    # Scheduler Configuration
    SCHEDULER_TIMEZONE = os.getenv('SCHEDULER_TIMEZONE', 'Asia/Kathmandu')
    CACHE_UPDATE_INTERVAL = int(os.getenv('CACHE_UPDATE_INTERVAL', 300))  # 5 minutes
    
    # Security Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 24)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES_DAYS', 30)))
    
    # Feature Flags
    ENABLE_CACHING = os.getenv('ENABLE_CACHING', 'True').lower() == 'true'
    ENABLE_RATE_LIMITING = os.getenv('ENABLE_RATE_LIMITING', 'True').lower() == 'true'
    ENABLE_METRICS = os.getenv('ENABLE_METRICS', 'True').lower() == 'true'
    
    # Market Data Configuration
    MARKET_OPEN_TIME = os.getenv('MARKET_OPEN_TIME', '11:00')
    MARKET_CLOSE_TIME = os.getenv('MARKET_CLOSE_TIME', '15:00')
    MARKET_TIMEZONE = os.getenv('MARKET_TIMEZONE', 'Asia/Kathmandu')
    
    @classmethod
    def get_config_dict(cls) -> Dict[str, Any]:
        """Return configuration as dictionary"""
        return {
            key: getattr(cls, key)
            for key in dir(cls)
            if not key.startswith('_') and not callable(getattr(cls, key))
        }

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    CACHE_TIMEOUT = 60  # 1 minute for faster development
    LOG_LEVEL = 'DEBUG'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    CACHE_TIMEOUT = 600  # 10 minutes
    LOG_LEVEL = 'WARNING'
    ENABLE_RATE_LIMITING = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    CACHE_TIMEOUT = 1  # Very short for testing
    LOG_LEVEL = 'ERROR'

# Configuration mapping
config_map = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name: str = None) -> Config:
    """Get configuration based on environment"""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    return config_map.get(config_name, DevelopmentConfig)