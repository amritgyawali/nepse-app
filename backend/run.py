#!/usr/bin/env python

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def run_development_server():
    """Run the Flask development server"""
    from app import app
    
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    print(f"Starting Nepal Stock Market API on port {port}")
    print(f"Debug mode: {debug}")
    print("Press CTRL+C to stop the server")
    
    app.run(host='0.0.0.0', port=port, debug=debug)

def run_production_server():
    """Run the production server using Gunicorn"""
    port = int(os.getenv('PORT', 5000))
    workers = int(os.getenv('GUNICORN_WORKERS', 4))
    
    print(f"Starting Nepal Stock Market API with Gunicorn on port {port}")
    print(f"Workers: {workers}")
    
    os.system(f"gunicorn --bind 0.0.0.0:{port} --workers {workers} app:app")

if __name__ == '__main__':
    # Check if we should run in production mode
    if len(sys.argv) > 1 and sys.argv[1] == 'prod':
        run_production_server()
    else:
        run_development_server()