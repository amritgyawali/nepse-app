import requests
import json
from datetime import datetime, timedelta
import pandas as pd
from bs4 import BeautifulSoup

class NepseService:
    def __init__(self):
        # Official NEPSE API (may not be reliable)
        self.nepse_base_url = 'https://nepalstock.com/api'
        
        # Unofficial API that provides more reliable data
        self.unofficial_api_url = 'https://nepalstock.onrender.com'
        
        # Headers to mimic browser request
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://nepalstock.com',
            'Referer': 'https://nepalstock.com/'
        }
    
    def get_current_time(self):
        """Get current time in Nepal timezone (UTC+5:45)"""
        utc_now = datetime.utcnow()
        nepal_offset = timedelta(hours=5, minutes=45)
        nepal_time = utc_now + nepal_offset
        return nepal_time.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_all_stocks(self):
        """Get all stocks data from unofficial API"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/nepse-data/today-price")
            if response.status_code == 200:
                data = response.json()
                return self._parse_stock_data(data)
        except Exception as e:
            print(f"Error fetching from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/securityDailyTradeStat/58", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return self._parse_stock_data(data)
        except Exception as e:
            print(f"Error fetching from official API: {str(e)}")
            
        # If both APIs fail, scrape from website
        try:
            return self._scrape_stock_data_from_website()
        except Exception as e:
            print(f"Error scraping website: {str(e)}")
            return []
    
    def get_indices(self):
        """Get market indices data"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/index")
            if response.status_code == 200:
                data = response.json()
                return self._parse_index_data(data)
        except Exception as e:
            print(f"Error fetching indices from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/index", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return self._parse_index_data(data)
        except Exception as e:
            print(f"Error fetching indices from official API: {str(e)}")
            return []
    
    def get_top_gainers(self, limit=10):
        """Get top gaining stocks"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/top-ten/top-gainer?all=true")
            if response.status_code == 200:
                data = response.json()
                return data[:limit] if isinstance(data, list) else []
        except Exception as e:
            print(f"Error fetching top gainers from unofficial API: {str(e)}")
        
        # If unofficial API fails, calculate from all stocks
        try:
            all_stocks = self.get_all_stocks()
            sorted_stocks = sorted(all_stocks, key=lambda x: x.get('changePercent', 0), reverse=True)
            return sorted_stocks[:limit]
        except Exception as e:
            print(f"Error calculating top gainers: {str(e)}")
            return []
    
    def get_top_losers(self, limit=10):
        """Get top losing stocks"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/top-ten/top-loser?all=true")
            if response.status_code == 200:
                data = response.json()
                return data[:limit] if isinstance(data, list) else []
        except Exception as e:
            print(f"Error fetching top losers from unofficial API: {str(e)}")
        
        # If unofficial API fails, calculate from all stocks
        try:
            all_stocks = self.get_all_stocks()
            sorted_stocks = sorted(all_stocks, key=lambda x: x.get('changePercent', 0))
            return sorted_stocks[:limit]
        except Exception as e:
            print(f"Error calculating top losers: {str(e)}")
            return []
    
    def get_sector_data(self):
        """Get sector-wise data"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/sectorwise")
            if response.status_code == 200:
                data = response.json()
                return data
        except Exception as e:
            print(f"Error fetching sector data from unofficial API: {str(e)}")
        
        # If unofficial API fails, calculate from all stocks
        try:
            all_stocks = self.get_all_stocks()
            sectors = {}
            
            for stock in all_stocks:
                sector = stock.get('sector', 'Unknown')
                if sector not in sectors:
                    sectors[sector] = {
                        'name': sector,
                        'turnover': 0,
                        'volume': 0,
                        'count': 0
                    }
                
                sectors[sector]['turnover'] += stock.get('turnover', 0)
                sectors[sector]['volume'] += stock.get('volume', 0)
                sectors[sector]['count'] += 1
            
            return list(sectors.values())
        except Exception as e:
            print(f"Error calculating sector data: {str(e)}")
            return []
    
    def get_stock(self, symbol):
        """Get specific stock data"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/security/{symbol}")
            if response.status_code == 200:
                data = response.json()
                return data
        except Exception as e:
            print(f"Error fetching stock {symbol} from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/security/{symbol}", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return self._parse_stock_data([data])[0] if data else None
        except Exception as e:
            print(f"Error fetching stock {symbol} from official API: {str(e)}")
            
            # Try to find in all stocks
            all_stocks = self.get_all_stocks()
            for stock in all_stocks:
                if stock.get('symbol') == symbol:
                    return stock
            
            return None
    
    def get_historical_data(self, symbol, days=30):
        """Get historical data for a stock"""
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Format dates for API
            start_date_str = start_date.strftime('%Y-%m-%d')
            end_date_str = end_date.strftime('%Y-%m-%d')
            
            # Try unofficial API first
            response = requests.get(
                f"{self.unofficial_api_url}/market/history/security/{symbol}",
                params={
                    'startDate': start_date_str,
                    'endDate': end_date_str,
                    'size': days
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._format_historical_data(data)
        except Exception as e:
            print(f"Error fetching historical data for {symbol} from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(
                f"{self.nepse_base_url}/nots/historical/{symbol}",
                params={
                    'startDate': start_date_str,
                    'endDate': end_date_str
                },
                headers=self.headers
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._format_historical_data(data)
        except Exception as e:
            print(f"Error fetching historical data for {symbol} from official API: {str(e)}")
            return []
    
    def get_market_depth(self, symbol):
        """Get market depth (order book) for a stock"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/market-depth/{symbol}")
            if response.status_code == 200:
                data = response.json()
                return data
        except Exception as e:
            print(f"Error fetching market depth for {symbol} from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/market-depth/{symbol}", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return self._parse_market_depth(data)
        except Exception as e:
            print(f"Error fetching market depth for {symbol} from official API: {str(e)}")
            return {'bids': [], 'asks': []}
    
    def get_floorsheet(self, date=None):
        """Get floorsheet data"""
        try:
            # Format date if provided
            date_str = date if date else datetime.now().strftime('%Y-%m-%d')
            
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/nepse-data/floorsheet", params={'page': 0, 'size': 500})
            if response.status_code == 200:
                data = response.json()
                return data.get('content', [])
        except Exception as e:
            print(f"Error fetching floorsheet from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/floorsheet/{date_str}", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return self._parse_floorsheet(data)
        except Exception as e:
            print(f"Error fetching floorsheet from official API: {str(e)}")
            return []
    
    def get_market_status(self):
        """Check if market is open"""
        try:
            # Try unofficial API first
            response = requests.get(f"{self.unofficial_api_url}/nepse-data/market-open")
            if response.status_code == 200:
                data = response.json()
                return {
                    'isOpen': data.get('isOpen', False),
                    'message': data.get('message', '')
                }
        except Exception as e:
            print(f"Error fetching market status from unofficial API: {str(e)}")
        
        # Fallback to official API
        try:
            response = requests.get(f"{self.nepse_base_url}/nots/market-status", headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                return data
        except Exception as e:
            print(f"Error fetching market status from official API: {str(e)}")
        
        # Fallback to time-based calculation
        now = datetime.now()
        nepal_offset = timedelta(hours=5, minutes=45)
        nepal_time = datetime.utcnow() + nepal_offset
        hours = nepal_time.hour
        minutes = nepal_time.minute
        current_time = hours * 60 + minutes
        
        # NEPSE trading hours: 11:00 AM to 3:00 PM (Sunday to Thursday)
        market_open = 11 * 60  # 11:00 AM
        market_close = 15 * 60  # 3:00 PM
        day_of_week = nepal_time.weekday()
        
        # In Nepal, Sunday is the first day of the week (0 = Sunday, 6 = Saturday)
        is_weekday = day_of_week in [0, 1, 2, 3, 4]  # Sunday to Thursday
        is_during_trading_hours = current_time >= market_open and current_time < market_close
        
        return {
            'isOpen': is_weekday and is_during_trading_hours,
            'message': 'Market is open' if (is_weekday and is_during_trading_hours) else 'Market is closed'
        }
    
    def _parse_stock_data(self, data):
        """Parse stock data from API response"""
        stocks = []
        
        for item in data:
            stock = {
                'symbol': item.get('symbol', '') or item.get('securityName', ''),
                'name': item.get('securityName', '') or item.get('companyName', ''),
                'ltp': float(item.get('lastTradedPrice', 0) or item.get('ltp', 0) or 0),
                'change': float(item.get('change', 0) or 0),
                'changePercent': float(item.get('percentageChange', 0) or 0),
                'volume': int(item.get('totalTradeQuantity', 0) or item.get('volume', 0) or 0),
                'high': float(item.get('highPrice', 0) or item.get('high', 0) or 0),
                'low': float(item.get('lowPrice', 0) or item.get('low', 0) or 0),
                'open': float(item.get('openPrice', 0) or item.get('open', 0) or 0),
                'previousClose': float(item.get('previousClose', 0) or 0),
                'turnover': float(item.get('turnover', 0) or 0),
                'totalTrades': int(item.get('totalTrades', 0) or 0),
                'sector': item.get('sector', 'Unknown')
            }
            
            # Calculate market cap if available
            if 'listedShares' in item and item.get('listedShares'):
                stock['marketCap'] = stock['ltp'] * float(item.get('listedShares', 0))
            
            stocks.append(stock)
        
        return stocks
    
    def _parse_index_data(self, data):
        """Parse index data from API response"""
        indices = []
        
        for item in data:
            index = {
                'name': item.get('indexName', '') or item.get('name', ''),
                'value': float(item.get('indexValue', 0) or item.get('value', 0) or 0),
                'change': float(item.get('change', 0) or 0),
                'changePercent': float(item.get('percentageChange', 0) or 0),
                'high': float(item.get('high', 0) or 0),
                'low': float(item.get('low', 0) or 0),
                'turnover': float(item.get('turnover', 0) or 0)
            }
            
            indices.append(index)
        
        return indices
    
    def _parse_market_depth(self, data):
        """Parse market depth data from API response"""
        market_depth = {
            'bids': [],
            'asks': []
        }
        
        if 'buyOrders' in data:
            for item in data['buyOrders']:
                market_depth['bids'].append({
                    'price': float(item.get('price', 0) or 0),
                    'quantity': int(item.get('quantity', 0) or 0),
                    'orders': int(item.get('orders', 0) or 1)
                })
        
        if 'sellOrders' in data:
            for item in data['sellOrders']:
                market_depth['asks'].append({
                    'price': float(item.get('price', 0) or 0),
                    'quantity': int(item.get('quantity', 0) or 0),
                    'orders': int(item.get('orders', 0) or 1)
                })
        
        return market_depth
    
    def _parse_floorsheet(self, data):
        """Parse floorsheet data from API response"""
        floorsheet = []
        
        for item in data:
            floorsheet.append({
                'contractNo': item.get('contractNo', '') or item.get('contractId', ''),
                'symbol': item.get('symbol', '') or item.get('stockSymbol', ''),
                'buyerMemberId': item.get('buyerMemberId', '') or item.get('buyerBroker', ''),
                'sellerMemberId': item.get('sellerMemberId', '') or item.get('sellerBroker', ''),
                'quantity': int(item.get('quantity', 0) or 0),
                'rate': float(item.get('rate', 0) or 0),
                'amount': float(item.get('amount', 0) or 0),
                'time': item.get('tradeTime', '') or item.get('time', '')
            })
        
        return floorsheet
    
    def _format_historical_data(self, data):
        """Format historical data for charting"""
        historical = []
        
        for item in data:
            historical.append({
                'date': item.get('businessDate', '') or item.get('date', ''),
                'open': float(item.get('openPrice', 0) or item.get('open', 0) or 0),
                'high': float(item.get('highPrice', 0) or item.get('high', 0) or 0),
                'low': float(item.get('lowPrice', 0) or item.get('low', 0) or 0),
                'close': float(item.get('lastTradedPrice', 0) or item.get('close', 0) or 0),
                'volume': int(item.get('totalTradeQuantity', 0) or item.get('volume', 0) or 0),
                'turnover': float(item.get('turnover', 0) or 0)
            })
        
        # Sort by date (newest first)
        historical.sort(key=lambda x: x['date'], reverse=True)
        
        return historical
    
    def _scrape_stock_data_from_website(self):
        """Scrape stock data directly from NEPSE website as last resort"""
        try:
            # Fetch the today's price page
            response = requests.get('https://nepalstock.com/today-price', headers=self.headers)
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Find the table with stock data
            table = soup.find('table', class_='table-bordered')
            if not table:
                return []
            
            # Parse table data
            stocks = []
            rows = table.find_all('tr')[1:]  # Skip header row
            
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 10:
                    stock = {
                        'symbol': cols[1].text.strip(),
                        'name': cols[2].text.strip(),
                        'ltp': float(cols[6].text.strip().replace(',', '') or 0),
                        'change': float(cols[7].text.strip().replace(',', '') or 0),
                        'changePercent': float(cols[8].text.strip().replace(',', '').replace('%', '') or 0),
                        'volume': int(cols[9].text.strip().replace(',', '') or 0),
                        'high': float(cols[3].text.strip().replace(',', '') or 0),
                        'low': float(cols[4].text.strip().replace(',', '') or 0),
                        'open': float(cols[5].text.strip().replace(',', '') or 0),
                        'previousClose': float(cols[6].text.strip().replace(',', '') or 0) - float(cols[7].text.strip().replace(',', '') or 0),
                        'turnover': float(cols[10].text.strip().replace(',', '') or 0),
                        'totalTrades': int(cols[11].text.strip().replace(',', '') or 0),
                        'sector': 'Unknown'
                    }
                    stocks.append(stock)
            
            return stocks
        except Exception as e:
            print(f"Error scraping website: {str(e)}")
            return []