from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler
import os
import logging
from datetime import datetime, timedelta
import time
from typing import Dict, Any, Optional, List
from functools import wraps
import traceback

# Import services
from services.nepse_service import NepseService
from services.merolagani_service import MerolaganiService

# Import health check blueprint
from health import health_bp

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(health_bp, url_prefix='/api')

# Initialize services
nepse_service = NepseService()
merolagani_service = MerolaganiService()

# Cache data
cache = {
    'stocks': {'data': None, 'last_updated': None},
    'indices': {'data': None, 'last_updated': None},
    'top_gainers': {'data': None, 'last_updated': None},
    'top_losers': {'data': None, 'last_updated': None},
    'sectors': {'data': None, 'last_updated': None},
    'merolagani_latest': {'data': None, 'last_updated': None},
}

# Cache timeout in seconds (default: 5 minutes)
CACHE_TIMEOUT = int(os.getenv('CACHE_TIMEOUT', 300))

def api_error_handler(f):
    """Decorator to handle API errors consistently"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            logger.error(f"API Error: {str(e)}\n{traceback.format_exc()}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500
    return decorated

def validate_params(*required_params):
    """Decorator to validate required request parameters"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if request.method == 'GET':
                params = request.args
            else:
                params = request.json if request.is_json else request.form
                
            missing_params = [param for param in required_params if param not in params]
            
            if missing_params:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required parameters: {", ".join(missing_params)}',
                    'timestamp': datetime.now().isoformat()
                }), 400
                
            return f(*args, **kwargs)
        return decorated
    return decorator

def is_cache_valid(cache_key: str) -> bool:
    """Check if cache is valid"""
    if cache_key not in cache or cache[cache_key]['data'] is None or cache[cache_key]['last_updated'] is None:
        return False
    
    elapsed = datetime.now() - cache[cache_key]['last_updated']
    return elapsed.total_seconds() < CACHE_TIMEOUT

def update_cache() -> None:
    """Update cache data in background with improved error handling"""
    logger.info("Starting cache update process...")
    
    cache_operations = [
        ('stocks', lambda: nepse_service.get_all_stocks()),
        ('indices', lambda: nepse_service.get_indices()),
        ('top_gainers', lambda: nepse_service.get_top_gainers()),
        ('top_losers', lambda: nepse_service.get_top_losers()),
        ('sectors', lambda: nepse_service.get_sector_data()),
        ('merolagani_latest', lambda: merolagani_service.get_latest_market_data()),
    ]
    
    for cache_key, fetch_function in cache_operations:
        try:
            data = fetch_function()
            if data:
                cache[cache_key]['data'] = data
                cache[cache_key]['last_updated'] = datetime.now()
                data_count = len(data) if isinstance(data, list) else 1
                logger.info(f"Updated {cache_key} cache with {data_count} items")
            else:
                logger.warning(f"No data received for {cache_key}")
        except Exception as e:
            logger.error(f"Failed to update {cache_key} cache: {str(e)}")
            # Don't break the entire cache update process for one failure
            continue
    
    logger.info("Cache update process completed")

# Initialize scheduler
scheduler = BackgroundScheduler()
scheduler.add_job(update_cache, 'interval', minutes=5)
scheduler.start()

# Update cache on startup
update_cache()

@app.route('/api/stocks', methods=['GET'])
@api_error_handler
def get_stocks():
    """Get all stocks data with improved caching and error handling"""
    if is_cache_valid('stocks'):
        return jsonify({
            'status': 'success',
            'data': cache['stocks']['data'],
            'cached': True,
            'last_updated': cache['stocks']['last_updated'].isoformat(),
            'count': len(cache['stocks']['data'])
        })
    
    # Fetch fresh data if cache is invalid
    stocks = nepse_service.get_all_stocks()
    if not stocks:
        return jsonify({
            'status': 'error',
            'message': 'No stocks data available',
            'timestamp': datetime.now().isoformat()
        }), 404
    
    cache['stocks']['data'] = stocks
    cache['stocks']['last_updated'] = datetime.now()
    
    return jsonify({
        'status': 'success',
        'data': stocks,
        'cached': False,
        'last_updated': cache['stocks']['last_updated'].isoformat(),
        'count': len(stocks)
    })

@app.route('/api/stock/<symbol>', methods=['GET'])
@api_error_handler
def get_stock(symbol: str):
    """Get specific stock data with validation"""
    if not symbol or len(symbol.strip()) == 0:
        return jsonify({
            'status': 'error',
            'message': 'Stock symbol is required',
            'timestamp': datetime.now().isoformat()
        }), 400
    
    symbol = symbol.upper().strip()
    stock = nepse_service.get_stock_by_symbol(symbol)
    
    if not stock:
        return jsonify({
            'status': 'error',
            'message': f'Stock {symbol} not found',
            'timestamp': datetime.now().isoformat()
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': stock,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/indices', methods=['GET'])
def get_indices():
    """Get market indices"""
    if is_cache_valid('indices'):
        return jsonify({
            'success': True,
            'data': cache['indices']['data'],
            'cached': True,
            'last_updated': cache['indices']['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    try:
        indices = nepse_service.get_indices()
        if indices:
            cache['indices']['data'] = indices
            cache['indices']['last_updated'] = datetime.now()
        
        return jsonify({
            'success': True,
            'data': indices,
            'cached': False,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"Error fetching indices: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/top-gainers', methods=['GET'])
def get_top_gainers():
    """Get top gainers"""
    limit = request.args.get('limit', default=10, type=int)
    
    if is_cache_valid('top_gainers'):
        return jsonify({
            'success': True,
            'data': cache['top_gainers']['data'][:limit],
            'cached': True,
            'last_updated': cache['top_gainers']['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    try:
        top_gainers = nepse_service.get_top_gainers(limit)
        if top_gainers:
            cache['top_gainers']['data'] = top_gainers
            cache['top_gainers']['last_updated'] = datetime.now()
        
        return jsonify({
            'success': True,
            'data': top_gainers[:limit],
            'cached': False,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"Error fetching top gainers: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/top-losers', methods=['GET'])
def get_top_losers():
    """Get top losers"""
    limit = request.args.get('limit', default=10, type=int)
    
    if is_cache_valid('top_losers'):
        return jsonify({
            'success': True,
            'data': cache['top_losers']['data'][:limit],
            'cached': True,
            'last_updated': cache['top_losers']['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    try:
        top_losers = nepse_service.get_top_losers(limit)
        if top_losers:
            cache['top_losers']['data'] = top_losers
            cache['top_losers']['last_updated'] = datetime.now()
        
        return jsonify({
            'success': True,
            'data': top_losers[:limit],
            'cached': False,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"Error fetching top losers: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    """Get sector data"""
    if is_cache_valid('sectors'):
        return jsonify({
            'success': True,
            'data': cache['sectors']['data'],
            'cached': True,
            'last_updated': cache['sectors']['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    try:
        sectors = nepse_service.get_sector_data()
        if sectors:
            cache['sectors']['data'] = sectors
            cache['sectors']['last_updated'] = datetime.now()
        
        return jsonify({
            'success': True,
            'data': sectors,
            'cached': False,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"Error fetching sectors: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/historical/<symbol>', methods=['GET'])
def get_historical(symbol):
    """Get historical data for a stock"""
    days = request.args.get('days', default=365, type=int)
    
    try:
        historical = nepse_service.get_historical_data(symbol, days)
        return jsonify({
            'success': True,
            'data': historical
        })
    except Exception as e:
        logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/market-depth/<symbol>', methods=['GET'])
def get_market_depth(symbol):
    """Get market depth for a stock"""
    try:
        market_depth = nepse_service.get_market_depth(symbol)
        return jsonify({
            'success': True,
            'data': market_depth
        })
    except Exception as e:
        logger.error(f"Error fetching market depth for {symbol}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/floorsheet', methods=['GET'])
def get_floorsheet():
    """Get floorsheet data"""
    symbol = request.args.get('symbol', default=None, type=str)
    limit = request.args.get('limit', default=20, type=int)
    
    try:
        floorsheet = nepse_service.get_floorsheet(symbol, limit)
        return jsonify({
            'success': True,
            'data': floorsheet
        })
    except Exception as e:
        logger.error(f"Error fetching floorsheet: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/market-status', methods=['GET'])
def get_market_status():
    """Get market status"""
    try:
        status = nepse_service.get_market_status()
        return jsonify({
            'success': True,
            'data': status
        })
    except Exception as e:
        logger.error(f"Error fetching market status: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/merolagani/latest', methods=['GET'])
def get_merolagani_latest():
    """Get latest market data from MeroLagani"""
    if is_cache_valid('merolagani_latest'):
        return jsonify({
            'success': True,
            'data': cache['merolagani_latest']['data'],
            'cached': True,
            'last_updated': cache['merolagani_latest']['last_updated'].strftime('%Y-%m-%d %H:%M:%S')
        })
    
    try:
        data = merolagani_service.get_latest_market_data()
        if data:
            cache['merolagani_latest']['data'] = data
            cache['merolagani_latest']['last_updated'] = datetime.now()
        
        return jsonify({
            'success': True,
            'data': data,
            'cached': False,
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        logger.error(f"Error fetching MeroLagani data: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/merolagani/company/<symbol>', methods=['GET'])
def get_merolagani_company(symbol):
    """Get company details from MeroLagani"""
    try:
        data = merolagani_service.get_company_details(symbol)
        return jsonify({
            'success': True,
            'data': data
        })
    except Exception as e:
        logger.error(f"Error fetching company details for {symbol}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/merolagani/news', methods=['GET'])
def get_merolagani_news():
    """Get latest news from MeroLagani"""
    limit = request.args.get('limit', default=10, type=int)
    
    try:
        news = merolagani_service.get_latest_news(limit)
        return jsonify({
            'success': True,
            'data': news
        })
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Shutdown hook to stop scheduler
@app.before_first_request
def init_app():
    """Initialize app"""
    logger.info("Nepal Stock Market API started")

@app.teardown_appcontext
def shutdown(exception=None):
    """Shutdown hook"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler shutdown")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() in ('true', '1', 't')
    
    app.run(host='0.0.0.0', port=port, debug=debug)