import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEPSEStock } from './NEPSEDataService';

interface ScanCriteria {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'fundamental' | 'volume' | 'price' | 'custom';
  conditions: ScanCondition[];
  isActive: boolean;
  createdAt: Date;
  lastRun?: Date;
  resultsCount?: number;
}

interface ScanCondition {
  field: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between' | 'in' | 'not_in' | 'contains' | 'starts_with' | 'ends_with';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

interface ScanResult {
  symbol: string;
  stockData: NEPSEStock;
  matchedCriteria: string[];
  score: number;
  signals: {
    type: 'buy' | 'sell' | 'hold';
    strength: 'strong' | 'moderate' | 'weak';
    reason: string;
    confidence: number;
  }[];
  timestamp: Date;
}

interface MarketOpportunity {
  id: string;
  type: 'breakout' | 'breakdown' | 'reversal' | 'momentum' | 'value' | 'growth' | 'dividend';
  symbol: string;
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  entry: number;
  target: number;
  stopLoss: number;
  riskReward: number;
  volume: number;
  timestamp: Date;
  isActive: boolean;
}

interface ScreenerFilter {
  marketCap?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  volume?: { min?: number; max?: number };
  change?: { min?: number; max?: number };
  pe?: { min?: number; max?: number };
  pb?: { min?: number; max?: number };
  dividend?: { min?: number; max?: number };
  sector?: string[];
  exchange?: string[];
  rsi?: { min?: number; max?: number };
  macd?: 'bullish' | 'bearish' | 'neutral';
  movingAverage?: {
    period: number;
    position: 'above' | 'below';
  };
  pattern?: string[];
  volatility?: { min?: number; max?: number };
  beta?: { min?: number; max?: number };
}

interface WatchlistAlert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'technical' | 'news' | 'earnings';
  condition: string;
  value: any;
  isActive: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  notificationSent: boolean;
}

interface TechnicalPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  reliability: number;
  description: string;
  timeframe: string;
  confirmation: boolean;
}

interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  reason: string;
  category: 'gainer' | 'loser' | 'volume' | 'breakout';
  timestamp: Date;
}

interface SectorAnalysis {
  sector: string;
  performance: {
    day: number;
    week: number;
    month: number;
    quarter: number;
    year: number;
  };
  topStocks: {
    symbol: string;
    change: number;
    volume: number;
  }[];
  marketCap: number;
  avgPE: number;
  avgPB: number;
  momentum: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
  outlook: string;
}

class MarketScannerService {
  private static instance: MarketScannerService;
  private scanCriteria: Map<string, ScanCriteria> = new Map();
  private scanResults: Map<string, ScanResult[]> = new Map();
  private opportunities: Map<string, MarketOpportunity> = new Map();
  private watchlistAlerts: Map<string, WatchlistAlert[]> = new Map();
  private marketMovers: MarketMover[] = [];
  private sectorAnalysis: Map<string, SectorAnalysis> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private scanInterval: NodeJS.Timeout | number | null = null;
  private isScanning: boolean = false;

  private constructor() {
    this.loadStoredData();
    this.initializeDefaultScans();
    this.startPeriodicScanning();
  }

  public static getInstance(): MarketScannerService {
    if (!MarketScannerService.instance) {
      MarketScannerService.instance = new MarketScannerService();
    }
    return MarketScannerService.instance;
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

  // Scan Criteria Management
  public createScanCriteria(criteria: Omit<ScanCriteria, 'id' | 'createdAt'>): string {
    const id = `scan_${Date.now()}_${Math.random()}`;
    const newCriteria: ScanCriteria = {
      ...criteria,
      id,
      createdAt: new Date()
    };
    
    this.scanCriteria.set(id, newCriteria);
    this.saveScanCriteriaToStorage();
    this.notifySubscribers('scan_criteria_created', newCriteria);
    
    return id;
  }

  public updateScanCriteria(id: string, updates: Partial<ScanCriteria>): boolean {
    const criteria = this.scanCriteria.get(id);
    if (!criteria) return false;
    
    const updatedCriteria = { ...criteria, ...updates };
    this.scanCriteria.set(id, updatedCriteria);
    this.saveScanCriteriaToStorage();
    this.notifySubscribers('scan_criteria_updated', updatedCriteria);
    
    return true;
  }

  public deleteScanCriteria(id: string): boolean {
    const deleted = this.scanCriteria.delete(id);
    if (deleted) {
      this.scanResults.delete(id);
      this.saveScanCriteriaToStorage();
      this.notifySubscribers('scan_criteria_deleted', { id });
    }
    return deleted;
  }

  public getScanCriteria(category?: string): ScanCriteria[] {
    let criteria = Array.from(this.scanCriteria.values());
    
    if (category) {
      criteria = criteria.filter(c => c.category === category);
    }
    
    return criteria.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Market Scanning
  public async runScan(criteriaId: string, stocks?: NEPSEStock[]): Promise<ScanResult[]> {
    const criteria = this.scanCriteria.get(criteriaId);
    if (!criteria) {
      throw new Error('Scan criteria not found');
    }
    
    if (!stocks) {
      // In a real implementation, this would fetch from NEPSEDataService
      stocks = this.generateMockStockData();
    }
    
    const results: ScanResult[] = [];
    
    for (const stock of stocks) {
      const matchResult = this.evaluateStock(stock, criteria);
      if (matchResult.matches) {
        results.push({
          symbol: stock.symbol,
          stockData: stock,
          matchedCriteria: matchResult.matchedCriteria,
          score: matchResult.score,
          signals: this.generateSignals(stock, criteria),
          timestamp: new Date()
        });
      }
    }
    
    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    this.scanResults.set(criteriaId, results);
    
    // Update criteria with last run info
    criteria.lastRun = new Date();
    criteria.resultsCount = results.length;
    this.scanCriteria.set(criteriaId, criteria);
    
    this.saveScanCriteriaToStorage();
    this.notifySubscribers('scan_completed', { criteriaId, results });
    
    return results;
  }

  public async runAllActiveScans(): Promise<void> {
    if (this.isScanning) return;
    
    this.isScanning = true;
    const activeScans = Array.from(this.scanCriteria.values()).filter(c => c.isActive);
    
    try {
      for (const criteria of activeScans) {
        await this.runScan(criteria.id);
        // Small delay between scans to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error running scans:', error);
    } finally {
      this.isScanning = false;
    }
  }

  public getScanResults(criteriaId: string): ScanResult[] {
    return this.scanResults.get(criteriaId) || [];
  }

  private evaluateStock(stock: NEPSEStock, criteria: ScanCriteria): {
    matches: boolean;
    matchedCriteria: string[];
    score: number;
  } {
    const matchedCriteria: string[] = [];
    let score = 0;
    let conditionResults: boolean[] = [];
    
    for (const condition of criteria.conditions) {
      const result = this.evaluateCondition(stock, condition);
      conditionResults.push(result);
      
      if (result) {
        matchedCriteria.push(`${condition.field} ${condition.operator} ${condition.value}`);
        score += this.getConditionWeight(condition);
      }
    }
    
    // Evaluate logical operators
    let matches = conditionResults.length > 0;
    if (conditionResults.length > 1) {
      // Simple AND/OR logic (in a real implementation, this would be more sophisticated)
      const hasOr = criteria.conditions.some(c => c.logicalOperator === 'OR');
      if (hasOr) {
        matches = conditionResults.some(r => r);
      } else {
        matches = conditionResults.every(r => r);
      }
    } else if (conditionResults.length === 1) {
      matches = conditionResults[0];
    }
    
    return { matches, matchedCriteria, score };
  }

  private evaluateCondition(stock: NEPSEStock, condition: ScanCondition): boolean {
    const value = this.getStockFieldValue(stock, condition.field);
    
    if (value === undefined || value === null) return false;
    
    switch (condition.operator) {
      case 'gt':
        return Number(value) > Number(condition.value);
      case 'lt':
        return Number(value) < Number(condition.value);
      case 'eq':
        return value === condition.value;
      case 'gte':
        return Number(value) >= Number(condition.value);
      case 'lte':
        return Number(value) <= Number(condition.value);
      case 'between':
        const [min, max] = condition.value;
        return Number(value) >= Number(min) && Number(value) <= Number(max);
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(value);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(value);
      case 'contains':
        return String(value).toLowerCase().includes(String(condition.value).toLowerCase());
      case 'starts_with':
        return String(value).toLowerCase().startsWith(String(condition.value).toLowerCase());
      case 'ends_with':
        return String(value).toLowerCase().endsWith(String(condition.value).toLowerCase());
      default:
        return false;
    }
  }

  private getStockFieldValue(stock: NEPSEStock, field: string): any {
    const fieldMap: { [key: string]: any } = {
      'price': stock.ltp,
      'change': stock.change,
      'changePercent': stock.changePercent,
      'volume': stock.volume,
      'turnover': stock.turnover,
      'high': stock.high,
      'low': stock.low,
      'open': stock.open,
      'previousClose': stock.previousClose,
      'marketCap': stock.marketCap,
      'pe': stock.pe,
      'pb': stock.pb,
      'eps': stock.eps,
      'bookValue': stock.bookValue,
      'dividend': stock.dividend,
      'sector': stock.sector,
      'symbol': stock.symbol,
      'name': stock.name
    };
    
    return fieldMap[field];
  }

  private getConditionWeight(condition: ScanCondition): number {
    // Assign weights based on condition importance
    const weights: { [key: string]: number } = {
      'volume': 15,
      'changePercent': 20,
      'price': 10,
      'pe': 15,
      'pb': 10,
      'marketCap': 10,
      'sector': 5,
      'dividend': 10,
      'turnover': 5
    };
    
    return weights[condition.field] || 5;
  }

  private generateSignals(stock: NEPSEStock, criteria: ScanCriteria): ScanResult['signals'] {
    const signals: ScanResult['signals'] = [];
    
    // Generate signals based on stock data and criteria
    if (stock.changePercent > 5) {
      signals.push({
        type: 'buy',
        strength: 'strong',
        reason: 'Strong upward momentum',
        confidence: Math.min(stock.changePercent * 10, 100)
      });
    } else if (stock.changePercent < -5) {
      signals.push({
        type: 'sell',
        strength: 'strong',
        reason: 'Strong downward momentum',
        confidence: Math.min(Math.abs(stock.changePercent) * 10, 100)
      });
    }
    
    if (stock.volume > 100000) {
      signals.push({
        type: 'buy',
        strength: 'moderate',
        reason: 'High volume activity',
        confidence: 70
      });
    }
    
    if (stock.pe && Number(stock.pe) < 15 && stock.changePercent > 0) {
      signals.push({
        type: 'buy',
        strength: 'moderate',
        reason: 'Undervalued with positive momentum',
        confidence: 65
      });
    }
    
    return signals;
  }

  // Market Opportunities
  public async scanForOpportunities(): Promise<MarketOpportunity[]> {
    const stocks = this.generateMockStockData();
    const opportunities: MarketOpportunity[] = [];
    
    for (const stock of stocks) {
      const stockOpportunities = this.identifyOpportunities(stock);
      opportunities.push(...stockOpportunities);
    }
    
    // Sort by confidence
    opportunities.sort((a, b) => b.confidence - a.confidence);
    
    // Store top opportunities
    opportunities.slice(0, 50).forEach(opp => {
      this.opportunities.set(opp.id, opp);
    });
    
    this.notifySubscribers('opportunities_updated', opportunities.slice(0, 20));
    return opportunities.slice(0, 20);
  }

  private identifyOpportunities(stock: NEPSEStock): MarketOpportunity[] {
    const opportunities: MarketOpportunity[] = [];
    
    // Breakout opportunity
    if (stock.changePercent > 3 && stock.volume > 50000) {
      opportunities.push({
        id: `breakout_${stock.symbol}_${Date.now()}`,
        type: 'breakout',
        symbol: stock.symbol,
        title: `${stock.symbol} Breakout`,
        description: `${stock.name} showing strong breakout with ${stock.changePercent.toFixed(2)}% gain`,
        confidence: Math.min(stock.changePercent * 15 + (stock.volume / 1000), 100),
        timeframe: '1D',
        entry: stock.ltp,
        target: stock.ltp * 1.1,
        stopLoss: stock.ltp * 0.95,
        riskReward: 2.0,
        volume: stock.volume,
        timestamp: new Date(),
        isActive: true
      });
    }
    
    // Value opportunity
    if (stock.pe && Number(stock.pe) < 12 && stock.pb && Number(stock.pb) < 1.5) {
      opportunities.push({
        id: `value_${stock.symbol}_${Date.now()}`,
        type: 'value',
        symbol: stock.symbol,
        title: `${stock.symbol} Value Play`,
        description: `${stock.name} appears undervalued with PE ${Number(stock.pe).toFixed(2)} and PB ${Number(stock.pb).toFixed(2)}`,
        confidence: 75,
        timeframe: '1W',
        entry: stock.ltp,
        target: stock.ltp * 1.2,
        stopLoss: stock.ltp * 0.9,
        riskReward: 1.8,
        volume: stock.volume,
        timestamp: new Date(),
        isActive: true
      });
    }
    
    // Momentum opportunity
    if (stock.changePercent > 2 && stock.changePercent < 8) {
      opportunities.push({
        id: `momentum_${stock.symbol}_${Date.now()}`,
        type: 'momentum',
        symbol: stock.symbol,
        title: `${stock.symbol} Momentum`,
        description: `${stock.name} showing sustained momentum with controlled gains`,
        confidence: 60,
        timeframe: '1D',
        entry: stock.ltp,
        target: stock.ltp * 1.05,
        stopLoss: stock.ltp * 0.97,
        riskReward: 1.5,
        volume: stock.volume,
        timestamp: new Date(),
        isActive: true
      });
    }
    
    return opportunities;
  }

  public getOpportunities(type?: string): MarketOpportunity[] {
    let opportunities = Array.from(this.opportunities.values());
    
    if (type) {
      opportunities = opportunities.filter(opp => opp.type === type);
    }
    
    return opportunities
      .filter(opp => opp.isActive)
      .sort((a, b) => b.confidence - a.confidence);
  }

  // Market Movers
  public async getMarketMovers(): Promise<{
    gainers: MarketMover[];
    losers: MarketMover[];
    volumeLeaders: MarketMover[];
    breakouts: MarketMover[];
  }> {
    const stocks = this.generateMockStockData();
    
    const gainers = stocks
      .filter(s => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10)
      .map(s => this.createMarketMover(s, 'gainer'));
    
    const losers = stocks
      .filter(s => s.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10)
      .map(s => this.createMarketMover(s, 'loser'));
    
    const volumeLeaders = stocks
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10)
      .map(s => this.createMarketMover(s, 'volume'));
    
    const breakouts = stocks
      .filter(s => s.changePercent > 3 && s.volume > 50000)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10)
      .map(s => this.createMarketMover(s, 'breakout'));
    
    this.marketMovers = [...gainers, ...losers, ...volumeLeaders, ...breakouts];
    
    return { gainers, losers, volumeLeaders, breakouts };
  }

  private createMarketMover(stock: NEPSEStock, category: MarketMover['category']): MarketMover {
    let reason = '';
    
    switch (category) {
      case 'gainer':
        reason = `Up ${stock.changePercent.toFixed(2)}% with strong buying interest`;
        break;
      case 'loser':
        reason = `Down ${Math.abs(stock.changePercent).toFixed(2)}% on selling pressure`;
        break;
      case 'volume':
        reason = `High volume of ${stock.volume.toLocaleString()} shares traded`;
        break;
      case 'breakout':
        reason = `Breakout with ${stock.changePercent.toFixed(2)}% gain on volume`;
        break;
    }
    
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.ltp,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      marketCap: stock.marketCap || 0,
      reason,
      category,
      timestamp: new Date()
    };
  }

  // Sector Analysis
  public async getSectorAnalysis(): Promise<SectorAnalysis[]> {
    const stocks = this.generateMockStockData();
    const sectorMap = new Map<string, NEPSEStock[]>();
    
    // Group stocks by sector
    stocks.forEach(stock => {
      if (!sectorMap.has(stock.sector)) {
        sectorMap.set(stock.sector, []);
      }
      sectorMap.get(stock.sector)!.push(stock);
    });
    
    const sectorAnalyses: SectorAnalysis[] = [];
    
    sectorMap.forEach((sectorStocks, sector) => {
      const analysis = this.analyzeSector(sector, sectorStocks);
      sectorAnalyses.push(analysis);
      this.sectorAnalysis.set(sector, analysis);
    });
    
    return sectorAnalyses.sort((a, b) => b.performance.day - a.performance.day);
  }

  private analyzeSector(sector: string, stocks: NEPSEStock[]): SectorAnalysis {
    const totalMarketCap = stocks.reduce((sum, s) => sum + (s.marketCap || 0), 0);
    const avgChange = stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length;
    const avgPE = stocks.filter(s => s.pe).reduce((sum, s) => sum + (Number(s.pe) || 0), 0) / stocks.filter(s => s.pe).length;
    const avgPB = stocks.filter(s => s.pb).reduce((sum, s) => sum + (Number(s.pb) || 0), 0) / stocks.filter(s => s.pb).length;
    
    const topStocks = stocks
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5)
      .map(s => ({
        symbol: s.symbol,
        change: s.changePercent,
        volume: s.volume
      }));
    
    let momentum: SectorAnalysis['momentum'] = 'neutral';
    if (avgChange > 3) momentum = 'strong_bullish';
    else if (avgChange > 1) momentum = 'bullish';
    else if (avgChange < -3) momentum = 'strong_bearish';
    else if (avgChange < -1) momentum = 'bearish';
    
    return {
      sector,
      performance: {
        day: avgChange,
        week: avgChange * 5 + (Math.random() - 0.5) * 2, // Mock data
        month: avgChange * 20 + (Math.random() - 0.5) * 5,
        quarter: avgChange * 60 + (Math.random() - 0.5) * 10,
        year: avgChange * 200 + (Math.random() - 0.5) * 20
      },
      topStocks,
      marketCap: totalMarketCap,
      avgPE: avgPE || 0,
      avgPB: avgPB || 0,
      momentum,
      outlook: this.generateSectorOutlook(momentum, avgPE, avgPB)
    };
  }

  private generateSectorOutlook(momentum: SectorAnalysis['momentum'], avgPE: number, avgPB: number): string {
    if (momentum === 'strong_bullish') {
      return 'Strong bullish momentum with positive fundamentals. Consider accumulating quality stocks.';
    } else if (momentum === 'bullish') {
      return 'Positive momentum continues. Look for breakout opportunities.';
    } else if (momentum === 'strong_bearish') {
      return 'Significant selling pressure. Wait for stabilization before entry.';
    } else if (momentum === 'bearish') {
      return 'Weak performance. Monitor for potential reversal signals.';
    } else {
      return 'Consolidation phase. Look for individual stock opportunities.';
    }
  }

  // Screener
  public async screenStocks(filters: ScreenerFilter): Promise<NEPSEStock[]> {
    const stocks = this.generateMockStockData();
    
    return stocks.filter(stock => {
      // Market Cap filter
      if (filters.marketCap) {
        const marketCap = stock.marketCap || 0;
        if (filters.marketCap.min && marketCap < filters.marketCap.min) return false;
        if (filters.marketCap.max && marketCap > filters.marketCap.max) return false;
      }
      
      // Price filter
      if (filters.price) {
        if (filters.price.min && stock.ltp < filters.price.min) return false;
        if (filters.price.max && stock.ltp > filters.price.max) return false;
      }
      
      // Volume filter
      if (filters.volume) {
        if (filters.volume.min && stock.volume < filters.volume.min) return false;
        if (filters.volume.max && stock.volume > filters.volume.max) return false;
      }
      
      // Change filter
      if (filters.change) {
        if (filters.change.min && stock.changePercent < filters.change.min) return false;
        if (filters.change.max && stock.changePercent > filters.change.max) return false;
      }
      
      // PE filter
      if (filters.pe && stock.pe) {
        if (filters.pe.min && Number(stock.pe) < Number(filters.pe.min)) return false;
        if (filters.pe.max && Number(stock.pe) > filters.pe.max) return false;
      }
      
      // PB filter
      if (filters.pb && stock.pb) {
        if (filters.pb.min && Number(stock.pb) < filters.pb.min) return false;
        if (filters.pb.max && Number(stock.pb) > filters.pb.max) return false;
      }
      
      // Sector filter
      if (filters.sector && filters.sector.length > 0) {
        if (!filters.sector.includes(stock.sector)) return false;
      }
      
      return true;
    });
  }

  // Watchlist Alerts
  public createWatchlistAlert(alert: Omit<WatchlistAlert, 'id' | 'createdAt' | 'notificationSent'>): string {
    const id = `alert_${Date.now()}_${Math.random()}`;
    const newAlert: WatchlistAlert = {
      ...alert,
      id,
      createdAt: new Date(),
      notificationSent: false
    };
    
    const symbol = alert.symbol.toUpperCase();
    if (!this.watchlistAlerts.has(symbol)) {
      this.watchlistAlerts.set(symbol, []);
    }
    
    this.watchlistAlerts.get(symbol)!.push(newAlert);
    this.saveWatchlistAlertsToStorage();
    this.notifySubscribers('watchlist_alert_created', newAlert);
    
    return id;
  }

  public getWatchlistAlerts(symbol?: string): WatchlistAlert[] {
    if (symbol) {
      return this.watchlistAlerts.get(symbol.toUpperCase()) || [];
    }
    
    const allAlerts: WatchlistAlert[] = [];
    this.watchlistAlerts.forEach(alerts => allAlerts.push(...alerts));
    return allAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public deleteWatchlistAlert(symbol: string, alertId: string): boolean {
    const alerts = this.watchlistAlerts.get(symbol.toUpperCase());
    if (!alerts) return false;
    
    const index = alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;
    
    alerts.splice(index, 1);
    this.saveWatchlistAlertsToStorage();
    this.notifySubscribers('watchlist_alert_deleted', { symbol, alertId });
    
    return true;
  }

  // Default Scan Criteria
  private initializeDefaultScans(): void {
    const defaultScans: Omit<ScanCriteria, 'id' | 'createdAt'>[] = [
      {
        name: 'High Volume Breakouts',
        description: 'Stocks with high volume and positive price movement',
        category: 'technical',
        conditions: [
          { field: 'volume', operator: 'gt', value: 100000 },
          { field: 'changePercent', operator: 'gt', value: 3, logicalOperator: 'AND' }
        ],
        isActive: true
      },
      {
        name: 'Undervalued Stocks',
        description: 'Stocks with low PE and PB ratios',
        category: 'fundamental',
        conditions: [
          { field: 'pe', operator: 'lt', value: 15 },
          { field: 'pb', operator: 'lt', value: 2, logicalOperator: 'AND' }
        ],
        isActive: true
      },
      {
        name: 'Momentum Stocks',
        description: 'Stocks with strong positive momentum',
        category: 'technical',
        conditions: [
          { field: 'changePercent', operator: 'between', value: [2, 10] }
        ],
        isActive: true
      },
      {
        name: 'Large Cap Gainers',
        description: 'Large cap stocks with positive performance',
        category: 'price',
        conditions: [
          { field: 'marketCap', operator: 'gt', value: 10000000000 },
          { field: 'changePercent', operator: 'gt', value: 1, logicalOperator: 'AND' }
        ],
        isActive: true
      },
      {
        name: 'High Dividend Yield',
        description: 'Stocks with attractive dividend yields',
        category: 'fundamental',
        conditions: [
          { field: 'dividend', operator: 'gt', value: 5 }
        ],
        isActive: true
      }
    ];
    
    defaultScans.forEach(scan => {
      if (!Array.from(this.scanCriteria.values()).some(s => s.name === scan.name)) {
        this.createScanCriteria(scan);
      }
    });
  }

  // Mock Data Generation
  private generateMockStockData(): NEPSEStock[] {
    const sectors = ['Banking', 'Insurance', 'Hydropower', 'Manufacturing', 'Hotels', 'Finance', 'Development Bank', 'Microfinance'];
    const stocks: NEPSEStock[] = [];
    
    for (let i = 0; i < 200; i++) {
      const symbol = `STOCK${i.toString().padStart(3, '0')}`;
      const sector = sectors[Math.floor(Math.random() * sectors.length)];
      const basePrice = 100 + Math.random() * 900;
      const change = (Math.random() - 0.5) * 20;
      const changePercent = (change / basePrice) * 100;
      
      stocks.push({
        symbol,
        name: `${symbol} Limited`,
        ltp: Math.round((basePrice + change) * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 200000) + 1000,
        turnover: Math.floor(Math.random() * 50000000) + 100000,
        high: Math.round((basePrice + change + Math.random() * 10) * 100) / 100,
        low: Math.round((basePrice + change - Math.random() * 10) * 100) / 100,
        open: Math.round(basePrice * 100) / 100,
        previousClose: Math.round(basePrice * 100) / 100,
        marketCap: Math.floor(Math.random() * 50000000000) + 1000000000,
        pe: Math.round((10 + Math.random() * 30) * 100) / 100,
        pb: Math.round((0.5 + Math.random() * 3) * 100) / 100,
        eps: Math.round((5 + Math.random() * 50) * 100) / 100,
        bookValue: Math.round((50 + Math.random() * 200) * 100) / 100,
        dividend: Math.round((Math.random() * 15) * 100) / 100,
        sector,
        lastUpdated: new Date().toISOString(),
        status: 'active',
        totalTrades: 0
      });
    }
    
    return stocks;
  }

  // Periodic Scanning
  private startPeriodicScanning(): void {
    // Run scans every 5 minutes
    this.scanInterval = setInterval(() => {
      this.runAllActiveScans();
      this.scanForOpportunities();
      this.getMarketMovers();
    }, 5 * 60 * 1000);
  }

  public stopPeriodicScanning(): void {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
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
      const [criteriaData, alertsData] = await Promise.all([
        AsyncStorage.getItem('scan_criteria'),
        AsyncStorage.getItem('watchlist_alerts')
      ]);

      if (criteriaData) {
        const criteria = JSON.parse(criteriaData);
        criteria.forEach((c: any) => {
          c.createdAt = new Date(c.createdAt);
          if (c.lastRun) c.lastRun = new Date(c.lastRun);
          this.scanCriteria.set(c.id, c);
        });
      }

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        Object.entries(alerts).forEach(([symbol, alts]: [string, any]) => {
          this.watchlistAlerts.set(symbol, alts.map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
            triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
          })));
        });
      }
    } catch (error) {
      console.error('Failed to load scanner data:', error);
    }
  }

  private async saveScanCriteriaToStorage(): Promise<void> {
    try {
      const criteria = Array.from(this.scanCriteria.values());
      await AsyncStorage.setItem('scan_criteria', JSON.stringify(criteria));
    } catch (error) {
      console.error('Failed to save scan criteria:', error);
    }
  }

  private async saveWatchlistAlertsToStorage(): Promise<void> {
    try {
      const alerts: { [key: string]: any } = {};
      this.watchlistAlerts.forEach((value, key) => {
        alerts[key] = value;
      });
      await AsyncStorage.setItem('watchlist_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save watchlist alerts:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.stopPeriodicScanning();
    this.subscribers.clear();
    this.scanCriteria.clear();
    this.scanResults.clear();
    this.opportunities.clear();
    this.watchlistAlerts.clear();
    this.marketMovers = [];
    this.sectorAnalysis.clear();
  }
}

export default MarketScannerService;
export type {
  ScanCriteria,
  ScanCondition,
  ScanResult,
  MarketOpportunity,
  ScreenerFilter,
  WatchlistAlert,
  TechnicalPattern,
  MarketMover,
  SectorAnalysis
};