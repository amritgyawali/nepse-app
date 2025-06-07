import AsyncStorage from '@react-native-async-storage/async-storage';
import { NEPSEStock } from './NEPSEDataService';

interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalInvested: number;
  currentValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  sector: string;
  purchaseDate: Date;
  lastUpdated: Date;
  transactions: Transaction[];
}

interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'dividend' | 'bonus' | 'right';
  symbol: string;
  quantity: number;
  price: number;
  amount: number;
  fees: number;
  netAmount: number;
  date: Date;
  notes?: string;
}

interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  realizedGainLoss: number;
  dividendReceived: number;
  totalHoldings: number;
  diversification: SectorAllocation[];
  topPerformers: PortfolioHolding[];
  topLosers: PortfolioHolding[];
  riskMetrics: PortfolioRiskMetrics;
}

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface PortfolioRiskMetrics {
  beta: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  var: number; // Value at Risk
  diversificationRatio: number;
  concentrationRisk: number;
}

interface PortfolioPerformance {
  period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
  returns: number;
  benchmark: number;
  alpha: number;
  beta: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}

interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface PortfolioAlert {
  id: string;
  type: 'target_reached' | 'stop_loss' | 'rebalance' | 'dividend' | 'earnings';
  symbol?: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  acknowledged: boolean;
}

class PortfolioService {
  private static instance: PortfolioService;
  private holdings: Map<string, PortfolioHolding> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private watchlists: Map<string, Watchlist> = new Map();
  private alerts: Map<string, PortfolioAlert> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private performanceHistory: Map<string, any[]> = new Map();

  private constructor() {
    this.loadStoredData();
  }

  public static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  // Subscribe to portfolio updates
  public subscribe(event: string, callback: (data: any) => void): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.subscribers.set(id, callback);
    return id;
  }

  public unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  // Transaction Management
  public async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const id = `txn_${Date.now()}_${Math.random()}`;
    const newTransaction: Transaction = {
      id,
      ...transaction
    };

    this.transactions.set(id, newTransaction);
    await this.updateHoldingFromTransaction(newTransaction);
    await this.saveTransactionsToStorage();
    
    this.notifySubscribers('transaction_added', newTransaction);
    return id;
  }

  public async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error('Transaction not found');

    const oldTransaction = { ...transaction };
    Object.assign(transaction, updates);

    // Revert old transaction effect and apply new one
    await this.revertTransactionEffect(oldTransaction);
    await this.updateHoldingFromTransaction(transaction);
    
    await this.saveTransactionsToStorage();
    this.notifySubscribers('transaction_updated', transaction);
  }

  public async deleteTransaction(id: string): Promise<void> {
    const transaction = this.transactions.get(id);
    if (!transaction) throw new Error('Transaction not found');

    await this.revertTransactionEffect(transaction);
    this.transactions.delete(id);
    
    await this.saveTransactionsToStorage();
    this.notifySubscribers('transaction_deleted', { id });
  }

  public getTransactions(symbol?: string): Transaction[] {
    const allTransactions = Array.from(this.transactions.values());
    const filtered = symbol ? allTransactions.filter(t => t.symbol === symbol) : allTransactions;
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  // Holdings Management
  private async updateHoldingFromTransaction(transaction: Transaction): Promise<void> {
    const { symbol, type, quantity, price, amount, date } = transaction;
    
    let holding = this.holdings.get(symbol);
    
    if (!holding && (type === 'buy' || type === 'bonus' || type === 'right')) {
      // Create new holding
      holding = {
        id: `holding_${symbol}_${Date.now()}`,
        symbol,
        name: symbol, // Would be fetched from stock data
        quantity: 0,
        averagePrice: 0,
        currentPrice: price,
        totalInvested: 0,
        currentValue: 0,
        unrealizedGainLoss: 0,
        unrealizedGainLossPercent: 0,
        dayChange: 0,
        dayChangePercent: 0,
        sector: 'Unknown',
        purchaseDate: date,
        lastUpdated: new Date(),
        transactions: []
      };
      this.holdings.set(symbol, holding);
    }

    if (!holding) return;

    // Update holding based on transaction type
    switch (type) {
      case 'buy':
        const newTotalQuantity = holding.quantity + quantity;
        const newTotalInvested = holding.totalInvested + amount;
        holding.averagePrice = newTotalInvested / newTotalQuantity;
        holding.quantity = newTotalQuantity;
        holding.totalInvested = newTotalInvested;
        break;

      case 'sell':
        holding.quantity -= quantity;
        const soldValue = quantity * holding.averagePrice;
        holding.totalInvested -= soldValue;
        
        // If all shares sold, remove holding
        if (holding.quantity <= 0) {
          this.holdings.delete(symbol);
          await this.saveHoldingsToStorage();
          return;
        }
        break;

      case 'bonus':
      case 'right':
        holding.quantity += quantity;
        // For bonus/rights, average price adjusts
        if (type === 'bonus') {
          holding.averagePrice = holding.totalInvested / holding.quantity;
        } else {
          holding.totalInvested += amount;
          holding.averagePrice = holding.totalInvested / holding.quantity;
        }
        break;

      case 'dividend':
        // Dividend doesn't affect quantity or average price
        break;
    }

    holding.transactions.push(transaction);
    holding.lastUpdated = new Date();
    
    await this.updateHoldingMarketData(holding);
    await this.saveHoldingsToStorage();
  }

  private async revertTransactionEffect(transaction: Transaction): Promise<void> {
    const { symbol, type, quantity, amount } = transaction;
    const holding = this.holdings.get(symbol);
    
    if (!holding) return;

    // Remove transaction from holding
    holding.transactions = holding.transactions.filter(t => t.id !== transaction.id);

    // Recalculate holding from remaining transactions
    await this.recalculateHolding(symbol);
  }

  private async recalculateHolding(symbol: string): Promise<void> {
    const transactions = this.getTransactions(symbol);
    
    if (transactions.length === 0) {
      this.holdings.delete(symbol);
      return;
    }

    let quantity = 0;
    let totalInvested = 0;
    const firstBuyTransaction = transactions.find(t => t.type === 'buy');
    
    if (!firstBuyTransaction) return;

    const holding: PortfolioHolding = {
      id: `holding_${symbol}_${Date.now()}`,
      symbol,
      name: symbol,
      quantity: 0,
      averagePrice: 0,
      currentPrice: 0,
      totalInvested: 0,
      currentValue: 0,
      unrealizedGainLoss: 0,
      unrealizedGainLossPercent: 0,
      dayChange: 0,
      dayChangePercent: 0,
      sector: 'Unknown',
      purchaseDate: firstBuyTransaction.date,
      lastUpdated: new Date(),
      transactions: transactions
    };

    // Recalculate from all transactions
    for (const transaction of transactions.reverse()) {
      switch (transaction.type) {
        case 'buy':
          quantity += transaction.quantity;
          totalInvested += transaction.amount;
          break;
        case 'sell':
          quantity -= transaction.quantity;
          totalInvested -= (transaction.quantity * (totalInvested / quantity));
          break;
        case 'bonus':
        case 'right':
          quantity += transaction.quantity;
          if (transaction.type === 'right') {
            totalInvested += transaction.amount;
          }
          break;
      }
    }

    holding.quantity = quantity;
    holding.totalInvested = totalInvested;
    holding.averagePrice = totalInvested / quantity;

    if (quantity > 0) {
      this.holdings.set(symbol, holding);
      await this.updateHoldingMarketData(holding);
    } else {
      this.holdings.delete(symbol);
    }
  }

  // Update holding with current market data
  public async updateHoldingMarketData(holding: PortfolioHolding, stockData?: NEPSEStock): Promise<void> {
    if (stockData) {
      holding.currentPrice = stockData.ltp;
      holding.name = stockData.name;
      holding.sector = stockData.sector;
      holding.dayChange = stockData.change;
      holding.dayChangePercent = stockData.changePercent;
    }

    holding.currentValue = holding.quantity * holding.currentPrice;
    holding.unrealizedGainLoss = holding.currentValue - holding.totalInvested;
    holding.unrealizedGainLossPercent = (holding.unrealizedGainLoss / holding.totalInvested) * 100;
    holding.lastUpdated = new Date();

    this.notifySubscribers('holding_updated', holding);
  }

  // Update all holdings with market data
  public async updateAllHoldings(stocksData: NEPSEStock[]): Promise<void> {
    const stockMap = new Map(stocksData.map(stock => [stock.symbol, stock]));
    
    for (const holding of this.holdings.values()) {
      const stockData = stockMap.get(holding.symbol);
      if (stockData) {
        await this.updateHoldingMarketData(holding, stockData);
      }
    }

    await this.saveHoldingsToStorage();
    this.notifySubscribers('portfolio_updated', this.getPortfolioSummary());
  }

  // Portfolio Analytics
  public getPortfolioSummary(): PortfolioSummary {
    const holdings = Array.from(this.holdings.values());
    
    const totalInvested = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
    const currentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalGainLoss = currentValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    const dayChange = holdings.reduce((sum, h) => sum + (h.quantity * h.dayChange), 0);
    const dayChangePercent = currentValue > 0 ? (dayChange / (currentValue - dayChange)) * 100 : 0;

    // Calculate realized gains from sell transactions
    const realizedGainLoss = this.calculateRealizedGainLoss();
    const dividendReceived = this.calculateDividendReceived();

    // Sector diversification
    const diversification = this.calculateSectorAllocation(holdings);

    // Top performers and losers
    const sortedByPerformance = holdings.sort((a, b) => b.unrealizedGainLossPercent - a.unrealizedGainLossPercent);
    const topPerformers = sortedByPerformance.slice(0, 3);
    const topLosers = sortedByPerformance.slice(-3).reverse();

    // Risk metrics
    const riskMetrics = this.calculateRiskMetrics(holdings);

    return {
      totalInvested,
      currentValue,
      totalGainLoss,
      totalGainLossPercent,
      dayChange,
      dayChangePercent,
      realizedGainLoss,
      dividendReceived,
      totalHoldings: holdings.length,
      diversification,
      topPerformers,
      topLosers,
      riskMetrics
    };
  }

  private calculateSectorAllocation(holdings: PortfolioHolding[]): SectorAllocation[] {
    const sectorMap = new Map<string, SectorAllocation>();
    
    holdings.forEach(holding => {
      const sector = holding.sector || 'Unknown';
      const existing = sectorMap.get(sector) || {
        sector,
        value: 0,
        percentage: 0,
        gainLoss: 0,
        gainLossPercent: 0
      };
      
      existing.value += holding.currentValue;
      existing.gainLoss += holding.unrealizedGainLoss;
      sectorMap.set(sector, existing);
    });

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const allocations = Array.from(sectorMap.values());
    
    allocations.forEach(allocation => {
      allocation.percentage = totalValue > 0 ? (allocation.value / totalValue) * 100 : 0;
      allocation.gainLossPercent = (allocation.value - allocation.gainLoss) > 0 ? 
        (allocation.gainLoss / (allocation.value - allocation.gainLoss)) * 100 : 0;
    });

    return allocations.sort((a, b) => b.value - a.value);
  }

  private calculateRiskMetrics(holdings: PortfolioHolding[]): PortfolioRiskMetrics {
    if (holdings.length === 0) {
      return {
        beta: 1.0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        var: 0,
        diversificationRatio: 0,
        concentrationRisk: 0
      };
    }

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const weights = holdings.map(h => h.currentValue / totalValue);
    
    // Portfolio beta (weighted average)
    const beta = 1.0; // Default market beta since individual stock betas are not tracked
    
    // Concentration risk (Herfindahl index)
    const concentrationRisk = weights.reduce((sum, w) => sum + (w * w), 0);
    
    // Diversification ratio (simplified)
    const diversificationRatio = 1 - concentrationRisk;
    
    // Simplified volatility calculation
    const returns = holdings.map(h => h.unrealizedGainLossPercent / 100);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized
    
    // Sharpe ratio (simplified, assuming risk-free rate of 5%)
    const riskFreeRate = 0.05;
    const excessReturn = avgReturn - riskFreeRate;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;
    
    // Max drawdown (simplified)
    const maxDrawdown = Math.min(...returns);
    
    // VaR (5% confidence level)
    const sortedReturns = returns.sort((a, b) => a - b);
    const varIndex = Math.floor(returns.length * 0.05);
    const var95 = Math.abs(sortedReturns[varIndex] || 0);

    return {
      beta,
      volatility,
      sharpeRatio,
      maxDrawdown: Math.abs(maxDrawdown),
      var: var95,
      diversificationRatio,
      concentrationRisk
    };
  }

  private calculateRealizedGainLoss(): number {
    const sellTransactions = Array.from(this.transactions.values())
      .filter(t => t.type === 'sell');
    
    let realizedGainLoss = 0;
    
    sellTransactions.forEach(sellTxn => {
      // Find corresponding buy transactions for this symbol
      const buyTransactions = Array.from(this.transactions.values())
        .filter(t => t.type === 'buy' && t.symbol === sellTxn.symbol && t.date <= sellTxn.date)
        .sort((a, b) => a.date.getTime() - b.date.getTime()); // FIFO
      
      if (buyTransactions.length > 0) {
        const avgBuyPrice = buyTransactions.reduce((sum, t) => sum + t.price, 0) / buyTransactions.length;
        realizedGainLoss += (sellTxn.price - avgBuyPrice) * sellTxn.quantity;
      }
    });
    
    return realizedGainLoss;
  }

  private calculateDividendReceived(): number {
    return Array.from(this.transactions.values())
      .filter(t => t.type === 'dividend')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Performance Analysis
  public calculatePerformance(period: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'): PortfolioPerformance {
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1D':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '1W':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date(2020, 0, 1); // Arbitrary start date
        break;
    }

    // Get historical performance data
    const performanceData = this.getPerformanceHistory(startDate, endDate);
    
    // Calculate metrics
    const returns = this.calculateReturns(performanceData);
    const benchmark = this.calculateBenchmarkReturns(period); // NEPSE index returns
    const alpha = returns - benchmark;
    const beta = this.getPortfolioSummary().riskMetrics.beta;
    const volatility = this.calculateVolatility(performanceData);
    const sharpeRatio = this.getPortfolioSummary().riskMetrics.sharpeRatio;
    const maxDrawdown = this.calculateMaxDrawdown(performanceData);
    const winRate = this.calculateWinRate(performanceData);
    const profitFactor = this.calculateProfitFactor(performanceData);

    return {
      period,
      returns,
      benchmark,
      alpha,
      beta,
      volatility,
      sharpeRatio,
      maxDrawdown,
      winRate,
      profitFactor
    };
  }

  private getPerformanceHistory(startDate: Date, endDate: Date): any[] {
    // In a real implementation, this would return historical portfolio values
    // For now, return mock data
    const data = [];
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const value = 1000000 + Math.random() * 100000 - 50000; // Mock portfolio value
      data.push({ date, value });
    }
    
    return data;
  }

  private calculateReturns(data: any[]): number {
    if (data.length < 2) return 0;
    const startValue = data[0].value;
    const endValue = data[data.length - 1].value;
    return ((endValue - startValue) / startValue) * 100;
  }

  private calculateBenchmarkReturns(period: string): number {
    // Mock benchmark returns (NEPSE index)
    const benchmarkReturns: { [key: string]: number } = {
      '1D': 0.5,
      '1W': 2.1,
      '1M': 8.5,
      '3M': 15.2,
      '6M': 22.8,
      '1Y': 35.6,
      'ALL': 45.3
    };
    
    return benchmarkReturns[period] || 0;
  }

  private calculateVolatility(data: any[]): number {
    if (data.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < data.length; i++) {
      const dailyReturn = (data[i].value - data[i-1].value) / data[i-1].value;
      returns.push(dailyReturn);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized percentage
  }

  private calculateMaxDrawdown(data: any[]): number {
    let maxDrawdown = 0;
    let peak = data[0]?.value || 0;
    
    for (const point of data) {
      if (point.value > peak) {
        peak = point.value;
      } else {
        const drawdown = (peak - point.value) / peak;
        maxDrawdown = Math.max(maxDrawdown, drawdown);
      }
    }
    
    return maxDrawdown * 100;
  }

  private calculateWinRate(data: any[]): number {
    if (data.length < 2) return 0;
    
    let wins = 0;
    let total = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i].value > data[i-1].value) wins++;
      total++;
    }
    
    return total > 0 ? (wins / total) * 100 : 0;
  }

  private calculateProfitFactor(data: any[]): number {
    if (data.length < 2) return 0;
    
    let profits = 0;
    let losses = 0;
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].value - data[i-1].value;
      if (change > 0) {
        profits += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    return losses > 0 ? profits / losses : 0;
  }

  // Watchlist Management
  public async createWatchlist(name: string, symbols: string[] = []): Promise<string> {
    const id = `watchlist_${Date.now()}_${Math.random()}`;
    const watchlist: Watchlist = {
      id,
      name,
      symbols,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.watchlists.set(id, watchlist);
    await this.saveWatchlistsToStorage();
    
    this.notifySubscribers('watchlist_created', watchlist);
    return id;
  }

  public async updateWatchlist(id: string, updates: Partial<Watchlist>): Promise<void> {
    const watchlist = this.watchlists.get(id);
    if (!watchlist) throw new Error('Watchlist not found');
    
    Object.assign(watchlist, updates, { updatedAt: new Date() });
    await this.saveWatchlistsToStorage();
    
    this.notifySubscribers('watchlist_updated', watchlist);
  }

  public async deleteWatchlist(id: string): Promise<void> {
    this.watchlists.delete(id);
    await this.saveWatchlistsToStorage();
    
    this.notifySubscribers('watchlist_deleted', { id });
  }

  public async addToWatchlist(watchlistId: string, symbol: string): Promise<void> {
    const watchlist = this.watchlists.get(watchlistId);
    if (!watchlist) throw new Error('Watchlist not found');
    
    if (!watchlist.symbols.includes(symbol)) {
      watchlist.symbols.push(symbol);
      watchlist.updatedAt = new Date();
      await this.saveWatchlistsToStorage();
      
      this.notifySubscribers('symbol_added_to_watchlist', { watchlistId, symbol });
    }
  }

  public async removeFromWatchlist(watchlistId: string, symbol: string): Promise<void> {
    const watchlist = this.watchlists.get(watchlistId);
    if (!watchlist) throw new Error('Watchlist not found');
    
    watchlist.symbols = watchlist.symbols.filter(s => s !== symbol);
    watchlist.updatedAt = new Date();
    await this.saveWatchlistsToStorage();
    
    this.notifySubscribers('symbol_removed_from_watchlist', { watchlistId, symbol });
  }

  public getWatchlists(): Watchlist[] {
    return Array.from(this.watchlists.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  public getWatchlist(id: string): Watchlist | undefined {
    return this.watchlists.get(id);
  }

  // Alert Management
  public async createAlert(alert: Omit<PortfolioAlert, 'id' | 'createdAt' | 'acknowledged'>): Promise<string> {
    const id = `alert_${Date.now()}_${Math.random()}`;
    const newAlert: PortfolioAlert = {
      id,
      createdAt: new Date(),
      acknowledged: false,
      ...alert
    };
    
    this.alerts.set(id, newAlert);
    await this.saveAlertsToStorage();
    
    this.notifySubscribers('alert_created', newAlert);
    return id;
  }

  public async acknowledgeAlert(id: string): Promise<void> {
    const alert = this.alerts.get(id);
    if (alert) {
      alert.acknowledged = true;
      await this.saveAlertsToStorage();
      
      this.notifySubscribers('alert_acknowledged', alert);
    }
  }

  public getAlerts(unacknowledgedOnly: boolean = false): PortfolioAlert[] {
    const alerts = Array.from(this.alerts.values());
    const filtered = unacknowledgedOnly ? alerts.filter(a => !a.acknowledged) : alerts;
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Data Access
  public getHoldings(): PortfolioHolding[] {
    return Array.from(this.holdings.values())
      .sort((a, b) => b.currentValue - a.currentValue);
  }

  public getHolding(symbol: string): PortfolioHolding | undefined {
    return this.holdings.get(symbol);
  }

  public hasHolding(symbol: string): boolean {
    return this.holdings.has(symbol);
  }

  // Utility methods
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

  // Storage methods
  private async loadStoredData(): Promise<void> {
    try {
      const [holdingsData, transactionsData, watchlistsData, alertsData] = await Promise.all([
        AsyncStorage.getItem('portfolio_holdings'),
        AsyncStorage.getItem('portfolio_transactions'),
        AsyncStorage.getItem('portfolio_watchlists'),
        AsyncStorage.getItem('portfolio_alerts')
      ]);

      if (holdingsData) {
        const holdings = JSON.parse(holdingsData);
        holdings.forEach((holding: any) => {
          holding.purchaseDate = new Date(holding.purchaseDate);
          holding.lastUpdated = new Date(holding.lastUpdated);
          holding.transactions.forEach((txn: any) => {
            txn.date = new Date(txn.date);
          });
          this.holdings.set(holding.symbol, holding);
        });
      }

      if (transactionsData) {
        const transactions = JSON.parse(transactionsData);
        transactions.forEach((txn: any) => {
          txn.date = new Date(txn.date);
          this.transactions.set(txn.id, txn);
        });
      }

      if (watchlistsData) {
        const watchlists = JSON.parse(watchlistsData);
        watchlists.forEach((watchlist: any) => {
          watchlist.createdAt = new Date(watchlist.createdAt);
          watchlist.updatedAt = new Date(watchlist.updatedAt);
          this.watchlists.set(watchlist.id, watchlist);
        });
      }

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        alerts.forEach((alert: any) => {
          alert.createdAt = new Date(alert.createdAt);
          this.alerts.set(alert.id, alert);
        });
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  }

  private async saveHoldingsToStorage(): Promise<void> {
    try {
      const holdings = Array.from(this.holdings.values());
      await AsyncStorage.setItem('portfolio_holdings', JSON.stringify(holdings));
    } catch (error) {
      console.error('Failed to save holdings:', error);
    }
  }

  private async saveTransactionsToStorage(): Promise<void> {
    try {
      const transactions = Array.from(this.transactions.values());
      await AsyncStorage.setItem('portfolio_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }

  private async saveWatchlistsToStorage(): Promise<void> {
    try {
      const watchlists = Array.from(this.watchlists.values());
      await AsyncStorage.setItem('portfolio_watchlists', JSON.stringify(watchlists));
    } catch (error) {
      console.error('Failed to save watchlists:', error);
    }
  }

  private async saveAlertsToStorage(): Promise<void> {
    try {
      const alerts = Array.from(this.alerts.values());
      await AsyncStorage.setItem('portfolio_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.subscribers.clear();
  }
}

export default PortfolioService;
export type {
  PortfolioHolding,
  Transaction,
  PortfolioSummary,
  SectorAllocation,
  PortfolioRiskMetrics,
  PortfolioPerformance,
  Watchlist,
  PortfolioAlert
};