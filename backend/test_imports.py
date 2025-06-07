#!/usr/bin/env python

"""
Test script to verify that all modules can be imported correctly.
This helps identify any import or dependency issues before running the full application.
"""

import sys
import os

print(f"Python version: {sys.version}")
print(f"Current directory: {os.getcwd()}")

try:
    print("\nTesting imports...")
    
    # Test standard library imports
    import json
    import datetime
    import time
    import logging
    print("✓ Standard library imports successful")
    
    # Test third-party imports (these would fail if dependencies aren't installed)
    import flask
    import flask_cors
    import requests
    import bs4
    import pandas
    import dotenv
    import apscheduler
    print("✓ Third-party library imports successful")
    
    # Test local module imports
    # These will fail if the file structure is incorrect
    try:
        from services.nepse_service import NepseService
        print("✓ NepseService import successful")
    except ImportError as e:
        print(f"✗ NepseService import failed: {e}")
    
    try:
        from services.merolagani_service import MerolaganiService
        print("✓ MerolaganiService import successful")
    except ImportError as e:
        print(f"✗ MerolaganiService import failed: {e}")
    
    try:
        from utils import get_nepal_time
        print("✓ utils import successful")
    except ImportError as e:
        print(f"✗ utils import failed: {e}")
    
    try:
        from health import health_bp
        print("✓ health_bp import successful")
    except ImportError as e:
        print(f"✗ health_bp import failed: {e}")
    
    print("\nImport tests completed")
    
except ImportError as e:
    print(f"\n✗ Import error: {e}")
    print("\nPlease install required dependencies with: pip install -r requirements.txt")
    sys.exit(1)