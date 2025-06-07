# Nepal Stock Market Backend API

This is a Python Flask backend service that provides real-time stock data from the Nepal Stock Exchange (NEPSE) by scraping data from official and unofficial sources.

## Features

- Real-time stock data from NEPSE
- Market indices information
- Top gainers and losers
- Sector-wise data
- Historical price data
- Market depth information
- Floorsheet data
- Market status (open/closed)
- Additional data from MeroLagani

## API Endpoints

### Health Check
- `GET /api/health` - Check if the API is running

### Stock Data
- `GET /api/stocks` - Get all stocks data
- `GET /api/stock/<symbol>` - Get specific stock data
- `GET /api/historical/<symbol>?days=30` - Get historical data for a stock
- `GET /api/market-depth/<symbol>` - Get market depth for a stock

### Market Data
- `GET /api/indices` - Get market indices
- `GET /api/top-gainers` - Get top gaining stocks
- `GET /api/top-losers` - Get top losing stocks
- `GET /api/sectors` - Get sector-wise data
- `GET /api/floorsheet` - Get floorsheet data
- `GET /api/market-status` - Check if market is open

### MeroLagani Data
- `GET /api/merolagani/latest` - Get latest market data from MeroLagani

### Admin
- `POST /api/update-cache` - Force update of the data cache

## Setup and Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Navigate to the backend directory:
   ```
   cd project/backend
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the Server

1. Start the Flask development server:
   ```
   python app.py
   ```

2. For production deployment, use Gunicorn:
   ```
   gunicorn app:app --bind 0.0.0.0:5000
   ```

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=5000
DEBUG=False
CACHE_TIMEOUT=300  # Cache timeout in seconds
```

## Integration with React Native App

To integrate this backend with the React Native app:

1. Update the `NEPSEDataService.ts` file in the React Native app to point to this backend API instead of directly calling the NEPSE API.

2. Example integration code:

```typescript
// In NEPSEDataService.ts
private apiURL = 'http://your-backend-url:5000/api';

public async getAllStocks(): Promise<NEPSEStock[]> {
  try {
    const response = await axios.get(`${this.apiURL}/stocks`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return this.getMockStockData();
  }
}
```

## Error Handling

The backend implements multiple fallback mechanisms:

1. First tries the unofficial API
2. Falls back to the official API if the unofficial one fails
3. As a last resort, scrapes data directly from websites
4. Returns mock data if all else fails

## Caching

The backend caches data for 5 minutes to reduce load on the NEPSE servers and improve performance. The cache is automatically updated in the background.

## License

This project is licensed under the MIT License.