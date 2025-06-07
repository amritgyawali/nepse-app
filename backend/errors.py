"""Custom error classes and error handling utilities for the NEPSE Stock App Backend"""

from flask import jsonify, request
from datetime import datetime
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base API error class"""
    
    def __init__(self, message: str, status_code: int = 500, payload: Optional[Dict[str, Any]] = None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert error to dictionary for JSON response"""
        error_dict = {
            'status': 'error',
            'message': self.message,
            'timestamp': datetime.now().isoformat(),
            'path': request.path if request else None,
            'method': request.method if request else None
        }
        error_dict.update(self.payload)
        return error_dict

class ValidationError(APIError):
    """Validation error for invalid input data"""
    
    def __init__(self, message: str, field: Optional[str] = None, value: Optional[Any] = None):
        payload = {}
        if field:
            payload['field'] = field
        if value is not None:
            payload['invalid_value'] = str(value)
        
        super().__init__(message, status_code=400, payload=payload)

class NotFoundError(APIError):
    """Error for resource not found"""
    
    def __init__(self, resource: str, identifier: Optional[str] = None):
        message = f"{resource} not found"
        if identifier:
            message += f": {identifier}"
        
        payload = {'resource': resource}
        if identifier:
            payload['identifier'] = identifier
        
        super().__init__(message, status_code=404, payload=payload)

class RateLimitError(APIError):
    """Error for rate limit exceeded"""
    
    def __init__(self, limit: int, window: str):
        message = f"Rate limit exceeded: {limit} requests per {window}"
        payload = {
            'limit': limit,
            'window': window,
            'retry_after': 60  # seconds
        }
        super().__init__(message, status_code=429, payload=payload)

class ExternalServiceError(APIError):
    """Error for external service failures"""
    
    def __init__(self, service: str, original_error: Optional[str] = None):
        message = f"External service error: {service}"
        if original_error:
            message += f" - {original_error}"
        
        payload = {
            'service': service,
            'type': 'external_service_error'
        }
        if original_error:
            payload['original_error'] = original_error
        
        super().__init__(message, status_code=503, payload=payload)

class CacheError(APIError):
    """Error for cache-related issues"""
    
    def __init__(self, operation: str, cache_key: Optional[str] = None):
        message = f"Cache error during {operation}"
        if cache_key:
            message += f" for key: {cache_key}"
        
        payload = {
            'operation': operation,
            'type': 'cache_error'
        }
        if cache_key:
            payload['cache_key'] = cache_key
        
        super().__init__(message, status_code=500, payload=payload)

class AuthenticationError(APIError):
    """Error for authentication failures"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status_code=401)

class AuthorizationError(APIError):
    """Error for authorization failures"""
    
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status_code=403)

def handle_api_error(error: APIError):
    """Handle API errors and return JSON response"""
    logger.error(f"API Error: {error.message} (Status: {error.status_code})")
    return jsonify(error.to_dict()), error.status_code

def handle_validation_errors(errors: Dict[str, Any]) -> Dict[str, Any]:
    """Format validation errors for consistent response"""
    return {
        'status': 'error',
        'message': 'Validation failed',
        'errors': errors,
        'timestamp': datetime.now().isoformat()
    }

def log_error(error: Exception, context: Optional[Dict[str, Any]] = None):
    """Log error with context information"""
    error_info = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'timestamp': datetime.now().isoformat()
    }
    
    if context:
        error_info.update(context)
    
    if request:
        error_info.update({
            'path': request.path,
            'method': request.method,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        })
    
    logger.error(f"Error occurred: {error_info}")

def create_error_response(message: str, status_code: int = 500, **kwargs) -> tuple:
    """Create standardized error response"""
    response_data = {
        'status': 'error',
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    response_data.update(kwargs)
    
    return jsonify(response_data), status_code

def create_success_response(data: Any = None, message: str = "Success", **kwargs) -> Dict[str, Any]:
    """Create standardized success response"""
    response_data = {
        'status': 'success',
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    if data is not None:
        response_data['data'] = data
    
    response_data.update(kwargs)
    return response_data