import requests
import json
from datetime import datetime
from bs4 import BeautifulSoup
import pandas as pd

class MerolaganiService:
    def __init__(self):
        self.base_url = 'https://merolagani.com'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    
    def get_current_time(self):
        """Get current time in Nepal timezone (UTC+5:45)"""
        utc_now = datetime.utcnow()
        nepal_offset = timedelta(hours=5, minutes=45)
        nepal_time = utc_now + nepal_offset
        return nepal_time.strftime('%Y-%m-%d %H:%M:%S')
    
    def get_latest_market_data(self):
        """Get latest market data from Merolagani"""
        try:
            # Fetch the latest market page
            response = requests.get(f"{self.base_url}/latestmarket.aspx", headers=self.headers)
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract data
            market_data = {
                'sector_summary': self._extract_sector_summary(soup),
                'top_gainers': self._extract_top_gainers(soup),
                'top_losers': self._extract_top_losers(soup),
                'top_turnover': self._extract_top_turnover(soup),
                'top_volume': self._extract_top_volume(soup),
                'market_summary': self._extract_market_summary(soup)
            }
            
            return market_data
        except Exception as e:
            print(f"Error fetching data from Merolagani: {str(e)}")
            return {}
    
    def get_company_details(self, symbol):
        """Get detailed company information"""
        try:
            # Fetch the company page
            response = requests.get(f"{self.base_url}/company/{symbol}", headers=self.headers)
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract company details
            company_data = self._extract_company_details(soup, symbol)
            
            return company_data
        except Exception as e:
            print(f"Error fetching company details for {symbol}: {str(e)}")
            return {}
    
    def get_market_news(self, limit=10):
        """Get latest market news"""
        try:
            # Fetch the news page
            response = requests.get(f"{self.base_url}/news", headers=self.headers)
            soup = BeautifulSoup(response.text, 'lxml')
            
            # Extract news
            news_items = self._extract_news(soup, limit)
            
            return news_items
        except Exception as e:
            print(f"Error fetching market news: {str(e)}")
            return []
    
    def _extract_sector_summary(self, soup):
        """Extract sector summary data"""
        try:
            sector_data = []
            sector_table = soup.find('table', {'id': 'sector-turnover'})
            
            if not sector_table:
                # Try alternative method
                sector_div = soup.find('div', class_='sector-turnover')
                if sector_div:
                    sector_text = sector_div.get_text()
                    # Parse the text to extract sector data
                    lines = sector_text.strip().split('\n')
                    for i in range(0, len(lines), 3):
                        if i+2 < len(lines):
                            sector = {
                                'name': lines[i].strip(),
                                'turnover': self._parse_number(lines[i+1].strip()),
                                'volume': self._parse_number(lines[i+2].strip())
                            }
                            sector_data.append(sector)
                return sector_data
            
            # Parse table if found
            rows = sector_table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 3:
                    sector = {
                        'name': cols[0].text.strip(),
                        'turnover': self._parse_number(cols[1].text.strip()),
                        'volume': self._parse_number(cols[2].text.strip())
                    }
                    sector_data.append(sector)
            
            return sector_data
        except Exception as e:
            print(f"Error extracting sector summary: {str(e)}")
            return []
    
    def _extract_top_gainers(self, soup):
        """Extract top gainers data"""
        try:
            gainers = []
            gainers_table = soup.find('table', {'id': 'top-gainers'})
            
            if not gainers_table:
                # Try alternative method
                gainers_div = soup.find('div', class_='top-gainers')
                if gainers_div:
                    # Parse the div content
                    items = gainers_div.find_all('div', class_='item')
                    for item in items:
                        symbol = item.find('div', class_='symbol').text.strip()
                        ltp = self._parse_number(item.find('div', class_='ltp').text.strip())
                        change = self._parse_number(item.find('div', class_='change').text.strip())
                        gainers.append({
                            'symbol': symbol,
                            'ltp': ltp,
                            'change': change,
                            'changePercent': (change / (ltp - change)) * 100 if ltp - change > 0 else 0
                        })
                return gainers
            
            # Parse table if found
            rows = gainers_table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 4:
                    gainer = {
                        'symbol': cols[0].text.strip(),
                        'ltp': self._parse_number(cols[1].text.strip()),
                        'change': self._parse_number(cols[2].text.strip()),
                        'changePercent': self._parse_number(cols[3].text.strip().replace('%', ''))
                    }
                    gainers.append(gainer)
            
            return gainers
        except Exception as e:
            print(f"Error extracting top gainers: {str(e)}")
            return []
    
    def _extract_top_losers(self, soup):
        """Extract top losers data"""
        try:
            losers = []
            losers_table = soup.find('table', {'id': 'top-losers'})
            
            if not losers_table:
                # Try alternative method
                losers_div = soup.find('div', class_='top-losers')
                if losers_div:
                    # Parse the div content
                    items = losers_div.find_all('div', class_='item')
                    for item in items:
                        symbol = item.find('div', class_='symbol').text.strip()
                        ltp = self._parse_number(item.find('div', class_='ltp').text.strip())
                        change = self._parse_number(item.find('div', class_='change').text.strip())
                        losers.append({
                            'symbol': symbol,
                            'ltp': ltp,
                            'change': change,
                            'changePercent': (change / (ltp - change)) * 100 if ltp - change > 0 else 0
                        })
                return losers
            
            # Parse table if found
            rows = losers_table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 4:
                    loser = {
                        'symbol': cols[0].text.strip(),
                        'ltp': self._parse_number(cols[1].text.strip()),
                        'change': self._parse_number(cols[2].text.strip()),
                        'changePercent': self._parse_number(cols[3].text.strip().replace('%', ''))
                    }
                    losers.append(loser)
            
            return losers
        except Exception as e:
            print(f"Error extracting top losers: {str(e)}")
            return []
    
    def _extract_top_turnover(self, soup):
        """Extract top turnover data"""
        try:
            turnover_stocks = []
            turnover_table = soup.find('table', {'id': 'top-turnover'})
            
            if not turnover_table:
                # Try alternative method
                turnover_div = soup.find('div', class_='top-turnover')
                if turnover_div:
                    # Parse the div content
                    items = turnover_div.find_all('div', class_='item')
                    for item in items:
                        symbol = item.find('div', class_='symbol').text.strip()
                        turnover = self._parse_number(item.find('div', class_='turnover').text.strip())
                        turnover_stocks.append({
                            'symbol': symbol,
                            'turnover': turnover
                        })
                return turnover_stocks
            
            # Parse table if found
            rows = turnover_table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    stock = {
                        'symbol': cols[0].text.strip(),
                        'turnover': self._parse_number(cols[1].text.strip())
                    }
                    turnover_stocks.append(stock)
            
            return turnover_stocks
        except Exception as e:
            print(f"Error extracting top turnover: {str(e)}")
            return []
    
    def _extract_top_volume(self, soup):
        """Extract top volume data"""
        try:
            volume_stocks = []
            volume_table = soup.find('table', {'id': 'top-volume'})
            
            if not volume_table:
                # Try alternative method
                volume_div = soup.find('div', class_='top-volume')
                if volume_div:
                    # Parse the div content
                    items = volume_div.find_all('div', class_='item')
                    for item in items:
                        symbol = item.find('div', class_='symbol').text.strip()
                        volume = self._parse_number(item.find('div', class_='volume').text.strip())
                        volume_stocks.append({
                            'symbol': symbol,
                            'volume': volume
                        })
                return volume_stocks
            
            # Parse table if found
            rows = volume_table.find_all('tr')[1:]  # Skip header
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:
                    stock = {
                        'symbol': cols[0].text.strip(),
                        'volume': self._parse_number(cols[1].text.strip())
                    }
                    volume_stocks.append(stock)
            
            return volume_stocks
        except Exception as e:
            print(f"Error extracting top volume: {str(e)}")
            return []
    
    def _extract_market_summary(self, soup):
        """Extract market summary data"""
        try:
            summary = {}
            summary_div = soup.find('div', class_='market-summary')
            
            if not summary_div:
                # Try alternative method
                nepse_div = soup.find('div', class_='nepse-index')
                if nepse_div:
                    summary['nepse'] = self._parse_number(nepse_div.find('div', class_='value').text.strip())
                    summary['nepse_change'] = self._parse_number(nepse_div.find('div', class_='change').text.strip())
                    
                    # Try to find other indices
                    indices_div = soup.find('div', class_='indices')
                    if indices_div:
                        items = indices_div.find_all('div', class_='index-item')
                        for item in items:
                            name = item.find('div', class_='name').text.strip().lower().replace(' ', '_')
                            value = self._parse_number(item.find('div', class_='value').text.strip())
                            summary[name] = value
                
                # Try to find market stats
                stats_div = soup.find('div', class_='market-stats')
                if stats_div:
                    items = stats_div.find_all('div', class_='stat-item')
                    for item in items:
                        name = item.find('div', class_='name').text.strip().lower().replace(' ', '_')
                        value = self._parse_number(item.find('div', class_='value').text.strip())
                        summary[name] = value
                
                return summary
            
            # Parse div if found
            items = summary_div.find_all('div', class_='summary-item')
            for item in items:
                name = item.find('div', class_='name').text.strip().lower().replace(' ', '_')
                value_div = item.find('div', class_='value')
                if value_div:
                    value = self._parse_number(value_div.text.strip())
                    summary[name] = value
            
            return summary
        except Exception as e:
            print(f"Error extracting market summary: {str(e)}")
            return {}
    
    def _extract_company_details(self, soup, symbol):
        """Extract company details"""
        try:
            company = {
                'symbol': symbol,
                'name': '',
                'sector': '',
                'listed_shares': 0,
                'market_cap': 0,
                'pe_ratio': 0,
                'book_value': 0,
                'eps': 0,
                'dividend': 0,
                'dividend_yield': 0,
                'roe': 0,
                'last_traded_price': 0,
                'high_low_52w': {'high': 0, 'low': 0}
            }
            
            # Extract company name and sector
            company_header = soup.find('div', class_='company-header')
            if company_header:
                name_div = company_header.find('h1')
                if name_div:
                    company['name'] = name_div.text.strip()
                
                sector_div = company_header.find('div', class_='sector')
                if sector_div:
                    company['sector'] = sector_div.text.strip()
            
            # Extract financial details
            details_table = soup.find('table', class_='company-details')
            if details_table:
                rows = details_table.find_all('tr')
                for row in rows:
                    cols = row.find_all('td')
                    if len(cols) >= 2:
                        key = cols[0].text.strip().lower().replace(' ', '_')
                        value = cols[1].text.strip()
                        
                        if key == 'listed_shares':
                            company['listed_shares'] = self._parse_number(value)
                        elif key == 'market_capitalization':
                            company['market_cap'] = self._parse_number(value)
                        elif key == 'pe_ratio':
                            company['pe_ratio'] = self._parse_number(value)
                        elif key == 'book_value':
                            company['book_value'] = self._parse_number(value)
                        elif key == 'eps':
                            company['eps'] = self._parse_number(value)
                        elif key == 'dividend':
                            company['dividend'] = self._parse_number(value)
                        elif key == 'dividend_yield':
                            company['dividend_yield'] = self._parse_number(value.replace('%', ''))
                        elif key == 'roe':
                            company['roe'] = self._parse_number(value.replace('%', ''))
            
            # Extract price information
            price_div = soup.find('div', class_='current-price')
            if price_div:
                company['last_traded_price'] = self._parse_number(price_div.text.strip())
            
            # Extract 52-week high/low
            high_low_div = soup.find('div', class_='high-low')
            if high_low_div:
                high_div = high_low_div.find('div', class_='high')
                low_div = high_low_div.find('div', class_='low')
                
                if high_div:
                    company['high_low_52w']['high'] = self._parse_number(high_div.text.strip())
                if low_div:
                    company['high_low_52w']['low'] = self._parse_number(low_div.text.strip())
            
            return company
        except Exception as e:
            print(f"Error extracting company details: {str(e)}")
            return {'symbol': symbol}
    
    def _extract_news(self, soup, limit):
        """Extract news items"""
        try:
            news_items = []
            news_list = soup.find('div', class_='news-list')
            
            if not news_list:
                return []
            
            news_divs = news_list.find_all('div', class_='news-item', limit=limit)
            
            for news_div in news_divs:
                news = {
                    'title': '',
                    'date': '',
                    'summary': '',
                    'url': ''
                }
                
                title_div = news_div.find('div', class_='title')
                if title_div:
                    a_tag = title_div.find('a')
                    if a_tag:
                        news['title'] = a_tag.text.strip()
                        news['url'] = f"{self.base_url}{a_tag.get('href', '')}" if a_tag.get('href', '').startswith('/') else a_tag.get('href', '')
                
                date_div = news_div.find('div', class_='date')
                if date_div:
                    news['date'] = date_div.text.strip()
                
                summary_div = news_div.find('div', class_='summary')
                if summary_div:
                    news['summary'] = summary_div.text.strip()
                
                news_items.append(news)
            
            return news_items
        except Exception as e:
            print(f"Error extracting news: {str(e)}")
            return []
    
    def _parse_number(self, text):
        """Parse number from text, handling commas and other formatting"""
        try:
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

# Add missing import
from datetime import timedelta