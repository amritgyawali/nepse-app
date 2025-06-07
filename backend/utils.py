import os
import json
from datetime import datetime, timedelta
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_nepal_time():
    """Get current time in Nepal timezone (UTC+5:45)"""
    utc_now = datetime.utcnow()
    nepal_offset = timedelta(hours=5, minutes=45)
    nepal_time = utc_now + nepal_offset
    return nepal_time

def format_nepal_time(format_str='%Y-%m-%d %H:%M:%S'):
    """Get formatted Nepal time string"""
    return get_nepal_time().strftime(format_str)

def get_browser_headers():
    """Get headers to mimic browser request"""
    return {
        'User-Agent': os.getenv('USER_AGENT', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'),
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://nepalstock.com',
        'Referer': 'https://nepalstock.com/'
    }

def is_market_open():
    """Check if Nepal Stock Exchange is currently open"""
    nepal_time = get_nepal_time()
    hours = nepal_time.hour
    minutes = nepal_time.minute
    current_time = hours * 60 + minutes
    
    # NEPSE trading hours: 11:00 AM to 3:00 PM (Sunday to Thursday)
    market_open = 11 * 60  # 11:00 AM
    market_close = 15 * 60  # 3:00 PM
    day_of_week = nepal_time.weekday()
    
    # In Nepal, Sunday is the first day of the week (0 = Sunday, 6 = Saturday)
    # Python's weekday() returns 0 for Monday, so we need to adjust
    nepal_day = (day_of_week + 1) % 7  # Convert to Nepal's week (0 = Sunday)
    
    is_weekday = nepal_day in [0, 1, 2, 3, 4]  # Sunday to Thursday
    is_during_trading_hours = current_time >= market_open and current_time < market_close
    
    return is_weekday and is_during_trading_hours

def parse_number(text):
    """Parse number from text, handling commas and other formatting"""
    try:
        if not text or text.strip() == '':
            return 0
            
        # Remove commas and other non-numeric characters except decimal point and minus sign
        clean_text = ''.join(c for c in text if c.isdigit() or c in ['.', '-'])
        
        # Convert to float or int
        if '.' in clean_text:
            return float(clean_text)
        elif clean_text:
            return int(clean_text)
        else:
            return 0
    except Exception:
        return 0

def safe_request(url, method='get', params=None, data=None, headers=None, timeout=10):
    """Make a safe HTTP request with error handling"""
    try:
        if not headers:
            headers = get_browser_headers()
            
        if method.lower() == 'get':
            response = requests.get(url, params=params, headers=headers, timeout=timeout)
        elif method.lower() == 'post':
            response = requests.post(url, params=params, json=data, headers=headers, timeout=timeout)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
            
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        # Try to parse as JSON
        try:
            return response.json()
        except ValueError:
            # Return text if not JSON
            return response.text
            
    except requests.exceptions.RequestException as e:
        print(f"Request error for {url}: {str(e)}")
        return None