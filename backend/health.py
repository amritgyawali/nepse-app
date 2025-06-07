from flask import Blueprint, jsonify
import time
import platform
import psutil
import os
from datetime import datetime

from utils import get_nepal_time

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the API"""
    start_time = time.time()
    
    # Get system info
    system_info = {
        'os': platform.system(),
        'python_version': platform.python_version(),
        'cpu_usage': psutil.cpu_percent(),
        'memory_usage': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent,
    }
    
    # Get environment info
    env_info = {
        'debug': os.getenv('DEBUG', 'False'),
        'cache_timeout': os.getenv('CACHE_TIMEOUT', '300'),
        'port': os.getenv('PORT', '5000'),
    }
    
    # Get time info
    time_info = {
        'server_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'nepal_time': get_nepal_time().strftime('%Y-%m-%d %H:%M:%S'),
    }
    
    response_time = time.time() - start_time
    
    return jsonify({
        'status': 'ok',
        'message': 'Nepal Stock Market API is running',
        'response_time': f'{response_time:.4f}s',
        'system': system_info,
        'environment': env_info,
        'time': time_info,
    })

@health_bp.route('/ping', methods=['GET'])
def ping():
    """Simple ping endpoint for load balancers"""
    return jsonify({
        'status': 'ok',
        'message': 'pong',
        'time': get_nepal_time().strftime('%Y-%m-%d %H:%M:%S'),
    })