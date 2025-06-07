import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { 
  NEPSEStock, 
  NEPSEIndex, 
  MarketDepth, 
  FloorSheet, 
  HistoricalData,
  CacheItem,
  Subscriber,
  ApiResponse
} from '@/types';

export interface NEPSEStock {
  [x: string]: number | string;
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
  marketCap: number;
  turnover: number;
  totalTrades: number;
  sector: string;
}

export interface NEPSEIndex {
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

interface FloorSheet {
  contractNo: string;
  symbol: string;
  buyerMemberId: string;
  sellerMemberId: string;
  quantity: number;
  rate: number;
  amount: number;
  time: string;
}

// Cache configuration
interface CacheConfig {
  [key: string]: {
    ttl: number; // Time to live in milliseconds
    lastFetched?: number;
  };
}

class NEPSEDataService {
  private static instance: NEPSEDataService;
  private baseURL = 'https://nepalstock.onrender.com';
  private apiURL = 'https://nepalstock.onrender.com';
  private cache: { [key: string]: CacheItem<unknown> } = {};
  
  // Cache configuration with TTL (time to live) in milliseconds
  private cacheConfig: CacheConfig = {
    'allStocks': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'indices': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'topGainers': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'topLosers': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'marketStatus': { ttl: 1 * 60 * 1000 }, // 1 minute
    'corporateDisclosures': { ttl: 30 * 60 * 1000 }, // 30 minutes
    'marketSummary': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'todayPrice': { ttl: 5 * 60 * 1000 }, // 5 minutes
    'brokerList': { ttl: 24 * 60 * 60 * 1000 }, // 24 hours
  };
  private wsURL = 'wss://nepalstock.onrender.com/ws'; // Note: WebSocket might not be available
  private updateInterval: NodeJS.Timeout | number | null = null;
  private websocket: WebSocket | null = null;
  private subscribers: Map<string, Subscriber<unknown>['callback']> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
    this.loadCacheFromStorage();
  }
  
  // Cache management methods
  private async loadCacheFromStorage() {
    try {
      const cachedData = await AsyncStorage.getItem('nepseDataCache');
      if (cachedData) {
        this.cache = JSON.parse(cachedData);
        console.log('Cache loaded from storage');
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error);
    }
  }
  
  private async saveCacheToStorage() {
    try {
      await AsyncStorage.setItem('nepseDataCache', JSON.stringify(this.cache));
    } catch (error) {
      console.error('Error saving cache to storage:', error);
    }
  }
  
  private isCacheValid(key: string): boolean {
    if (!this.cache[key] || !this.cacheConfig[key]) return false;
    
    const lastFetched = this.cacheConfig[key].lastFetched;
    const ttl = this.cacheConfig[key].ttl;
    
    if (!lastFetched) return false;
    
    return Date.now() - lastFetched < ttl;
  }
  
  private setCache(key: string, data: unknown) {
    this.cache[key] = data;
    if (this.cacheConfig[key]) {
      this.cacheConfig[key].lastFetched = Date.now();
    }
    this.saveCacheToStorage();
  }
  
  private getCache(key: string): unknown {
    return this.cache[key];
  }
  
  // Method to clear cache
  public clearCache(key?: string) {
    if (key) {
      delete this.cache[key];
      if (this.cacheConfig[key]) {
        delete this.cacheConfig[key].lastFetched;
      }
    } else {
      this.cache = {};
      Object.keys(this.cacheConfig).forEach(configKey => {
        delete this.cacheConfig[configKey].lastFetched;
      });
    }
    this.saveCacheToStorage();
  }

  public static getInstance(): NEPSEDataService {
    if (!NEPSEDataService.instance) {
      NEPSEDataService.instance = new NEPSEDataService();
    }
    return NEPSEDataService.instance;
  }

  // Initialize WebSocket connection for real-time data
  public initializeWebSocket(): void {
    try {
      this.websocket = new WebSocket(this.wsURL);
      
      this.websocket.onopen = () => {
        console.log('NEPSE WebSocket connected');
        this.subscribeToRealTimeData();
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('NEPSE WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };

      this.websocket.onerror = (error) => {
        console.error('NEPSE WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      // Fallback to polling
      this.startPolling();
    }
  }

  private subscribeToRealTimeData(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'subscribe',
        channels: ['market_data', 'indices', 'trades']
      }));
    }
  }

  private handleWebSocketMessage(data: unknown): void {
    switch (data.type) {
      case 'market_data':
        this.notifySubscribers('stock_update', data.payload);
        break;
      case 'indices':
        this.notifySubscribers('index_update', data.payload);
        break;
      case 'trades':
        this.notifySubscribers('trade_update', data.payload);
        break;
    }
  }

  private notifySubscribers(event: string, data: unknown): void {
    this.subscribers.forEach((callback, key) => {
      if (key.includes(event)) {
        callback(data);
      }
    });
  }

  public subscribe(event: string, callback: (data: unknown) => void): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  // Fallback polling method
  private startPolling(): void {
    this.updateInterval = setInterval(async () => {



      try {
        const [stocks, indices] = await Promise.all([
          this.getAllStocks(),
          this.getIndices()
        ]);
        
        this.notifySubscribers('stock_update', stocks);
        this.notifySubscribers('index_update', indices);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds
  }

  public stopPolling(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Fetch all stocks data
  public async getAllStocks(): Promise<NEPSEStock[]> {
    const cacheKey = 'allStocks';
    
    // Check if we have valid cached data
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached stocks data');
      return this.getCache(cacheKey);
    }
    
    try {
      const response = await axios.get(`${this.apiURL}/security?nonDelisted=true`);
      const parsedStocks = this.parseStockData(response.data);
      
      // Cache the results
      this.setCache(cacheKey, parsedStocks);
      
      return parsedStocks;
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // If we have any cached data (even if expired), use it as fallback
      if (this.cache[cacheKey]) {
        console.log('Using expired cache as fallback for stocks');
        return this.getCache(cacheKey);
      }
      // Return mock data as fallback
      return this.getMockStockData();
    }
  }

  // Fetch specific stock data
  public async getStock(symbol: string): Promise<NEPSEStock | null> {
    try {
      // First try to get the security ID
      const allStocks = await this.getAllStocks();
      const stock = allStocks.find(s => s.symbol === symbol);
      
      if (stock) {
        // If we found the stock in the list, get detailed information
        const response = await axios.get(`${this.apiURL}/security/${symbol}`);
        return this.parseStockData([response.data])[0] || null;
      } else {
        console.error(`Stock with symbol ${symbol} not found`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      return null;
    }
  }

  // Fetch market indices
  public async getIndices(): Promise<NEPSEIndex[]> {
    const cacheKey = 'indices';
    
    // Check if we have valid cached data
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached indices data');
      return this.getCache(cacheKey);
    }
    
    try {
      const response = await axios.get(`${this.apiURL}/index`);
      const parsedIndices = this.parseIndexData(response.data);
      
      // Cache the results
      this.setCache(cacheKey, parsedIndices);
      
      return parsedIndices;
    } catch (error) {
      console.error('Error fetching indices:', error);
      // If we have any cached data (even if expired), use it as fallback
      if (this.cache[cacheKey]) {
        console.log('Using expired cache as fallback for indices');
        return this.getCache(cacheKey);
      }
      return this.getMockIndexData();
    }
  }

  // Fetch market depth for a specific stock
  public async getMarketDepth(symbol: string): Promise<MarketDepth> {
    try {
      // First try to get the security ID
      const allStocks = await this.getAllStocks();
      const stock = allStocks.find(s => s.symbol === symbol);
      
      if (stock) {
        // For the new API, we might need to use a different endpoint or format
        // This is a placeholder - the actual endpoint might be different
        const response = await axios.get(`${this.apiURL}/security/floorsheet/${symbol}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return this.parseMarketDepth(response.data);
      } else {
        console.error(`Stock with symbol ${symbol} not found for market depth`);
        return this.getMockMarketDepth();
      }
    } catch (error) {
      console.error(`Error fetching market depth for ${symbol}:`, error);
      return this.getMockMarketDepth();
    }
  }

  // Fetch floor sheet data
  public async getFloorSheet(date?: string): Promise<FloorSheet[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.post(`${this.apiURL}/nepse-data/floorsheet`, {
        page: 0,
        size: 500,
        sort: 'contractId,desc'
      });
      return this.parseFloorSheet(response.data.content || []);
    } catch (error) {
      console.error('Error fetching floor sheet:', error);
      return [];
    }
  }

  // Fetch historical data for a stock
  public async getHistoricalData(symbol: string, days: number = 365): Promise<HistoricalData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
      
      // First try to get the security ID
      const allStocks = await this.getAllStocks();
      const stock = allStocks.find(s => s.symbol === symbol);
      
      if (!stock) {
        console.error(`Stock with symbol ${symbol} not found for historical data`);
        return this.getMockHistoricalData(symbol, days);
      }
      
      // Use the market/history/security endpoint with the security ID
      const response = await axios.get(`${this.apiURL}/market/history/security/${symbol}`, {
        params: {
          size: 500,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      
      return this.parseHistoricalData(response.data.content || []);
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return this.getMockHistoricalData(symbol, days);
    }
  }

  // Check if market is open
  public async getMarketStatus(): Promise<{ isOpen: boolean; nextOpen?: Date; nextClose?: Date }> {
    try {
      const response = await axios.get(`${this.apiURL}/nepse-data/market-open`);
      // The API returns a boolean or an object with isOpen property
      const isOpen = typeof response.data === 'boolean' ? response.data : 
                    response.data && typeof response.data.isOpen === 'boolean' ? response.data.isOpen : false;
      
      return { isOpen };
    } catch (error) {
      console.error('Error fetching market status:', error);
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
        isOpen: isWeekday && isDuringTradingHours
      };
    }
  }

  // Parse stock data from NEPSE API response
  private parseStockData(data: unknown[]): NEPSEStock[] {
    // Check if data is in content property (common in the new API)
    const stocksData = Array.isArray(data) ? (data[0]?.content ? data[0].content : data) : data;
    
    return stocksData.map((item: Record<string, unknown>) => ({
      symbol: item.symbol || item.securityName || '',
      name: String(item.securityName || item.companyName || item.name || ''),
      ltp: parseFloat(item.lastTradedPrice || item.ltp || item.lastPrice || 0),
      change: parseFloat(item.pointChange || item.change || 0),
      changePercent: parseFloat(item.percentChange || item.percentageChange || 0),
      volume: parseInt(item.totalTradeQuantity || item.volume || item.shareTraded || 0),
      high: parseFloat(item.highPrice || item.high || item.maxPrice || 0),
      low: parseFloat(item.lowPrice || item.low || item.minPrice || 0),
      open: parseFloat(item.openPrice || item.open || 0),
      previousClose: parseFloat(item.previousClose || item.previousDayClosePrice || 0),
      marketCap: parseFloat(item.marketCapitalization || 0),
      turnover: parseFloat(item.turnover || item.amount || 0),
      totalTrades: parseInt(item.totalTrades || item.noOfTransactions || 0),
      sector: item.sectorName || item.sector || 'Unknown'
    }));
  }

  private parseIndexData(data: unknown): NEPSEIndex[] {
    // Check if data is in content property (common in the new API)
    const indicesData = Array.isArray(data.content) ? data.content : 
                       Array.isArray(data) ? data : [];
    
    return indicesData.map((item: Record<string, unknown>) => ({
      name: item.indexName || item.name || '',
      value: parseFloat(item.currentValue || item.indexValue || item.value || 0),
      change: parseFloat(item.pointChange || item.change || 0),
      changePercent: parseFloat(item.percentChange || item.percentageChange || 0),
      high: parseFloat(item.highValue || item.high || 0),
      low: parseFloat(item.lowValue || item.low || 0),
      turnover: parseFloat(item.turnover || 0)
    }));
  }

  private parseMarketDepth(data: Record<string, unknown>): MarketDepth {
    return {
      bids: (Array.isArray(data.bids) ? data.bids : []).map((bid: Record<string, unknown>) => ({
        price: parseFloat(bid.price),
        quantity: parseInt(bid.quantity),
        orders: parseInt(bid.orders || 1)
      })),
      asks: (Array.isArray(data.asks) ? data.asks : []).map((ask: Record<string, unknown>) => ({
        price: parseFloat(ask.price),
        quantity: parseInt(ask.quantity),
        orders: parseInt(ask.orders || 1)
      }))
    };
  }

  private parseFloorSheet(data: unknown[]): FloorSheet[] {
    return data.map(item => ({
      contractNo: item.contractNo,
      symbol: item.symbol,
      buyerMemberId: item.buyerMemberId,
      sellerMemberId: item.sellerMemberId,
      quantity: parseInt(item.quantity),
      rate: parseFloat(item.rate),
      amount: parseFloat(item.amount),
      time: item.time
    }));
  }

  private parseHistoricalData(data: unknown[]): HistoricalData[] {
    return data.map(item => ({
      date: new Date(item.date),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume)
    }));
  }

  // Fetch top gainers
  public async getTopGainers(limit: number = 5): Promise<NEPSEStock[]> {
    const cacheKey = 'topGainers';
    
    // Check if we have valid cached data
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached top gainers data');
      return this.getCache(cacheKey);
    }
    
    try {
      const response = await axios.get(`${this.apiURL}/top-gainers`);
      let gainers = [];
      
      // Handle different response formats
      if (response.data.content && Array.isArray(response.data.content)) {
        // New API format with content property
        gainers = response.data.content;
      } else if (Array.isArray(response.data)) {
        // Old API format with direct array
        gainers = response.data;
      } else {
        console.error('Unexpected API response format for getTopGainers');
        return [];
      }
      
      const parsedGainers = this.parseStockData(gainers).slice(0, limit);
      
      // Cache the results
      this.setCache(cacheKey, parsedGainers);
      
      return parsedGainers;
    } catch (error) {
      console.error('Error fetching top gainers:', error);
      // If we have any cached data (even if expired), use it as fallback
      if (this.cache[cacheKey]) {
        console.log('Using expired cache as fallback for top gainers');
        return this.getCache(cacheKey);
      }
      
      // Fallback to sorting all stocks by change percent
      const allStocks = await this.getAllStocks();
      return allStocks
        .filter(stock => stock.changePercent > 0)
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, limit);
    }
  }

  // Fetch top losers
  public async getTopLosers(limit: number = 5): Promise<NEPSEStock[]> {
    const cacheKey = 'topLosers';
    
    // Check if we have valid cached data
    if (this.isCacheValid(cacheKey)) {
      console.log('Using cached top losers data');
      return this.getCache(cacheKey);
    }
    
    try {
      const response = await axios.get(`${this.apiURL}/top-losers`);
      let losers = [];
      
      // Handle different response formats
      if (response.data.content && Array.isArray(response.data.content)) {
        // New API format with content property
        losers = response.data.content;
      } else if (Array.isArray(response.data)) {
        // Old API format with direct array
        losers = response.data;
      } else {
        console.error('Unexpected API response format for getTopLosers');
        return [];
      }
      
      const parsedLosers = this.parseStockData(losers).slice(0, limit);
      
      // Cache the results
      this.setCache(cacheKey, parsedLosers);
      
      return parsedLosers;
    } catch (error) {
      console.error('Error fetching top losers:', error);
      // If we have any cached data (even if expired), use it as fallback
      if (this.cache[cacheKey]) {
        console.log('Using expired cache as fallback for top losers');
        return this.getCache(cacheKey);
      }
      
      // Fallback to sorting all stocks by change percent
      const allStocks = await this.getAllStocks();
      return allStocks
        .filter(stock => stock.changePercent < 0)
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, limit);
    }
  }

  // Fetch market summary
  public async getMarketSummary(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.apiURL}/market-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market summary:', error);
      return {};
    }
  }

  // Fetch today's price
  public async getTodayPrice(): Promise<unknown[]> {
    try {
      const response = await axios.post(`${this.apiURL}/nepse-data/today-price`, {});
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching today\'s price:', error);
      return [];
    }
  }

  // Fetch corporate disclosures
  public async getCorporateDisclosures(): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/news/companies/disclosure`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching corporate disclosures:', error);
      return [];
    }
  }

  // Fetch NEPSE subindices
  public async getNEPSESubindices(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.apiURL}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NEPSE subindices:', error);
      return {};
    }
  }

  // Fetch graph data for index
  public async getIndexGraphData(indexId: number, startDate?: string, endDate?: string): Promise<unknown[]> {
    try {
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
      
      const response = await axios.post(`${this.apiURL}/graph/index/${indexId}`, {
        startDate: start,
        endDate: end
      });
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching graph data for index ${indexId}:`, error);
      return [];
    }
  }

  // Fetch company graph data
  public async getCompanyGraphData(companyId: number, startDate?: string, endDate?: string): Promise<unknown[]> {
    try {
      const end = endDate || new Date().toISOString().split('T')[0];
      const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
      
      const response = await axios.post(`${this.apiURL}/market/graphdata/${companyId}`, {
        startDate: start,
        endDate: end
      });
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching graph data for company ${companyId}:`, error);
      return [];
    }
  }

  // Fetch market capitalization by date
  public async getMarketCapitalizationByDate(date?: string): Promise<Record<string, unknown>> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.apiURL}/nepse-data/marcapbydate/${targetDate}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market capitalization:', error);
      return {};
    }
  }

  // Fetch supply demand
  public async getSupplyDemand(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.apiURL}/nepse-data/supplydemand`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supply demand:', error);
      return {};
    }
  }

  // Fetch top turnover
  public async getTopTurnover(): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/top-ten/turnover?all=true`);
      return this.parseStockData(response.data);
    } catch (error) {
      console.error('Error fetching top turnover:', error);
      return [];
    }
  }

  // Fetch top volume
  public async getTopVolume(): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/top-ten/trade?all=true`);
      return this.parseStockData(response.data);
    } catch (error) {
      console.error('Error fetching top volume:', error);
      return [];
    }
  }

  // Fetch top transactions
  public async getTopTransactions(): Promise<NEPSEStock[]> {
    try {
      const response = await axios.get(`${this.apiURL}/top-ten/transaction?all=true`);
      return this.parseStockData(response.data);
    } catch (error) {
      console.error('Error fetching top transactions:', error);
      return [];
    }
  }

  // Fetch broker list
  public async getBrokerList(): Promise<unknown[]> {
    try {
      const response = await axios.post(`${this.apiURL}/member?&size=500`, {
        memberName: "",
        contactPerson: "",
        contactNumber: "",
        memberCode: "",
        provinceId: 0,
        districtId: 0,
        municipalityId: 0,
        isDealer: "Y"
      });
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching broker list:', error);
      return [];
    }
  }

  // Fetch NEPSE index
  public async getNEPSEIndex(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.apiURL}/nepse-index`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NEPSE index:', error);
      return {};
    }
  }

  // Fetch indices history
  public async getIndicesHistory(indexId: number): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/index/history/${indexId}`);
      return response.data.content || [];
    } catch (error) {
      console.error(`Error fetching indices history for ${indexId}:`, error);
      return [];
    }
  }

  // Fetch N days trading average price
  public async getNDaysTradingAverage(nDays: number = 120): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/nepse-data/trading-average?nDays=${nDays}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching ${nDays} days trading average:`, error);
      return [];
    }
  }

  // Fetch sectorwise options
  public async getSectorwiseOptions(): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/sectorwise`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sectorwise options:', error);
      return [];
    }
  }

  // Fetch sectorwise details
  public async getSectorwiseDetails(date?: string): Promise<unknown[]> {
    try {
      const businessDate = date || new Date().toISOString().split('T')[0];
      const response = await axios.get(`${this.apiURL}/sectorwise?businessDate=${businessDate}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sectorwise details:', error);
      return [];
    }
  }

  // Fetch company list
  public async getCompanyList(): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/company/list`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching company list:', error);
      return [];
    }
  }

  // Fetch company classification
  public async getCompanyClassification(): Promise<unknown[]> {
    try {
      const response = await axios.get(`${this.apiURL}/security/classification`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching company classification:', error);
      return [];
    }
  }

  // Mock data methods for fallback
  private getMockStockData(): NEPSEStock[] {
    return [
      {
        symbol: 'NABIL',
        name: 'Nabil Bank Limited',
        ltp: 1425.50,
        change: 2.5,
        changePercent: 0.18,
        volume: 235000,
        high: 1430.00,
        low: 1405.00,
        open: 1410.00,
        previousClose: 1423.00,
        turnover: 334875000,
        totalTrades: 1250,
        sector: 'Banking',
        marketCap: 0
      },
      // Add more mock stocks...
    ];
  }

  private getMockIndexData(): NEPSEIndex[] {
    return [
      {
        name: 'NEPSE Index',
        value: 2845.67,
        change: 12.45,
        changePercent: 0.44,
        high: 2850.23,
        low: 2835.12,
        turnover: 5678900000
      }
    ];
  }

  private getMockMarketDepth(): MarketDepth {
    return {
      bids: [
        { price: 1425.00, quantity: 100, orders: 5 },
        { price: 1424.50, quantity: 200, orders: 8 },
        { price: 1424.00, quantity: 150, orders: 3 }
      ],
      asks: [
        { price: 1426.00, quantity: 120, orders: 4 },
        { price: 1426.50, quantity: 180, orders: 6 },
        { price: 1427.00, quantity: 90, orders: 2 }
      ]
    };
  }

  private getMockHistoricalData(symbol: string, days: number): HistoricalData[] {
    const data = [];
    let basePrice = 1425.50;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * 2 * volatility;
      
      basePrice = basePrice * (1 + change);
      const open = basePrice;
      const high = open * (1 + Math.random() * 0.03);
      const low = open * (1 - Math.random() * 0.03);
      const close = low + Math.random() * (high - low);
      
      data.push({
        date,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 500000) + 50000
      });
    }
    
    return data;
  }

  public cleanup(): void {
    this.stopPolling();
    if (this.websocket) {
      this.websocket.close();
    }
    this.subscribers.clear();
  }
}

export default NEPSEDataService;
export type { MarketDepth, FloorSheet };
