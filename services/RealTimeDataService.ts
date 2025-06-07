import AsyncStorage from '@react-native-async-storage/async-storage';

interface RealTimeQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: Date;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  yield?: number;
  beta?: number;
  weekHigh52?: number;
  weekLow52?: number;
  avgVolume?: number;
  sector?: string;
  industry?: string;
  marketStatus: 'open' | 'closed' | 'pre_market' | 'after_hours';
}

interface MarketIndex {
  name: string;
  symbol: string;
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  constituents?: string[];
  marketCap?: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  orders: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: Date;
  spread: number;
  midPrice: number;
}

interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: Date;
  side: 'buy' | 'sell';
  tradeType: 'market' | 'limit';
  value: number;
}

interface MarketDepth {
  symbol: string;
  totalBidQuantity: number;
  totalAskQuantity: number;
  totalBidValue: number;
  totalAskValue: number;
  bidAskRatio: number;
  priceRange: {
    high: number;
    low: number;
    range: number;
  };
  volumeProfile: {
    price: number;
    volume: number;
    percentage: number;
  }[];
  timestamp: Date;
}

interface MarketSentiment {
  symbol?: string;
  overall: 'bullish' | 'bearish' | 'neutral';
  score: number; // -100 to 100
  indicators: {
    rsi: number;
    macd: {
      value: number;
      signal: number;
      histogram: number;
    };
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
      position: 'upper' | 'middle' | 'lower';
    };
    volume: {
      current: number;
      average: number;
      ratio: number;
    };
    momentum: {
      shortTerm: number;
      mediumTerm: number;
      longTerm: number;
    };
  };
  signals: {
    type: 'buy' | 'sell' | 'hold';
    strength: 'strong' | 'moderate' | 'weak';
    reason: string;
    confidence: number;
  }[];
  timestamp: Date;
}

interface MarketAlert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'technical' | 'news' | 'earnings';
  condition: {
    operator: 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'equals';
    value: number;
    field: 'price' | 'volume' | 'change_percent' | 'rsi' | 'macd';
  };
  message: string;
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notificationSent: boolean;
}

interface MarketSession {
  name: string;
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  isActive: boolean;
  nextSession?: {
    name: string;
    startsIn: number; // minutes
  };
}

interface ConnectionStatus {
  isConnected: boolean;
  connectionType: 'websocket' | 'polling' | 'offline';
  lastUpdate: Date;
  latency: number; // milliseconds
  reconnectAttempts: number;
  dataQuality: 'real_time' | 'delayed' | 'cached';
}

interface SubscriptionConfig {
  symbols: string[];
  dataTypes: ('quotes' | 'trades' | 'orderbook' | 'depth')[];
  updateFrequency: number; // milliseconds
  maxUpdatesPerSecond: number;
  enableBatching: boolean;
  compressionEnabled: boolean;
}

class RealTimeDataService {
  private static instance: RealTimeDataService;
  private websocket: WebSocket | null = null;
  private subscribers: Map<string, (data: any) => void> = new Map();
  private quotes: Map<string, RealTimeQuote> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();
  private trades: Map<string, Trade[]> = new Map();
  private marketDepth: Map<string, MarketDepth> = new Map();
  private marketSentiment: Map<string, MarketSentiment> = new Map();
  private alerts: Map<string, MarketAlert> = new Map();
  private connectionStatus: ConnectionStatus;
  private subscriptionConfig: SubscriptionConfig;
  private reconnectTimer: NodeJS.Timeout | number | null = null;
  private heartbeatTimer: NodeJS.Timeout | number | null = null;
  private updateTimer: NodeJS.Timeout | number | null = null;
  private isReconnecting = false;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private subscribedSymbols: Set<string> = new Set();
  private dataBuffer: Map<string, any[]> = new Map();
  private lastUpdateTime: Map<string, number> = new Map();
  private rateLimiters: Map<string, number> = new Map();

  private constructor() {
    this.connectionStatus = {
      isConnected: false,
      connectionType: 'offline',
      lastUpdate: new Date(),
      latency: 0,
      reconnectAttempts: 0,
      dataQuality: 'cached'
    };

    this.subscriptionConfig = {
      symbols: [],
      dataTypes: ['quotes'],
      updateFrequency: 1000,
      maxUpdatesPerSecond: 10,
      enableBatching: true,
      compressionEnabled: false
    };

    this.loadStoredData();
    this.startPollingFallback();
  }

  public static getInstance(): RealTimeDataService {
    if (!RealTimeDataService.instance) {
      RealTimeDataService.instance = new RealTimeDataService();
    }
    return RealTimeDataService.instance;
  }

  // Connection Management
  public async connect(config?: Partial<SubscriptionConfig>): Promise<boolean> {
    if (config) {
      this.subscriptionConfig = { ...this.subscriptionConfig, ...config };
    }

    try {
      // Try WebSocket connection first
      const wsConnected = await this.connectWebSocket();
      if (wsConnected) {
        this.connectionStatus.connectionType = 'websocket';
        this.connectionStatus.dataQuality = 'real_time';
        return true;
      }

      // Fallback to polling
      this.connectionStatus.connectionType = 'polling';
      this.connectionStatus.dataQuality = 'delayed';
      this.startPollingFallback();
      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      this.connectionStatus.connectionType = 'offline';
      this.connectionStatus.dataQuality = 'cached';
      return false;
    }
  }

  private async connectWebSocket(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // In a real implementation, this would connect to NEPSE WebSocket
        // For now, we'll simulate WebSocket behavior
        this.websocket = new WebSocket('wss://mock-nepse-websocket.com/v1/stream');

        this.websocket.onopen = () => {
          console.log('WebSocket connected');
          this.connectionStatus.isConnected = true;
          this.connectionStatus.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.startHeartbeat();
          this.subscribeToSymbols();
          this.notifySubscribers('connection_status', this.connectionStatus);
          resolve(true);
        };

        this.websocket.onmessage = (event) => {
          this.handleWebSocketMessage(event.data);
        };

        this.websocket.onclose = () => {
          console.log('WebSocket disconnected');
          this.connectionStatus.isConnected = false;
          this.stopHeartbeat();
          this.handleDisconnection();
        };

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          resolve(false);
        };

        // Timeout after 5 seconds
        setTimeout(() => {
          if (!this.connectionStatus.isConnected) {
            this.websocket?.close();
            resolve(false);
          }
        }, 5000);
      } catch (error) {
        console.error('WebSocket connection error:', error);
        resolve(false);
      }
    });
  }

  private handleWebSocketMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      const now = Date.now();
      
      // Calculate latency
      if (message.timestamp) {
        this.connectionStatus.latency = now - new Date(message.timestamp).getTime();
      }

      switch (message.type) {
        case 'quote':
          this.handleQuoteUpdate(message.data);
          break;
        case 'trade':
          this.handleTradeUpdate(message.data);
          break;
        case 'orderbook':
          this.handleOrderBookUpdate(message.data);
          break;
        case 'depth':
          this.handleMarketDepthUpdate(message.data);
          break;
        case 'sentiment':
          this.handleSentimentUpdate(message.data);
          break;
        case 'heartbeat':
          this.handleHeartbeat(message.data);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }

      this.connectionStatus.lastUpdate = new Date();
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleDisconnection(): void {
    if (!this.isReconnecting && this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
      this.isReconnecting = true;
      const delay = Math.min(this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts), this.maxReconnectDelay);
      
      this.reconnectTimer = global.setTimeout(() => {
        this.connectionStatus.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleHeartbeat(data: any): void {
    // Update connection quality based on heartbeat response
    const latency = Date.now() - data.timestamp;
    this.connectionStatus.latency = latency;
    
    if (latency > 5000) {
      this.connectionStatus.dataQuality = 'delayed';
    } else {
      this.connectionStatus.dataQuality = 'real_time';
    }
  }

  // Subscription Management
  public subscribe(event: string, callback: (data: any) => void): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  public subscribeToSymbol(symbol: string): void {
    this.subscribedSymbols.add(symbol.toUpperCase());
    
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'subscribe',
        symbol: symbol.toUpperCase(),
        dataTypes: this.subscriptionConfig.dataTypes
      }));
    }
  }

  public unsubscribeFromSymbol(symbol: string): void {
    this.subscribedSymbols.delete(symbol.toUpperCase());
    
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'unsubscribe',
        symbol: symbol.toUpperCase()
      }));
    }
  }

  private subscribeToSymbols(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.subscribedSymbols.forEach(symbol => {
        this.websocket!.send(JSON.stringify({
          type: 'subscribe',
          symbol,
          dataTypes: this.subscriptionConfig.dataTypes
        }));
      });
    }
  }

  // Data Handlers
  private handleQuoteUpdate(quote: RealTimeQuote): void {
    const symbol = quote.symbol.toUpperCase();
    
    // Rate limiting
    const lastUpdate = this.lastUpdateTime.get(symbol) || 0;
    const now = Date.now();
    const minInterval = 1000 / this.subscriptionConfig.maxUpdatesPerSecond;
    
    if (now - lastUpdate < minInterval) {
      // Buffer the update
      if (!this.dataBuffer.has(symbol)) {
        this.dataBuffer.set(symbol, []);
      }
      this.dataBuffer.get(symbol)!.push(quote);
      return;
    }
    
    this.lastUpdateTime.set(symbol, now);
    this.quotes.set(symbol, quote);
    
    // Check alerts
    this.checkAlerts(quote);
    
    // Notify subscribers
    this.notifySubscribers('quote_update', quote);
    this.notifySubscribers(`quote_${symbol}`, quote);
    
    // Save to storage periodically
    this.saveQuoteToStorage(quote);
  }

  private handleTradeUpdate(trade: Trade): void {
    const symbol = trade.symbol.toUpperCase();
    
    if (!this.trades.has(symbol)) {
      this.trades.set(symbol, []);
    }
    
    const trades = this.trades.get(symbol)!;
    trades.unshift(trade);
    
    // Keep only last 1000 trades per symbol
    if (trades.length > 1000) {
      trades.splice(1000);
    }
    
    this.notifySubscribers('trade_update', trade);
    this.notifySubscribers(`trades_${symbol}`, trades.slice(0, 100)); // Send last 100 trades
  }

  private handleOrderBookUpdate(orderBook: OrderBook): void {
    const symbol = orderBook.symbol.toUpperCase();
    this.orderBooks.set(symbol, orderBook);
    
    this.notifySubscribers('orderbook_update', orderBook);
    this.notifySubscribers(`orderbook_${symbol}`, orderBook);
  }

  private handleMarketDepthUpdate(depth: MarketDepth): void {
    const symbol = depth.symbol.toUpperCase();
    this.marketDepth.set(symbol, depth);
    
    this.notifySubscribers('depth_update', depth);
    this.notifySubscribers(`depth_${symbol}`, depth);
  }

  private handleSentimentUpdate(sentiment: MarketSentiment): void {
    const key = sentiment.symbol ? sentiment.symbol.toUpperCase() : 'MARKET';
    this.marketSentiment.set(key, sentiment);
    
    this.notifySubscribers('sentiment_update', sentiment);
    if (sentiment.symbol) {
      this.notifySubscribers(`sentiment_${sentiment.symbol}`, sentiment);
    } else {
      this.notifySubscribers('market_sentiment', sentiment);
    }
  }

  // Data Getters
  public getQuote(symbol: string): RealTimeQuote | null {
    return this.quotes.get(symbol.toUpperCase()) || null;
  }

  public getQuotes(symbols?: string[]): Map<string, RealTimeQuote> {
    if (symbols) {
      const filtered = new Map<string, RealTimeQuote>();
      symbols.forEach(symbol => {
        const quote = this.quotes.get(symbol.toUpperCase());
        if (quote) {
          filtered.set(symbol.toUpperCase(), quote);
        }
      });
      return filtered;
    }
    return new Map(this.quotes);
  }

  public getOrderBook(symbol: string): OrderBook | null {
    return this.orderBooks.get(symbol.toUpperCase()) || null;
  }

  public getTrades(symbol: string, limit = 100): Trade[] {
    const trades = this.trades.get(symbol.toUpperCase()) || [];
    return trades.slice(0, limit);
  }

  public getMarketDepth(symbol: string): MarketDepth | null {
    return this.marketDepth.get(symbol.toUpperCase()) || null;
  }

  public getMarketSentiment(symbol?: string): MarketSentiment | null {
    const key = symbol ? symbol.toUpperCase() : 'MARKET';
    return this.marketSentiment.get(key) || null;
  }

  public getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public getSubscribedSymbols(): string[] {
    return Array.from(this.subscribedSymbols);
  }

  // Market Session Management
  public getCurrentMarketSession(): MarketSession {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:mm format
    
    // NEPSE trading hours (Sunday to Thursday, 11:00 AM to 3:00 PM)
    const sessions: MarketSession[] = [
      {
        name: 'Pre Market',
        startTime: '10:00',
        endTime: '11:00',
        timezone: 'Asia/Kathmandu',
        isActive: false
      },
      {
        name: 'Regular Trading',
        startTime: '11:00',
        endTime: '15:00',
        timezone: 'Asia/Kathmandu',
        isActive: false
      },
      {
        name: 'After Hours',
        startTime: '15:00',
        endTime: '16:00',
        timezone: 'Asia/Kathmandu',
        isActive: false
      }
    ];
    
    // Check if it's a trading day (Sunday to Thursday in Nepal)
    const dayOfWeek = now.getDay();
    const isTradingDay = dayOfWeek >= 0 && dayOfWeek <= 4; // Sunday = 0, Thursday = 4
    
    if (!isTradingDay) {
      return {
        name: 'Market Closed',
        startTime: '11:00',
        endTime: '15:00',
        timezone: 'Asia/Kathmandu',
        isActive: false,
        nextSession: {
          name: 'Regular Trading',
          startsIn: this.getMinutesUntilNextTradingDay()
        }
      };
    }
    
    for (const session of sessions) {
      if (currentTime >= session.startTime && currentTime < session.endTime) {
        return { ...session, isActive: true };
      }
    }
    
    // Market is closed, find next session
    const nextSession = sessions.find(s => currentTime < s.startTime);
    if (nextSession) {
      return {
        name: 'Market Closed',
        startTime: nextSession.startTime,
        endTime: nextSession.endTime,
        timezone: 'Asia/Kathmandu',
        isActive: false,
        nextSession: {
          name: nextSession.name,
          startsIn: this.getMinutesUntil(nextSession.startTime)
        }
      };
    }
    
    // After all sessions, next is tomorrow
    return {
      name: 'Market Closed',
      startTime: '11:00',
      endTime: '15:00',
      timezone: 'Asia/Kathmandu',
      isActive: false,
      nextSession: {
        name: 'Regular Trading',
        startsIn: this.getMinutesUntilNextTradingDay()
      }
    };
  }

  private getMinutesUntil(timeString: string): number {
    const now = new Date();
    const [hours, minutes] = timeString.split(':').map(Number);
    const targetTime = new Date(now);
    targetTime.setHours(hours, minutes, 0, 0);
    
    if (targetTime <= now) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    return Math.floor((targetTime.getTime() - now.getTime()) / (1000 * 60));
  }

  private getMinutesUntilNextTradingDay(): number {
    const now = new Date();
    let nextTradingDay = new Date(now);
    
    // Find next Sunday (start of trading week in Nepal)
    while (nextTradingDay.getDay() !== 0) {
      nextTradingDay.setDate(nextTradingDay.getDate() + 1);
    }
    
    nextTradingDay.setHours(11, 0, 0, 0); // 11:00 AM
    
    return Math.floor((nextTradingDay.getTime() - now.getTime()) / (1000 * 60));
  }

  // Alert Management
  public createAlert(alert: Omit<MarketAlert, 'id' | 'createdAt' | 'triggeredAt' | 'notificationSent'>): string {
    const id = `alert_${Date.now()}_${Math.random()}`;
    const newAlert: MarketAlert = {
      ...alert,
      id,
      createdAt: new Date(),
      notificationSent: false
    };
    
    this.alerts.set(id, newAlert);
    this.saveAlertsToStorage();
    this.notifySubscribers('alert_created', newAlert);
    
    return id;
  }

  public getAlerts(symbol?: string): MarketAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (symbol) {
      alerts = alerts.filter(alert => alert.symbol.toUpperCase() === symbol.toUpperCase());
    }
    
    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public deleteAlert(id: string): boolean {
    const deleted = this.alerts.delete(id);
    if (deleted) {
      this.saveAlertsToStorage();
      this.notifySubscribers('alert_deleted', { id });
    }
    return deleted;
  }

  public toggleAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    
    alert.isActive = !alert.isActive;
    this.saveAlertsToStorage();
    this.notifySubscribers('alert_toggled', alert);
    
    return alert.isActive;
  }

  private checkAlerts(quote: RealTimeQuote): void {
    const symbolAlerts = Array.from(this.alerts.values())
      .filter(alert => alert.symbol.toUpperCase() === quote.symbol.toUpperCase() && alert.isActive);
    
    symbolAlerts.forEach(alert => {
      const triggered = this.evaluateAlertCondition(alert, quote);
      
      if (triggered && !alert.triggeredAt) {
        alert.triggeredAt = new Date();
        alert.notificationSent = false;
        
        this.notifySubscribers('alert_triggered', {
          alert,
          quote,
          message: alert.message
        });
        
        // Deactivate one-time alerts
        if (alert.type === 'price') {
          alert.isActive = false;
        }
        
        this.saveAlertsToStorage();
      }
    });
  }

  private evaluateAlertCondition(alert: MarketAlert, quote: RealTimeQuote): boolean {
    const { condition } = alert;
    let currentValue: number;
    
    switch (condition.field) {
      case 'price':
        currentValue = quote.price;
        break;
      case 'volume':
        currentValue = quote.volume;
        break;
      case 'change_percent':
        currentValue = quote.changePercent;
        break;
      default:
        return false;
    }
    
    switch (condition.operator) {
      case 'above':
        return currentValue > condition.value;
      case 'below':
        return currentValue < condition.value;
      case 'equals':
        return Math.abs(currentValue - condition.value) < 0.01;
      case 'crosses_above':
        // This would require historical data to implement properly
        return currentValue > condition.value;
      case 'crosses_below':
        // This would require historical data to implement properly
        return currentValue < condition.value;
      default:
        return false;
    }
  }

  // Polling Fallback
  private startPollingFallback(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    this.updateTimer = setInterval(() => {

      this.fetchDataPolling();
    }, this.subscriptionConfig.updateFrequency);
  }

  private async fetchDataPolling(): Promise<void> {
    try {
      // In a real implementation, this would fetch from NEPSE API
      // For now, we'll generate mock data
      this.subscribedSymbols.forEach(symbol => {
        const mockQuote = this.generateMockQuote(symbol);
        this.handleQuoteUpdate(mockQuote);
      });
      
      this.connectionStatus.lastUpdate = new Date();
      this.connectionStatus.isConnected = true;
    } catch (error) {
      console.error('Polling error:', error);
      this.connectionStatus.isConnected = false;
    }
  }

  private generateMockQuote(symbol: string): RealTimeQuote {
    const basePrice = 100 + Math.random() * 900; // Random price between 100-1000
    const change = (Math.random() - 0.5) * 20; // Random change between -10 to +10
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol: symbol.toUpperCase(),
      price: Math.round(basePrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 100000),
      high: Math.round((basePrice + Math.abs(change)) * 100) / 100,
      low: Math.round((basePrice - Math.abs(change)) * 100) / 100,
      open: Math.round((basePrice - change) * 100) / 100,
      previousClose: Math.round((basePrice - change) * 100) / 100,
      timestamp: new Date(),
      bid: Math.round((basePrice - 0.5) * 100) / 100,
      ask: Math.round((basePrice + 0.5) * 100) / 100,
      bidSize: Math.floor(Math.random() * 1000),
      askSize: Math.floor(Math.random() * 1000),
      marketCap: Math.floor(Math.random() * 10000000000),
      pe: Math.round((10 + Math.random() * 20) * 100) / 100,
      eps: Math.round((basePrice / (10 + Math.random() * 20)) * 100) / 100,
      dividend: Math.round((Math.random() * 5) * 100) / 100,
      yield: Math.round((Math.random() * 8) * 100) / 100,
      beta: Math.round((0.5 + Math.random() * 1.5) * 100) / 100,
      weekHigh52: Math.round((basePrice * 1.2) * 100) / 100,
      weekLow52: Math.round((basePrice * 0.8) * 100) / 100,
      avgVolume: Math.floor(Math.random() * 50000),
      sector: 'Banking',
      industry: 'Commercial Banks',
      marketStatus: this.getCurrentMarketSession().isActive ? 'open' : 'closed'
    };
  }

  // Notification
  private notifySubscribers(event: string, data: any): void {
    this.subscribers.forEach((callback, key) => {
      if (key.includes(event)) {
        try {
          callback(data);
        } catch (error) {
          console.error('Error notifying subscriber:', error);
        }
      }
    });
  }

  // Storage Methods
  private async loadStoredData(): Promise<void> {
    try {
      const [quotesData, alertsData, subscriptionsData] = await Promise.all([
        AsyncStorage.getItem('realtime_quotes'),
        AsyncStorage.getItem('realtime_alerts'),
        AsyncStorage.getItem('realtime_subscriptions')
      ]);

      if (quotesData) {
        const quotes = JSON.parse(quotesData);
        quotes.forEach((quote: any) => {
          quote.timestamp = new Date(quote.timestamp);
          this.quotes.set(quote.symbol, quote);
        });
      }

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        alerts.forEach((alert: any) => {
          alert.createdAt = new Date(alert.createdAt);
          if (alert.triggeredAt) {
            alert.triggeredAt = new Date(alert.triggeredAt);
          }
          this.alerts.set(alert.id, alert);
        });
      }

      if (subscriptionsData) {
        const subscriptions = JSON.parse(subscriptionsData);
        subscriptions.forEach((symbol: string) => {
          this.subscribedSymbols.add(symbol);
        });
      }
    } catch (error) {
      console.error('Failed to load real-time data:', error);
    }
  }

  private async saveQuoteToStorage(quote: RealTimeQuote): Promise<void> {
    try {
      // Save only recent quotes to avoid storage bloat
      const recentQuotes = Array.from(this.quotes.values())
        .filter(q => Date.now() - q.timestamp.getTime() < 24 * 60 * 60 * 1000); // Last 24 hours
      
      await AsyncStorage.setItem('realtime_quotes', JSON.stringify(recentQuotes));
    } catch (error) {
      console.error('Failed to save quote:', error);
    }
  }

  private async saveAlertsToStorage(): Promise<void> {
    try {
      const alerts = Array.from(this.alerts.values());
      await AsyncStorage.setItem('realtime_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  private async saveSubscriptionsToStorage(): Promise<void> {
    try {
      const subscriptions = Array.from(this.subscribedSymbols);
      await AsyncStorage.setItem('realtime_subscriptions', JSON.stringify(subscriptions));
    } catch (error) {
      console.error('Failed to save subscriptions:', error);
    }
  }

  // Cleanup
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
    
    this.connectionStatus.isConnected = false;
    this.connectionStatus.connectionType = 'offline';
  }

  public cleanup(): void {
    this.disconnect();
    this.subscribers.clear();
    this.quotes.clear();
    this.orderBooks.clear();
    this.trades.clear();
    this.marketDepth.clear();
    this.marketSentiment.clear();
    this.subscribedSymbols.clear();
    this.dataBuffer.clear();
    this.lastUpdateTime.clear();
    this.rateLimiters.clear();
  }
}

export default RealTimeDataService;
export type {
  RealTimeQuote,
  MarketIndex,
  OrderBook,
  OrderBookEntry,
  Trade,
  MarketDepth,
  MarketSentiment,
  MarketAlert,
  MarketSession,
  ConnectionStatus,
  SubscriptionConfig
};