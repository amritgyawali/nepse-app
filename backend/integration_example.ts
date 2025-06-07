// Example integration with React Native app
// This shows how to update the NEPSEDataService.ts file to use the Python backend

import axios from 'axios';

interface NEPSEStock {
  symbol: string;
  name: string;
  ltp: number; // Last Traded Price
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  turnover: number;
  totalTrades: number;
  sector: string;
}

interface NEPSEIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  turnover: number;
}

interface MarketDepth {
  bids: Array<{ price: number; quantity: number; orders: number }>;
  asks: Array<{ price: number; quantity: number; orders: number }>;
}

class NEPSEDataService {
  private static instance: NEPSEDataService;
  
  // Update this to point to your Python backend
  private baseURL = 'http://localhost:5000';
  private apiURL = 'http://localhost:5000/api';
  
  private updateInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();

  private constructor() {}

  public static getInstance(): NEPSEDataService {
    if (!NEPSEDataService.instance) {
      NEPSEDataService.instance = new NEPSEDataService();
    }
    return NEPSEDataService.instance;
  }

  // Fetch all stocks data from backend
  public async getAllStocks(): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/stocks`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // Return mock data as fallback
      return this.getMockStockData();
    }
  }

  // Fetch specific stock data from backend
  public async getStock(symbol: string): Promise<NEPSEStock | null> {
    try {
      const response = await axios.get(`${this.apiURL}/stock/${symbol}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      return null;
    }
  }

  // Fetch market indices from backend
  public async getIndices(): Promise<NEPSEIndex[]> {
    try {
      const response = await axios.get(`${this.apiURL}/indices`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching indices:', error);
      return this.getMockIndexData();
    }
  }

  // Fetch market depth for a specific stock from backend
  public async getMarketDepth(symbol: string): Promise<MarketDepth> {
    try {
      const response = await axios.get(`${this.apiURL}/market-depth/${symbol}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching market depth for ${symbol}:`, error);
      return this.getMockMarketDepth();
    }
  }

  // Fetch historical data for a stock from backend
  public async getHistoricalData(symbol: string, days: number = 365): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiURL}/historical/${symbol}`, {
        params: { days }
      });
      
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getMockHistoricalData(symbol, days);
    }
  }

  // Check if market is open from backend
  public async getMarketStatus(): Promise<{ isOpen: boolean; message?: string }> {
    try {
      const response = await axios.get(`${this.apiURL}/market-status`);
      return response.data.data;
    } catch (error) {
      // Fallback to time-based calculation
      const now = new Date();
      const nepaliTime = new Date(now.getTime() + (5.75 * 60 * 60 * 1000)); // UTC+5:45
      const hours = nepaliTime.getHours();
      const minutes = nepaliTime.getMinutes();
      const currentTime = hours * 60 + minutes;
      
      // NEPSE trading hours: 11:00 AM to 3:00 PM (Sunday to Thursday)
      const marketOpen = 11 * 60; // 11:00 AM
      const marketClose = 15 * 60; // 3:00 PM
      const dayOfWeek = nepaliTime.getDay();
      
      const isWeekday = dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday to Thursday
      const isDuringTradingHours = currentTime >= marketOpen && currentTime < marketClose;
      
      return {
        isOpen: isWeekday && isDuringTradingHours,
        message: isWeekday && isDuringTradingHours ? 'Market is open' : 'Market is closed'
      };
    }
  }

  // Fetch top gainers from backend
  public async getTopGainers(limit: number = 10): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/top-gainers`);
      return response.data.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      return [];
    }
  }

  // Fetch top losers from backend
  public async getTopLosers(limit: number = 10): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/top-losers`);
      return response.data.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching top losers:', error);
      return [];
    }
  }

  // Fetch sector data from backend
  public async getSectorData(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiURL}/sectors`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching sector data:', error);
      return [];
    }
  }

  // Fetch latest market data from MeroLagani
  public async getMeroLaganiData(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiURL}/merolagani/latest`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching MeroLagani data:', error);
      return {};
    }
  }

  // Fallback methods for mock data (keep these from the original service)
  private getMockStockData(): NEPSEStock[] {
    // Implementation from original service
    return [];
  }

  private getMockIndexData(): NEPSEIndex[] {
    // Implementation from original service
    return [];
  }

  private getMockMarketDepth(): MarketDepth {
    // Implementation from original service
    return { bids: [], asks: [] };
  }

  private getMockHistoricalData(symbol: string, days: number): any[] {
    // Implementation from original service
    return [];
  }
}

export default NEPSEDataService;