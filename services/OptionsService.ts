import AsyncStorage from '@react-native-async-storage/async-storage';

interface OptionContract {
  symbol: string;
  underlying: string;
  strike: number;
  expiry: Date;
  type: 'call' | 'put';
  premium: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  intrinsicValue: number;
  timeValue: number;
  lastUpdated: Date;
}

interface OptionsChain {
  underlying: string;
  underlyingPrice: number;
  expiries: Date[];
  strikes: number[];
  calls: Map<string, OptionContract>; // key: strike_expiry
  puts: Map<string, OptionContract>;
  lastUpdated: Date;
}

interface OptionStrategy {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'volatile' | 'non_volatile';
  description: string;
  legs: OptionLeg[];
  maxProfit: number | 'unlimited';
  maxLoss: number | 'unlimited';
  breakeven: number[];
  netPremium: number;
  marginRequired: number;
  riskReward: number;
  probability: number;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  marketOutlook: string;
  timeDecay: 'positive' | 'negative' | 'neutral';
  volatility: 'positive' | 'negative' | 'neutral';
}

interface OptionLeg {
  action: 'buy' | 'sell';
  contract: OptionContract;
  quantity: number;
  premium: number;
}

interface OptionPosition {
  id: string;
  strategy: OptionStrategy;
  entryDate: Date;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  daysToExpiry: number;
  status: 'open' | 'closed' | 'expired';
  alerts: PositionAlert[];
}

interface PositionAlert {
  id: string;
  type: 'profit_target' | 'stop_loss' | 'time_decay' | 'volatility' | 'assignment_risk';
  condition: string;
  value: number;
  isTriggered: boolean;
  triggeredAt?: Date;
}

interface VolatilityData {
  symbol: string;
  historicalVolatility: {
    period: number;
    value: number;
  }[];
  impliedVolatility: {
    strike: number;
    expiry: Date;
    iv: number;
  }[];
  volatilitySkew: {
    strike: number;
    skew: number;
  }[];
  volatilitySmile: {
    moneyness: number;
    iv: number;
  }[];
  lastUpdated: Date;
}

interface OptionAnalysis {
  symbol: string;
  analysis: {
    recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    reasoning: string[];
    targetPrice: number;
    timeframe: string;
    riskLevel: 'low' | 'medium' | 'high';
    strategies: {
      strategy: string;
      suitability: number;
      reason: string;
    }[];
    greeks: {
      totalDelta: number;
      totalGamma: number;
      totalTheta: number;
      totalVega: number;
      interpretation: string;
    };
    volatility: {
      current: number;
      historical: number;
      percentile: number;
      outlook: 'increasing' | 'decreasing' | 'stable';
    };
  };
  timestamp: Date;
}

interface OptionEducation {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  title: string;
  content: string;
  examples: {
    scenario: string;
    explanation: string;
    calculation?: string;
  }[];
  keyPoints: string[];
  risks: string[];
  relatedTopics: string[];
}

class OptionsService {
  private static instance: OptionsService;
  private optionsChains: Map<string, OptionsChain> = new Map();
  private strategies: Map<string, OptionStrategy> = new Map();
  private positions: Map<string, OptionPosition> = new Map();
  private volatilityData: Map<string, VolatilityData> = new Map();
  private educationContent: Map<string, OptionEducation> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private updateInterval: NodeJS.Timeout | number | null = null;

  private constructor() {
    this.loadStoredData();
    this.initializeStrategies();
    this.initializeEducationContent();
    this.startRealTimeUpdates();
  }

  public static getInstance(): OptionsService {
    if (!OptionsService.instance) {
      OptionsService.instance = new OptionsService();
    }
    return OptionsService.instance;
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

  // Options Chain Management
  public async getOptionsChain(underlying: string, expiry?: Date): Promise<OptionsChain> {
    const key = underlying.toUpperCase();
    
    if (!this.optionsChains.has(key)) {
      const chain = await this.fetchOptionsChain(underlying);
      this.optionsChains.set(key, chain);
    }
    
    const chain = this.optionsChains.get(key)!;
    
    if (expiry) {
      // Filter by specific expiry
      const filteredCalls = new Map<string, OptionContract>();
      const filteredPuts = new Map<string, OptionContract>();
      
      chain.calls.forEach((contract, key) => {
        if (contract.expiry.getTime() === expiry.getTime()) {
          filteredCalls.set(key, contract);
        }
      });
      
      chain.puts.forEach((contract, key) => {
        if (contract.expiry.getTime() === expiry.getTime()) {
          filteredPuts.set(key, contract);
        }
      });
      
      return {
        ...chain,
        calls: filteredCalls,
        puts: filteredPuts,
        expiries: [expiry]
      };
    }
    
    return chain;
  }

  private async fetchOptionsChain(underlying: string): Promise<OptionsChain> {
    // In a real implementation, this would fetch from options data provider
    return this.generateMockOptionsChain(underlying);
  }

  private generateMockOptionsChain(underlying: string): OptionsChain {
    const underlyingPrice = 100 + Math.random() * 400; // Mock underlying price
    const expiries = this.generateExpiries();
    const strikes = this.generateStrikes(underlyingPrice);
    
    const calls = new Map<string, OptionContract>();
    const puts = new Map<string, OptionContract>();
    
    expiries.forEach(expiry => {
      const daysToExpiry = Math.max(1, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      
      strikes.forEach(strike => {
        const key = `${strike}_${expiry.getTime()}`;
        
        // Generate call option
        const callContract = this.generateOptionContract(
          underlying, strike, expiry, 'call', underlyingPrice, daysToExpiry
        );
        calls.set(key, callContract);
        
        // Generate put option
        const putContract = this.generateOptionContract(
          underlying, strike, expiry, 'put', underlyingPrice, daysToExpiry
        );
        puts.set(key, putContract);
      });
    });
    
    return {
      underlying: underlying.toUpperCase(),
      underlyingPrice,
      expiries,
      strikes,
      calls,
      puts,
      lastUpdated: new Date()
    };
  }

  private generateExpiries(): Date[] {
    const expiries: Date[] = [];
    const now = new Date();
    
    // Weekly expiries for next 4 weeks
    for (let i = 1; i <= 4; i++) {
      const expiry = new Date(now);
      expiry.setDate(now.getDate() + (i * 7));
      expiries.push(expiry);
    }
    
    // Monthly expiries for next 6 months
    for (let i = 1; i <= 6; i++) {
      const expiry = new Date(now);
      expiry.setMonth(now.getMonth() + i);
      expiry.setDate(15); // 15th of each month
      expiries.push(expiry);
    }
    
    return expiries;
  }

  private generateStrikes(underlyingPrice: number): number[] {
    const strikes: number[] = [];
    const baseStrike = Math.round(underlyingPrice / 10) * 10; // Round to nearest 10
    
    // Generate strikes from 20% below to 20% above current price
    for (let i = -10; i <= 10; i++) {
      const strike = baseStrike + (i * 10);
      if (strike > 0) {
        strikes.push(strike);
      }
    }
    
    return strikes.sort((a, b) => a - b);
  }

  private generateOptionContract(
    underlying: string,
    strike: number,
    expiry: Date,
    type: 'call' | 'put',
    underlyingPrice: number,
    daysToExpiry: number
  ): OptionContract {
    const symbol = `${underlying}${expiry.getFullYear()}${(expiry.getMonth() + 1).toString().padStart(2, '0')}${expiry.getDate().toString().padStart(2, '0')}${type.toUpperCase()}${strike}`;
    
    // Calculate intrinsic value
    const intrinsicValue = type === 'call' 
      ? Math.max(0, underlyingPrice - strike)
      : Math.max(0, strike - underlyingPrice);
    
    // Mock time value and premium calculation
    const timeValue = Math.max(0.1, (daysToExpiry / 365) * strike * 0.1 * Math.random());
    const premium = intrinsicValue + timeValue;
    
    // Mock Greeks calculation
    const delta = this.calculateDelta(type, underlyingPrice, strike, daysToExpiry);
    const gamma = this.calculateGamma(underlyingPrice, strike, daysToExpiry);
    const theta = this.calculateTheta(premium, daysToExpiry);
    const vega = this.calculateVega(underlyingPrice, strike, daysToExpiry);
    const rho = this.calculateRho(type, underlyingPrice, strike, daysToExpiry);
    
    const impliedVolatility = 0.15 + Math.random() * 0.3; // 15-45% IV
    const volume = Math.floor(Math.random() * 1000);
    const openInterest = Math.floor(Math.random() * 5000);
    
    return {
      symbol,
      underlying: underlying.toUpperCase(),
      strike,
      expiry,
      type,
      premium: Math.round(premium * 100) / 100,
      bid: Math.round((premium - 0.05) * 100) / 100,
      ask: Math.round((premium + 0.05) * 100) / 100,
      volume,
      openInterest,
      impliedVolatility: Math.round(impliedVolatility * 10000) / 100,
      delta: Math.round(delta * 1000) / 1000,
      gamma: Math.round(gamma * 10000) / 10000,
      theta: Math.round(theta * 1000) / 1000,
      vega: Math.round(vega * 1000) / 1000,
      rho: Math.round(rho * 1000) / 1000,
      intrinsicValue: Math.round(intrinsicValue * 100) / 100,
      timeValue: Math.round(timeValue * 100) / 100,
      lastUpdated: new Date()
    };
  }

  // Greeks Calculations (simplified)
  private calculateDelta(type: 'call' | 'put', spot: number, strike: number, daysToExpiry: number): number {
    const moneyness = spot / strike;
    const timeEffect = Math.sqrt(daysToExpiry / 365);
    
    if (type === 'call') {
      return Math.min(0.99, Math.max(0.01, 0.5 + (moneyness - 1) * 2 * timeEffect));
    } else {
      return Math.max(-0.99, Math.min(-0.01, -0.5 + (moneyness - 1) * 2 * timeEffect));
    }
  }

  private calculateGamma(spot: number, strike: number, daysToExpiry: number): number {
    const moneyness = Math.abs(spot - strike) / strike;
    const timeEffect = Math.sqrt(daysToExpiry / 365);
    return Math.max(0.001, (1 - moneyness) * timeEffect * 0.1);
  }

  private calculateTheta(premium: number, daysToExpiry: number): number {
    return -Math.max(0.001, premium / daysToExpiry * 0.1);
  }

  private calculateVega(spot: number, strike: number, daysToExpiry: number): number {
    const moneyness = Math.abs(spot - strike) / strike;
    const timeEffect = Math.sqrt(daysToExpiry / 365);
    return Math.max(0.001, (1 - moneyness) * timeEffect * strike * 0.01);
  }

  private calculateRho(type: 'call' | 'put', spot: number, strike: number, daysToExpiry: number): number {
    const timeEffect = daysToExpiry / 365;
    const base = strike * timeEffect * 0.01;
    return type === 'call' ? Math.max(0, base) : Math.min(0, -base);
  }

  // Strategy Management
  public getStrategies(type?: string, complexity?: string): OptionStrategy[] {
    let strategies = Array.from(this.strategies.values());
    
    if (type) {
      strategies = strategies.filter(s => s.type === type);
    }
    
    if (complexity) {
      strategies = strategies.filter(s => s.complexity === complexity);
    }
    
    return strategies;
  }

  public getStrategy(id: string): OptionStrategy | undefined {
    return this.strategies.get(id);
  }

  public analyzeStrategy(strategyId: string, underlying: string): {
    payoffDiagram: { price: number; profit: number }[];
    greeks: { delta: number; gamma: number; theta: number; vega: number };
    riskMetrics: { maxProfit: number; maxLoss: number; breakeven: number[]; probability: number };
  } {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }
    
    const chain = this.optionsChains.get(underlying.toUpperCase());
    if (!chain) {
      throw new Error('Options chain not found');
    }
    
    // Generate payoff diagram
    const payoffDiagram = this.calculatePayoffDiagram(strategy, chain.underlyingPrice);
    
    // Calculate total Greeks
    const greeks = this.calculateStrategyGreeks(strategy);
    
    // Risk metrics
    const riskMetrics = {
      maxProfit: typeof strategy.maxProfit === 'number' ? strategy.maxProfit : 999999,
      maxLoss: typeof strategy.maxLoss === 'number' ? strategy.maxLoss : 999999,
      breakeven: strategy.breakeven,
      probability: strategy.probability
    };
    
    return { payoffDiagram, greeks, riskMetrics };
  }

  private calculatePayoffDiagram(strategy: OptionStrategy, currentPrice: number): { price: number; profit: number }[] {
    const diagram: { price: number; profit: number }[] = [];
    const priceRange = currentPrice * 0.4; // ±40% of current price
    const step = priceRange / 50; // 50 points
    
    for (let price = currentPrice - priceRange; price <= currentPrice + priceRange; price += step) {
      let totalProfit = -strategy.netPremium; // Start with net premium paid/received
      
      strategy.legs.forEach(leg => {
        const contract = leg.contract;
        let legProfit = 0;
        
        if (contract.type === 'call') {
          const intrinsicValue = Math.max(0, price - contract.strike);
          legProfit = leg.action === 'buy' 
            ? intrinsicValue - leg.premium
            : leg.premium - intrinsicValue;
        } else {
          const intrinsicValue = Math.max(0, contract.strike - price);
          legProfit = leg.action === 'buy'
            ? intrinsicValue - leg.premium
            : leg.premium - intrinsicValue;
        }
        
        totalProfit += legProfit * leg.quantity;
      });
      
      diagram.push({
        price: Math.round(price * 100) / 100,
        profit: Math.round(totalProfit * 100) / 100
      });
    }
    
    return diagram;
  }

  private calculateStrategyGreeks(strategy: OptionStrategy): { delta: number; gamma: number; theta: number; vega: number } {
    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;
    
    strategy.legs.forEach(leg => {
      const multiplier = leg.action === 'buy' ? 1 : -1;
      const quantity = leg.quantity;
      
      totalDelta += leg.contract.delta * multiplier * quantity;
      totalGamma += leg.contract.gamma * multiplier * quantity;
      totalTheta += leg.contract.theta * multiplier * quantity;
      totalVega += leg.contract.vega * multiplier * quantity;
    });
    
    return {
      delta: Math.round(totalDelta * 1000) / 1000,
      gamma: Math.round(totalGamma * 10000) / 10000,
      theta: Math.round(totalTheta * 1000) / 1000,
      vega: Math.round(totalVega * 1000) / 1000
    };
  }

  // Position Management
  public createPosition(strategyId: string, legs: OptionLeg[]): string {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error('Strategy not found');
    }
    
    const id = `position_${Date.now()}_${Math.random()}`;
    const entryPrice = legs.reduce((sum, leg) => {
      return sum + (leg.action === 'buy' ? leg.premium : -leg.premium) * leg.quantity;
    }, 0);
    
    const position: OptionPosition = {
      id,
      strategy: {
        ...strategy,
        legs
      },
      entryDate: new Date(),
      entryPrice,
      currentPrice: entryPrice,
      pnl: 0,
      pnlPercent: 0,
      daysToExpiry: Math.min(...legs.map(leg => 
        Math.ceil((leg.contract.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      )),
      status: 'open',
      alerts: []
    };
    
    this.positions.set(id, position);
    this.savePositionsToStorage();
    this.notifySubscribers('position_created', position);
    
    return id;
  }

  public getPositions(status?: 'open' | 'closed' | 'expired'): OptionPosition[] {
    let positions = Array.from(this.positions.values());
    
    if (status) {
      positions = positions.filter(p => p.status === status);
    }
    
    return positions.sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime());
  }

  public closePosition(positionId: string, exitPrice?: number): boolean {
    const position = this.positions.get(positionId);
    if (!position || position.status !== 'open') {
      return false;
    }
    
    position.status = 'closed';
    if (exitPrice) {
      position.currentPrice = exitPrice;
      position.pnl = exitPrice - position.entryPrice;
      position.pnlPercent = (position.pnl / Math.abs(position.entryPrice)) * 100;
    }
    
    this.positions.set(positionId, position);
    this.savePositionsToStorage();
    this.notifySubscribers('position_closed', position);
    
    return true;
  }

  // Volatility Analysis
  public async getVolatilityData(symbol: string): Promise<VolatilityData> {
    const key = symbol.toUpperCase();
    
    if (!this.volatilityData.has(key)) {
      const data = this.generateMockVolatilityData(symbol);
      this.volatilityData.set(key, data);
    }
    
    return this.volatilityData.get(key)!;
  }

  private generateMockVolatilityData(symbol: string): VolatilityData {
    const historicalVolatility = [
      { period: 10, value: 15 + Math.random() * 20 },
      { period: 20, value: 18 + Math.random() * 25 },
      { period: 30, value: 20 + Math.random() * 30 },
      { period: 60, value: 22 + Math.random() * 28 },
      { period: 90, value: 25 + Math.random() * 25 }
    ];
    
    const chain = this.optionsChains.get(symbol.toUpperCase());
    const impliedVolatility: VolatilityData['impliedVolatility'] = [];
    const volatilitySkew: VolatilityData['volatilitySkew'] = [];
    const volatilitySmile: VolatilityData['volatilitySmile'] = [];
    
    if (chain) {
      // Generate IV data from options chain
      chain.calls.forEach(contract => {
        impliedVolatility.push({
          strike: contract.strike,
          expiry: contract.expiry,
          iv: contract.impliedVolatility
        });
        
        const moneyness = contract.strike / chain.underlyingPrice;
        volatilitySkew.push({
          strike: contract.strike,
          skew: contract.impliedVolatility - 25 // Base IV of 25%
        });
        
        volatilitySmile.push({
          moneyness,
          iv: contract.impliedVolatility
        });
      });
    }
    
    return {
      symbol: symbol.toUpperCase(),
      historicalVolatility,
      impliedVolatility,
      volatilitySkew,
      volatilitySmile,
      lastUpdated: new Date()
    };
  }

  // Option Analysis
  public async analyzeOption(symbol: string): Promise<OptionAnalysis> {
    const chain = await this.getOptionsChain(symbol);
    const volatilityData = await this.getVolatilityData(symbol);
    
    const analysis: OptionAnalysis = {
      symbol: symbol.toUpperCase(),
      analysis: {
        recommendation: this.generateRecommendation(chain, volatilityData),
        confidence: 70 + Math.random() * 25,
        reasoning: this.generateReasoning(chain, volatilityData),
        targetPrice: chain.underlyingPrice * (1 + (Math.random() - 0.5) * 0.2),
        timeframe: '1-3 months',
        riskLevel: this.assessRiskLevel(volatilityData),
        strategies: this.recommendStrategies(chain, volatilityData),
        greeks: this.analyzeGreeks(chain),
        volatility: this.analyzeVolatility(volatilityData)
      },
      timestamp: new Date()
    };
    
    this.notifySubscribers('option_analyzed', analysis);
    return analysis;
  }

  private generateRecommendation(chain: OptionsChain, volatilityData: VolatilityData): OptionAnalysis['analysis']['recommendation'] {
    const avgIV = volatilityData.impliedVolatility.reduce((sum, iv) => sum + iv.iv, 0) / volatilityData.impliedVolatility.length;
    const avgHV = volatilityData.historicalVolatility.reduce((sum, hv) => sum + hv.value, 0) / volatilityData.historicalVolatility.length;
    
    if (avgIV > avgHV * 1.2) {
      return 'sell'; // High IV, sell premium
    } else if (avgIV < avgHV * 0.8) {
      return 'buy'; // Low IV, buy options
    } else {
      return 'hold';
    }
  }

  private generateReasoning(chain: OptionsChain, volatilityData: VolatilityData): string[] {
    const reasoning: string[] = [];
    
    const avgIV = volatilityData.impliedVolatility.reduce((sum, iv) => sum + iv.iv, 0) / volatilityData.impliedVolatility.length;
    const avgHV = volatilityData.historicalVolatility.reduce((sum, hv) => sum + hv.value, 0) / volatilityData.historicalVolatility.length;
    
    if (avgIV > avgHV * 1.2) {
      reasoning.push('Implied volatility is significantly higher than historical volatility');
      reasoning.push('Options appear overpriced, consider selling strategies');
    } else if (avgIV < avgHV * 0.8) {
      reasoning.push('Implied volatility is below historical levels');
      reasoning.push('Options may be underpriced, consider buying strategies');
    }
    
    // Add more reasoning based on other factors
    const nearExpiry = chain.expiries.some(exp => 
      (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 30
    );
    
    if (nearExpiry) {
      reasoning.push('Near-term expiries available for short-term strategies');
    }
    
    return reasoning;
  }

  private assessRiskLevel(volatilityData: VolatilityData): 'low' | 'medium' | 'high' {
    const avgIV = volatilityData.impliedVolatility.reduce((sum, iv) => sum + iv.iv, 0) / volatilityData.impliedVolatility.length;
    
    if (avgIV < 20) return 'low';
    if (avgIV < 35) return 'medium';
    return 'high';
  }

  private recommendStrategies(chain: OptionsChain, volatilityData: VolatilityData): OptionAnalysis['analysis']['strategies'] {
    const strategies: OptionAnalysis['analysis']['strategies'] = [];
    
    const avgIV = volatilityData.impliedVolatility.reduce((sum, iv) => sum + iv.iv, 0) / volatilityData.impliedVolatility.length;
    
    if (avgIV > 30) {
      strategies.push({
        strategy: 'Iron Condor',
        suitability: 85,
        reason: 'High IV environment favors premium selling strategies'
      });
      
      strategies.push({
        strategy: 'Short Straddle',
        suitability: 75,
        reason: 'Profit from high premium and time decay'
      });
    } else {
      strategies.push({
        strategy: 'Long Straddle',
        suitability: 80,
        reason: 'Low IV provides cheap options for volatility plays'
      });
      
      strategies.push({
        strategy: 'Bull Call Spread',
        suitability: 70,
        reason: 'Cost-effective bullish strategy in low IV environment'
      });
    }
    
    return strategies;
  }

  private analyzeGreeks(chain: OptionsChain): OptionAnalysis['analysis']['greeks'] {
    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;
    let count = 0;
    
    chain.calls.forEach(contract => {
      totalDelta += Math.abs(contract.delta);
      totalGamma += contract.gamma;
      totalTheta += Math.abs(contract.theta);
      totalVega += contract.vega;
      count++;
    });
    
    return {
      totalDelta: Math.round((totalDelta / count) * 1000) / 1000,
      totalGamma: Math.round((totalGamma / count) * 10000) / 10000,
      totalTheta: Math.round((totalTheta / count) * 1000) / 1000,
      totalVega: Math.round((totalVega / count) * 1000) / 1000,
      interpretation: 'Greeks indicate moderate sensitivity to underlying movements'
    };
  }

  private analyzeVolatility(volatilityData: VolatilityData): OptionAnalysis['analysis']['volatility'] {
    const avgIV = volatilityData.impliedVolatility.reduce((sum, iv) => sum + iv.iv, 0) / volatilityData.impliedVolatility.length;
    const avgHV = volatilityData.historicalVolatility.reduce((sum, hv) => sum + hv.value, 0) / volatilityData.historicalVolatility.length;
    
    // Calculate percentile (simplified)
    const percentile = Math.min(100, Math.max(0, (avgIV / 50) * 100));
    
    let outlook: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (avgIV > avgHV * 1.1) outlook = 'decreasing';
    else if (avgIV < avgHV * 0.9) outlook = 'increasing';
    
    return {
      current: Math.round(avgIV * 100) / 100,
      historical: Math.round(avgHV * 100) / 100,
      percentile: Math.round(percentile),
      outlook
    };
  }

  // Education Content
  public getEducationContent(level?: 'beginner' | 'intermediate' | 'advanced'): OptionEducation[] {
    let content = Array.from(this.educationContent.values());
    
    if (level) {
      content = content.filter(c => c.level === level);
    }
    
    return content;
  }

  public getEducationTopic(topic: string): OptionEducation | undefined {
    return this.educationContent.get(topic);
  }

  // Initialize Default Strategies
  private initializeStrategies(): void {
    const strategies: Omit<OptionStrategy, 'id'>[] = [
      {
        name: 'Long Call',
        type: 'bullish',
        description: 'Buy a call option to profit from upward price movement',
        legs: [], // Will be populated when creating actual positions
        maxProfit: 'unlimited',
        maxLoss: 0, // Premium paid
        breakeven: [],
        netPremium: 0,
        marginRequired: 0,
        riskReward: 0,
        probability: 40,
        complexity: 'beginner',
        marketOutlook: 'Bullish - expecting significant upward movement',
        timeDecay: 'negative',
        volatility: 'positive'
      },
      {
        name: 'Long Put',
        type: 'bearish',
        description: 'Buy a put option to profit from downward price movement',
        legs: [],
        maxProfit: 0, // Strike - Premium
        maxLoss: 0, // Premium paid
        breakeven: [],
        netPremium: 0,
        marginRequired: 0,
        riskReward: 0,
        probability: 40,
        complexity: 'beginner',
        marketOutlook: 'Bearish - expecting significant downward movement',
        timeDecay: 'negative',
        volatility: 'positive'
      },
      {
        name: 'Bull Call Spread',
        type: 'bullish',
        description: 'Buy lower strike call, sell higher strike call',
        legs: [],
        maxProfit: 0, // Difference in strikes - net premium
        maxLoss: 0, // Net premium paid
        breakeven: [],
        netPremium: 0,
        marginRequired: 0,
        riskReward: 0,
        probability: 55,
        complexity: 'intermediate',
        marketOutlook: 'Moderately bullish with limited upside target',
        timeDecay: 'neutral',
        volatility: 'negative'
      },
      {
        name: 'Iron Condor',
        type: 'neutral',
        description: 'Sell call spread and put spread with same expiration',
        legs: [],
        maxProfit: 0, // Net premium received
        maxLoss: 0, // Difference in strikes - net premium
        breakeven: [],
        netPremium: 0,
        marginRequired: 0,
        riskReward: 0,
        probability: 65,
        complexity: 'advanced',
        marketOutlook: 'Neutral - expecting low volatility and range-bound movement',
        timeDecay: 'positive',
        volatility: 'negative'
      },
      {
        name: 'Long Straddle',
        type: 'volatile',
        description: 'Buy call and put with same strike and expiration',
        legs: [],
        maxProfit: 'unlimited',
        maxLoss: 0, // Total premium paid
        breakeven: [],
        netPremium: 0,
        marginRequired: 0,
        riskReward: 0,
        probability: 35,
        complexity: 'intermediate',
        marketOutlook: 'High volatility expected in either direction',
        timeDecay: 'negative',
        volatility: 'positive'
      }
    ];
    
    strategies.forEach((strategy, index) => {
      const id = `strategy_${index + 1}`;
      this.strategies.set(id, { ...strategy, id });
    });
  }

  // Initialize Education Content
  private initializeEducationContent(): void {
    const content: OptionEducation[] = [
      {
        topic: 'options_basics',
        level: 'beginner',
        title: 'Options Basics',
        content: 'Options are financial contracts that give you the right, but not the obligation, to buy or sell an underlying asset at a specific price within a certain time period.',
        examples: [
          {
            scenario: 'Buying a Call Option',
            explanation: 'You buy a call option on XYZ stock with a strike price of $100, expiring in 30 days, for a premium of $2.',
            calculation: 'Breakeven = Strike + Premium = $100 + $2 = $102'
          }
        ],
        keyPoints: [
          'Options provide leverage and limited risk',
          'Time decay affects option value',
          'Volatility impacts option pricing'
        ],
        risks: [
          'Options can expire worthless',
          'Time decay works against option buyers',
          'High volatility can increase costs'
        ],
        relatedTopics: ['greeks', 'strategies']
      },
      {
        topic: 'greeks',
        level: 'intermediate',
        title: 'Understanding the Greeks',
        content: 'The Greeks measure different risk factors that affect option pricing: Delta, Gamma, Theta, Vega, and Rho.',
        examples: [
          {
            scenario: 'Delta Example',
            explanation: 'A call option with Delta of 0.5 will increase by $0.50 for every $1 increase in the underlying stock price.'
          }
        ],
        keyPoints: [
          'Delta measures price sensitivity',
          'Gamma measures delta sensitivity',
          'Theta measures time decay',
          'Vega measures volatility sensitivity'
        ],
        risks: [
          'Greeks change as market conditions change',
          'Multiple Greeks can work against you simultaneously'
        ],
        relatedTopics: ['options_basics', 'strategies']
      }
    ];
    
    content.forEach(item => {
      this.educationContent.set(item.topic, item);
    });
  }

  // Real-time Updates
  private startRealTimeUpdates(): void {
    this.updateInterval = setInterval(() => {

      this.updateOptionsChains();
      this.updatePositions();
    }, 30000); // Update every 30 seconds
  }

  private updateOptionsChains(): void {
    this.optionsChains.forEach((chain, symbol) => {
      // Update option prices and Greeks
      chain.calls.forEach(contract => {
        // Simulate small price changes
        const change = (Math.random() - 0.5) * 0.1;
        contract.premium = Math.max(0.01, contract.premium + change);
        contract.bid = contract.premium - 0.05;
        contract.ask = contract.premium + 0.05;
        contract.lastUpdated = new Date();
      });
      
      chain.puts.forEach(contract => {
        const change = (Math.random() - 0.5) * 0.1;
        contract.premium = Math.max(0.01, contract.premium + change);
        contract.bid = contract.premium - 0.05;
        contract.ask = contract.premium + 0.05;
        contract.lastUpdated = new Date();
      });
      
      chain.lastUpdated = new Date();
    });
    
    this.notifySubscribers('options_updated', Array.from(this.optionsChains.keys()));
  }

  private updatePositions(): void {
    this.positions.forEach(position => {
      if (position.status === 'open') {
        // Update P&L based on current option prices
        let currentValue = 0;
        
        position.strategy.legs.forEach(leg => {
          // In a real implementation, this would fetch current option prices
          const currentPrice = leg.premium + (Math.random() - 0.5) * 0.2;
          const legValue = leg.action === 'buy' ? currentPrice : -currentPrice;
          currentValue += legValue * leg.quantity;
        });
        
        position.currentPrice = currentValue;
        position.pnl = currentValue - position.entryPrice;
        position.pnlPercent = (position.pnl / Math.abs(position.entryPrice)) * 100;
        
        // Update days to expiry
        position.daysToExpiry = Math.min(...position.strategy.legs.map(leg => 
          Math.max(0, Math.ceil((leg.contract.expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        ));
        
        // Check for expiry
        if (position.daysToExpiry === 0) {
          position.status = 'expired';
        }
      }
    });
    
    this.notifySubscribers('positions_updated', this.getPositions('open'));
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
      const [positionsData] = await Promise.all([
        AsyncStorage.getItem('option_positions')
      ]);

      if (positionsData) {
        const positions = JSON.parse(positionsData);
        positions.forEach((position: any) => {
          position.entryDate = new Date(position.entryDate);
          position.strategy.legs.forEach((leg: any) => {
            leg.contract.expiry = new Date(leg.contract.expiry);
            leg.contract.lastUpdated = new Date(leg.contract.lastUpdated);
          });
          if (position.alerts) {
            position.alerts.forEach((alert: any) => {
              if (alert.triggeredAt) alert.triggeredAt = new Date(alert.triggeredAt);
            });
          }
          this.positions.set(position.id, position);
        });
      }
    } catch (error) {
      console.error('Failed to load options data:', error);
    }
  }

  private async savePositionsToStorage(): Promise<void> {
    try {
      const positions = Array.from(this.positions.values());
      await AsyncStorage.setItem('option_positions', JSON.stringify(positions));
    } catch (error) {
      console.error('Failed to save positions:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.subscribers.clear();
    this.optionsChains.clear();
    this.strategies.clear();
    this.positions.clear();
    this.volatilityData.clear();
    this.educationContent.clear();
  }
}

export default OptionsService;
export type {
  OptionContract,
  OptionsChain,
  OptionStrategy,
  OptionLeg,
  OptionPosition,
  PositionAlert,
  VolatilityData,
  OptionAnalysis,
  OptionEducation
};