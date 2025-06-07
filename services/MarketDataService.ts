import NEPSEDataService from './NEPSEDataService';

import { NEPSEStock, NEPSEIndex } from './NEPSEDataService';

class MarketDataService {
  private static instance: MarketDataService;
  private updateInterval: NodeJS.Timeout | number | null = null;
  private nepseService: NEPSEDataService;

  private constructor() {
    // Private constructor for singleton pattern
    this.nepseService = NEPSEDataService.getInstance();
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  public startRealTimeUpdates(callback: (data: any) => void) {
    // Poll for updates every 30 seconds
    this.updateInterval = setInterval(async () => {
      try {
        // Get top stocks to update
        const topStocks = await this.nepseService.getAllStocks();
        if (topStocks && topStocks.length > 0) {
          // Send the first 5 stocks as updates
          topStocks.slice(0, 5).forEach(stock => {
            callback({
              type: 'PRICE_UPDATE',
              data: {
                symbol: stock.symbol,
                price: stock.ltp,
                change: stock.change,
                changePercent: stock.changePercent
              }
            });
          });
        }
      } catch (error) {
        console.error('Error fetching real-time updates:', error);
      }
    }, 30000); // 30 seconds
  }

  public stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public async getMarketStatus(): Promise<'open' | 'closed'> {
    try {
      const status = await this.nepseService.getMarketStatus();
      return status.isOpen ? 'open' : 'closed';
    } catch (error) {
      console.error('Error fetching market status:', error);
      // Fallback to time-based calculation
      const now = new Date();
      const nepaliTime = new Date(now.getTime() + (5.75 * 60 * 60 * 1000)); // UTC+5:45
      const hours = nepaliTime.getHours();
      return (hours >= 11 && hours < 15) ? 'open' : 'closed';
    }
  }

  public async getMarketDepth(symbol: string): Promise<any> {
    try {
      return await this.nepseService.getMarketDepth(symbol);
    } catch (error) {
      console.error(`Error fetching market depth for ${symbol}:`, error);
      // Return fallback data
      return {
        bids: [
          { price: 1425.00, quantity: 100 },
          { price: 1424.50, quantity: 200 },
          { price: 1424.00, quantity: 150 }
        ],
        asks: [
          { price: 1426.00, quantity: 120 },
          { price: 1426.50, quantity: 180 },
          { price: 1427.00, quantity: 90 }
        ]
      };
    }
  }

  public async getTradingVolume(symbol: string, timeframe: string): Promise<any> {
    try {
      // Get historical data and extract volume information
      const days = timeframe === 'day' ? 1 : 
                  timeframe === 'week' ? 7 : 
                  timeframe === 'month' ? 30 : 90;
      
      const historicalData = await this.nepseService.getHistoricalData(symbol, days);
      
      return historicalData.map((data: any) => ({
        timestamp: new Date(data.date),
        volume: data.volume
      }));
    } catch (error) {
      console.error(`Error fetching trading volume for ${symbol}:`, error);
      // Return fallback data
      return Array.from({length: 10}, (_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000),
        volume: Math.floor(Math.random() * 100000)
      }));
    }
  }
  
  // Additional methods to expose NEPSEDataService functionality
  
  public async getAllStocks(): Promise<NEPSEStock[]> {
    return this.nepseService.getAllStocks();
  }
  
  public async getIndices(): Promise<NEPSEIndex[]> {
    return this.nepseService.getIndices();
  }
  
  public async getTopGainers(): Promise<NEPSEStock[]> {
    return this.nepseService.getTopGainers();
  }
  
  public async getTopLosers(): Promise<NEPSEStock[]> {
    return this.nepseService.getTopLosers();
  }
  
  public async getCorporateDisclosures(): Promise<any[]> {
    return this.nepseService.getCorporateDisclosures();
  }
}

export default MarketDataService;