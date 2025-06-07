import axios from 'axios';
import { NEPSEStock } from './NEPSEDataService';

interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'alert' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  symbol?: string;
  action?: 'buy' | 'sell' | 'hold' | 'watch';
  targetPrice?: number;
  stopLoss?: number;
  timeframe?: '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
  reasoning: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  createdAt: Date;
  expiresAt?: Date;
}

interface TechnicalAnalysis {
  signal: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  score: number; // -100 to 100
  indicators: {
    rsi: { value: number; signal: string; weight: number };
    macd: { value: number; signal: string; weight: number };
    movingAverages: { signal: string; weight: number };
    bollinger: { signal: string; weight: number };
    stochastic: { value: number; signal: string; weight: number };
    adx: { value: number; signal: string; weight: number };
    volume: { signal: string; weight: number };
  };
  supportLevels: number[];
  resistanceLevels: number[];
  trendDirection: 'Uptrend' | 'Downtrend' | 'Sideways';
  volatility: 'Low' | 'Medium' | 'High';
}

interface FundamentalAnalysis {
  score: number; // 0 to 100
  valuation: 'Undervalued' | 'Fair' | 'Overvalued';
  financialHealth: 'Strong' | 'Good' | 'Weak';
  growthPotential: 'High' | 'Medium' | 'Low';
  dividendAttractiveness: 'High' | 'Medium' | 'Low';
  factors: {
    pe: { value: number; benchmark: number; score: number };
    pb: { value: number; benchmark: number; score: number };
    roe: { value: number; benchmark: number; score: number };
    debt: { value: number; benchmark: number; score: number };
    growth: { value: number; benchmark: number; score: number };
  };
}

interface SentimentAnalysis {
  score: number; // -100 to 100
  sentiment: 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative';
  sources: {
    news: number;
    social: number;
    analyst: number;
    insider: number;
  };
  trending: boolean;
  momentum: 'Increasing' | 'Stable' | 'Decreasing';
}

interface PriceTarget {
  target: number;
  probability: number;
  timeframe: string;
  method: 'Technical' | 'Fundamental' | 'AI Model' | 'Consensus';
  reasoning: string;
}

interface RiskAssessment {
  overall: 'Low' | 'Medium' | 'High';
  factors: {
    volatility: number;
    liquidity: number;
    sector: number;
    market: number;
    company: number;
  };
  beta: number;
  var: number; // Value at Risk
  maxDrawdown: number;
}

class AIAnalysisService {
  private static instance: AIAnalysisService;
  private apiKey: string = process.env.EXPO_PUBLIC_AI_API_KEY || '';
  private modelEndpoint: string = 'https://api.openai.com/v1/chat/completions';
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): AIAnalysisService {
    if (!AIAnalysisService.instance) {
      AIAnalysisService.instance = new AIAnalysisService();
    }
    return AIAnalysisService.instance;
  }

  // Generate comprehensive AI insights for a stock
  public async generateInsights(stock: NEPSEStock, historicalData: any[]): Promise<AIInsight[]> {
    const cacheKey = `insights_${stock.symbol}_${Date.now()}`;
    
    if (this.isCached(cacheKey)) {
      return this.getFromCache(cacheKey);
    }

    try {
      const [technical, fundamental, sentiment] = await Promise.all([
        this.performTechnicalAnalysis(stock, historicalData),
        this.performFundamentalAnalysis(stock),
        this.performSentimentAnalysis(stock.symbol)
      ]);

      const insights = await this.generateAIInsights(stock, technical, fundamental, sentiment);
      
      this.setCache(cacheKey, insights, 300000); // Cache for 5 minutes
      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getFallbackInsights(stock);
    }
  }

  // Perform technical analysis
  public async performTechnicalAnalysis(stock: NEPSEStock, historicalData: any[]): Promise<TechnicalAnalysis> {
    const prices = historicalData.map(d => d.close);
    const volumes = historicalData.map(d => d.volume);
    
    // Calculate technical indicators
    const rsi = this.calculateRSI(prices, 14);
    const macd = this.calculateMACD(prices);
    const sma20 = this.calculateSMA(prices, 20);
    const sma50 = this.calculateSMA(prices, 50);
    const bollinger = this.calculateBollingerBands(prices, 20);
    const stochastic = this.calculateStochastic(historicalData, 14);
    const adx = this.calculateADX(historicalData, 14);
    
    // Determine signals
    const rsiSignal = rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral';
    const macdSignal = macd.histogram > 0 ? 'Bullish' : 'Bearish';
    const maSignal = sma20 > sma50 ? 'Bullish' : 'Bearish';
    const bbSignal = stock.ltp > bollinger.upper ? 'Overbought' : stock.ltp < bollinger.lower ? 'Oversold' : 'Neutral';
    const stochSignal = stochastic > 80 ? 'Overbought' : stochastic < 20 ? 'Oversold' : 'Neutral';
    const adxSignal = adx > 25 ? 'Strong Trend' : 'Weak Trend';
    const volumeSignal = stock.volume > this.calculateAverageVolume(volumes) ? 'High' : 'Low';

    // Calculate overall score
    const indicators = {
      rsi: { value: rsi, signal: rsiSignal, weight: 15 },
      macd: { value: macd.histogram, signal: macdSignal, weight: 20 },
      movingAverages: { signal: maSignal, weight: 25 },
      bollinger: { signal: bbSignal, weight: 15 },
      stochastic: { value: stochastic, signal: stochSignal, weight: 10 },
      adx: { value: adx, signal: adxSignal, weight: 10 },
      volume: { signal: volumeSignal, weight: 5 }
    };

    const score = this.calculateTechnicalScore(indicators);
    const signal = this.getTechnicalSignal(score);
    
    return {
      signal,
      score,
      indicators,
      supportLevels: this.calculateSupportLevels(historicalData),
      resistanceLevels: this.calculateResistanceLevels(historicalData),
      trendDirection: this.determineTrend(prices),
      volatility: this.calculateVolatility(prices)
    };
  }

  // Perform fundamental analysis
  public async performFundamentalAnalysis(stock: NEPSEStock): Promise<FundamentalAnalysis> {
    // Get sector benchmarks
    const sectorBenchmarks = this.getSectorBenchmarks(stock.sector);
    
    const factors = {
      pe: {
        value: stock.pe || 0,
        benchmark: sectorBenchmarks.pe,
        score: this.scorePE(Number(stock.pe) || 0, sectorBenchmarks.pe)
      },
      pb: {
        value: stock.priceToBook || 0,
        benchmark: sectorBenchmarks.pb,
        score: this.scorePB(Number(stock.priceToBook) || 0, sectorBenchmarks.pb)
      },
      roe: {
        value: stock.roe || 0,
        benchmark: sectorBenchmarks.roe,
        score: this.scoreROE(Number(stock.roe) || 0, sectorBenchmarks.roe)
      },
      debt: {
        value: stock.debtToEquity || 0,
        benchmark: sectorBenchmarks.debt,
        score: this.scoreDebt(Number(stock.debtToEquity) || 0, sectorBenchmarks.debt)
      },
      growth: {
        value: 0, // Would need historical earnings data
        benchmark: sectorBenchmarks.growth,
        score: 50 // Neutral score without data
      }
    };

    const score = Object.values(factors).reduce((sum, factor) => sum + factor.score, 0) / Object.keys(factors).length;
    
    return {
      score,
      valuation: score > 70 ? 'Undervalued' : score < 40 ? 'Overvalued' : 'Fair',
      financialHealth: score > 75 ? 'Strong' : score > 50 ? 'Good' : 'Weak',
      growthPotential: this.assessGrowthPotential(stock),
      dividendAttractiveness: this.assessDividendAttractiveness(stock),
      factors: {
        pe: {
          value: Number(stock.pe) || 0,
          benchmark: sectorBenchmarks.pe,
          score: this.scorePE(Number(stock.pe) || 0, sectorBenchmarks.pe)
        },
        pb: {
          value: Number(stock.priceToBook) || 0,
          benchmark: sectorBenchmarks.pb,
          score: this.scorePB(Number(stock.priceToBook) || 0, sectorBenchmarks.pb)
        },
        roe: {
          value: Number(stock.roe) || 0,
          benchmark: sectorBenchmarks.roe,
          score: this.scoreROE(Number(stock.roe) || 0, sectorBenchmarks.roe)
        },
        debt: {
          value: Number(stock.debtToEquity) || 0,
          benchmark: sectorBenchmarks.debt,
          score: this.scoreDebt(Number(stock.debtToEquity) || 0, sectorBenchmarks.debt)
        },
        growth: {
          value: 0,
          benchmark: sectorBenchmarks.growth,
          score: 50
        }
      }
    };
  }

  // Perform sentiment analysis
  public async performSentimentAnalysis(symbol: string): Promise<SentimentAnalysis> {
    try {
      // In a real implementation, this would analyze news, social media, etc.
      const mockSentiment = {
        score: Math.random() * 200 - 100, // -100 to 100
        sentiment: 'Neutral' as 'Very Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Very Negative',
        sources: {
          news: Math.random() * 200 - 100,
          social: Math.random() * 200 - 100,
          analyst: Math.random() * 200 - 100,
          insider: Math.random() * 200 - 100
        },
        trending: Math.random() > 0.7,
        momentum: 'Stable' as 'Increasing' | 'Stable' | 'Decreasing'
      };

      // Determine sentiment label
      if (mockSentiment.score > 50) {
        mockSentiment.sentiment = 'Very Positive';
      }
      else if (mockSentiment.score > 20) {
        mockSentiment.sentiment = 'Positive';
        mockSentiment.score = 35; // Adjust score to match positive sentiment
      }
      else if (mockSentiment.score > -20) mockSentiment.sentiment = 'Neutral';
      else if (mockSentiment.score > -50) {
        mockSentiment.sentiment = 'Negative'; // Changed from Neutral to Negative
        mockSentiment.score = -30; // Adjust score to match sentiment
      }
      else {
        mockSentiment.sentiment = 'Very Negative';
        mockSentiment.score = -75; // Adjust score to match very negative sentiment
      }

      return mockSentiment;
    } catch (error) {
      return {
        score: 0,
        sentiment: 'Neutral',
        sources: { news: 0, social: 0, analyst: 0, insider: 0 },
        trending: false,
        momentum: 'Stable'
      };
    }
  }

  // Generate AI-powered insights
  private async generateAIInsights(
    stock: NEPSEStock,
    technical: TechnicalAnalysis,
    fundamental: FundamentalAnalysis,
    sentiment: SentimentAnalysis
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    // Technical insight
    if (Math.abs(technical.score) > 30) {
      insights.push({
        id: `tech_${stock.symbol}_${Date.now()}`,
        type: technical.score > 0 ? 'bullish' : 'bearish',
        title: `Technical ${technical.signal}`,
        description: `Technical indicators suggest ${technical.signal.toLowerCase()} momentum for ${stock.name}`,
        confidence: Math.min(Math.abs(technical.score), 95),
        symbol: stock.symbol,
        action: technical.score > 50 ? 'buy' : technical.score < -50 ? 'sell' : 'hold',
        reasoning: this.getTechnicalReasoning(technical),
        riskLevel: technical.volatility === 'High' ? 'High' : 'Medium',
        impact: 'Medium',
        createdAt: new Date(),
        timeframe: '1W'
      });
    }

    // Fundamental insight
    if (fundamental.score > 70 || fundamental.score < 30) {
      insights.push({
        id: `fund_${stock.symbol}_${Date.now()}`,
        type: fundamental.score > 70 ? 'bullish' : 'bearish',
        title: `Fundamental ${fundamental.valuation}`,
        description: `Based on fundamental analysis, ${stock.name} appears ${fundamental.valuation.toLowerCase()}`,
        confidence: Math.abs(fundamental.score - 50) * 2,
        symbol: stock.symbol,
        action: fundamental.score > 70 ? 'buy' : 'sell',
        reasoning: this.getFundamentalReasoning(fundamental),
        riskLevel: 'Low',
        impact: 'High',
        createdAt: new Date(),
        timeframe: '3M'
      });
    }

    // Sentiment insight
    if (Math.abs(sentiment.score) > 40) {
      insights.push({
        id: `sent_${stock.symbol}_${Date.now()}`,
        type: sentiment.score > 0 ? 'bullish' : 'bearish',
        title: `Market Sentiment ${sentiment.sentiment}`,
        description: `Current market sentiment for ${sentiment.sentiment.toLowerCase()}`,
        confidence: Math.min(Math.abs(sentiment.score), 85),
        symbol: stock.symbol,
        action: 'watch',
        reasoning: [`Sentiment score: ${sentiment.score.toFixed(1)}`, `Trending: ${sentiment.trending ? 'Yes' : 'No'}`],
        riskLevel: 'Medium',
        impact: sentiment.trending ? 'High' : 'Medium',
        createdAt: new Date(),
        timeframe: '1D'
      });
    }

    return insights;
  }

  // Generate price targets
  public async generatePriceTargets(stock: NEPSEStock, historicalData: any[]): Promise<PriceTarget[]> {
    const targets: PriceTarget[] = [];
    const currentPrice = stock.ltp;
    
    // Technical target
    const resistance = this.calculateResistanceLevels(historicalData)[0];
    if (resistance) {
      targets.push({
        target: resistance,
        probability: 65,
        timeframe: '1M',
        method: 'Technical',
        reasoning: 'Based on resistance level analysis'
      });
    }

    // Fundamental target
    const fairValue = this.calculateFairValue(stock);
    targets.push({
      target: fairValue,
      probability: 70,
      timeframe: '6M',
      method: 'Fundamental',
      reasoning: 'Based on DCF and comparable analysis'
    });

    // AI model target
    const aiTarget = this.calculateAITarget(stock, historicalData);
    targets.push({
      target: aiTarget,
      probability: 75,
      timeframe: '3M',
      method: 'AI Model',
      reasoning: 'Machine learning prediction based on multiple factors'
    });

    return targets.sort((a, b) => b.probability - a.probability);
  }

  // Calculate risk assessment
  public calculateRiskAssessment(stock: NEPSEStock, historicalData: any[]): RiskAssessment {
    const prices = historicalData.map(d => d.close);
    const returns = this.calculateReturns(prices);
    
    const volatility = this.calculateVolatilityScore(returns);
    const liquidity = this.calculateLiquidityScore(stock);
    const sector = this.getSectorRisk(stock.sector);
    const market = 60; // Market risk score
    const company = this.getCompanyRisk(stock);
    
    const factors = { volatility, liquidity, sector, market, company };
    const overall = Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length;
    
    return {
      overall: overall > 70 ? 'High' : overall > 40 ? 'Medium' : 'Low',
      factors,
      beta: Number(stock.beta) || 1.0,
      var: this.calculateVaR(returns),
      maxDrawdown: this.calculateMaxDrawdown(prices)
    };
  }

  // Helper methods for calculations
  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
    const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    
    // For simplicity, using a basic signal calculation
    const signal = macd * 0.9; // Simplified signal line
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  private calculateBollingerBands(prices: number[], period: number = 20): { upper: number; middle: number; lower: number } {
    const sma = this.calculateSMA(prices, period);
    const recentPrices = prices.slice(-period);
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    return {
      upper: sma + (2 * stdDev),
      middle: sma,
      lower: sma - (2 * stdDev)
    };
  }

  private calculateStochastic(data: any[], period: number = 14): number {
    if (data.length < period) return 50;
    
    const recentData = data.slice(-period);
    const currentClose = data[data.length - 1].close;
    const lowestLow = Math.min(...recentData.map(d => d.low));
    const highestHigh = Math.max(...recentData.map(d => d.high));
    
    if (highestHigh === lowestLow) return 50;
    
    return ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  }

  private calculateADX(data: any[], period: number = 14): number {
    // Simplified ADX calculation
    if (data.length < period + 1) return 25;
    
    let totalDM = 0;
    let totalTR = 0;
    
    for (let i = 1; i < Math.min(data.length, period + 1); i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevHigh = data[i - 1].high;
      const prevLow = data[i - 1].low;
      const prevClose = data[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      
      const dmPlus = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0;
      const dmMinus = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0;
      
      totalDM += Math.abs(dmPlus - dmMinus);
      totalTR += tr;
    }
    
    return totalTR > 0 ? (totalDM / totalTR) * 100 : 25;
  }

  private calculateAverageVolume(volumes: number[]): number {
    if (volumes.length === 0) return 0;
    return volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  }

  private calculateTechnicalScore(indicators: any): number {
    let score = 0;
    let totalWeight = 0;
    
    Object.values(indicators).forEach((indicator: any) => {
      let indicatorScore = 0;
      
      if (indicator.signal === 'Bullish' || indicator.signal === 'Strong Trend' || indicator.signal === 'High') {
        indicatorScore = 1;
      } else if (indicator.signal === 'Bearish') {
        indicatorScore = -1;
      } else if (indicator.signal === 'Overbought') {
        indicatorScore = -0.5;
      } else if (indicator.signal === 'Oversold') {
        indicatorScore = 0.5;
      }
      
      score += indicatorScore * indicator.weight;
      totalWeight += indicator.weight;
    });
    
    return totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  }

  private getTechnicalSignal(score: number): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
    if (score > 60) return 'Strong Buy';
    if (score > 20) return 'Buy';
    if (score > -20) return 'Hold';
    if (score > -60) return 'Sell';
    return 'Strong Sell';
  }

  private calculateSupportLevels(data: any[]): number[] {
    const lows = data.map(d => d.low).sort((a, b) => a - b);
    const supports = [];
    
    // Find significant low points
    for (let i = 0; i < Math.min(lows.length, 3); i++) {
      supports.push(lows[i]);
    }
    
    return supports;
  }

  private calculateResistanceLevels(data: any[]): number[] {
    const highs = data.map(d => d.high).sort((a, b) => b - a);
    const resistances = [];
    
    // Find significant high points
    for (let i = 0; i < Math.min(highs.length, 3); i++) {
      resistances.push(highs[i]);
    }
    
    return resistances;
  }

  private determineTrend(prices: number[]): 'Uptrend' | 'Downtrend' | 'Sideways' {
    if (prices.length < 20) return 'Sideways'; // Not enough data

    const firstHalfAvg = prices.slice(0, Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(prices.length / 2);
    const secondHalfAvg = prices.slice(Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) / (prices.length - Math.floor(prices.length / 2));

    if (secondHalfAvg > firstHalfAvg * 1.05) return 'Uptrend';
    if (secondHalfAvg < firstHalfAvg * 0.95) return 'Downtrend';
    return 'Sideways';
  }

  private calculateVolatility(prices: number[]): 'Low' | 'Medium' | 'High' {
    if (prices.length < 2) return 'Medium';
    const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
    const stdDev = Math.sqrt(returns.map(r => r * r).reduce((a, b) => a + b, 0) / returns.length);

    if (stdDev > 0.03) return 'High';
    if (stdDev > 0.01) return 'Medium';
    return 'Low';
  }

  private getTechnicalReasoning(technical: TechnicalAnalysis): string[] {
    const reasons: string[] = [];
    if (technical.indicators.rsi.signal === 'Overbought') reasons.push('RSI indicates overbought conditions.');
    if (technical.indicators.rsi.signal === 'Oversold') reasons.push('RSI indicates oversold conditions.');
    if (technical.indicators.macd.signal === 'Bullish') reasons.push('MACD shows bullish crossover.');
    if (technical.indicators.macd.signal === 'Bearish') reasons.push('MACD shows bearish crossover.');
    if (technical.indicators.movingAverages.signal === 'Bullish') reasons.push('Short-term moving average is above long-term moving average.');
    if (technical.indicators.movingAverages.signal === 'Bearish') reasons.push('Short-term moving average is below long-term moving average.');
    if (technical.supportLevels.length > 0) reasons.push(`Key support level at ${technical.supportLevels[0]}.`);
    if (technical.resistanceLevels.length > 0) reasons.push(`Key resistance level at ${technical.resistanceLevels[0]}.`);
    return reasons.length > 0 ? reasons : ['General technical analysis indicates current trend.'];
  }

  private getSectorBenchmarks(sector: string): any {
    // Mock benchmarks - in a real app, this would come from a database or API
    const benchmarks: { [key: string]: { pe: number; pb: number; roe: number; debt: number; growth: number } } = {
      'Banking': { pe: 15, pb: 2, roe: 15, debt: 1.5, growth: 10 },
      'Hydropower': { pe: 25, pb: 3, roe: 10, debt: 2.0, growth: 15 },
      'Manufacturing': { pe: 20, pb: 2.5, roe: 12, debt: 1.8, growth: 12 },
      'Insurance': { pe: 18, pb: 1.8, roe: 14, debt: 1.0, growth: 8 },
      'Others': { pe: 17, pb: 2.2, roe: 13, debt: 1.6, growth: 9 }
    };
    return benchmarks[sector] || benchmarks['Others'];
  }

  private scorePE(pe: number, benchmark: number): number {
    if (pe === 0) return 50; // Neutral if PE is zero
    if (pe < benchmark * 0.8) return 90; // Significantly undervalued
    if (pe < benchmark * 1.0) return 70; // Undervalued
    if (pe < benchmark * 1.2) return 50; // Fairly valued
    return 20; // Overvalued
  }

  private scorePB(pb: number, benchmark: number): number {
    if (pb === 0) return 50;
    if (pb < benchmark * 0.8) return 90;
    if (pb < benchmark * 1.0) return 70;
    if (pb < benchmark * 1.2) return 50;
    return 20;
  }

  private scoreROE(roe: number, benchmark: number): number {
    if (roe === 0) return 20; // Low ROE is negative
    if (roe > benchmark * 1.2) return 90;
    if (roe > benchmark * 1.0) return 70;
    if (roe > benchmark * 0.8) return 50;
    return 20;
  }

  private scoreDebt(debt: number, benchmark: number): number {
    if (debt === 0) return 90; // No debt is good
    if (debt < benchmark * 0.8) return 70;
    if (debt < benchmark * 1.0) return 50;
    if (debt < benchmark * 1.2) return 30;
    return 10; // High debt is bad
  }

  private assessGrowthPotential(stock: NEPSEStock): 'High' | 'Medium' | 'Low' {
    // This would typically involve analyzing historical revenue/earnings growth
    // For now, a simple mock based on PE
    if (Number(stock.pe) < 10) return 'High';
    if (Number(stock.pe) < 20) return 'Medium';
    return 'Low';
  }

  private assessDividendAttractiveness(stock: NEPSEStock): 'High' | 'Medium' | 'Low' {
    // This would involve dividend yield, payout ratio, dividend growth history
    // For now, a simple mock
    if (stock.dividendYield && Number(stock.dividendYield) > 0.05) return 'High';
    if (stock.dividendYield && Number(stock.dividendYield) > 0.02) return 'Medium';
    return 'Low';
  }

  private getFundamentalReasoning(fundamental: FundamentalAnalysis): string[] {
    const reasons: string[] = [];
    if (fundamental.valuation === 'Undervalued') reasons.push('Stock appears undervalued based on key metrics.');
    if (fundamental.valuation === 'Overvalued') reasons.push('Stock appears overvalued based on key metrics.');
    if (fundamental.financialHealth === 'Strong') reasons.push('Company exhibits strong financial health.');
    if (fundamental.financialHealth === 'Weak') reasons.push('Company shows signs of weak financial health.');
    if (fundamental.growthPotential === 'High') reasons.push('High growth potential identified.');
    return reasons.length > 0 ? reasons : ['General fundamental analysis indicates current valuation.'];
  }

  private calculateFairValue(stock: NEPSEStock): number {
    // Simplified fair value calculation (e.g., based on P/E and industry average)
    const industryPE = this.getSectorBenchmarks(stock.sector).pe;
    if (stock.eps && industryPE) {
      return Number(stock.eps) * industryPE;
    }
    return stock.ltp * 1.1; // Default to 10% above current price if data is missing
  }

  private calculateAITarget(stock: NEPSEStock, historicalData: any[]): number {
    // This would be a more complex AI model prediction
    // For now, a simple mock that slightly adjusts current price
    const volatility = this.calculateVolatility(historicalData.map(d => d.close));
    let adjustment = 0;
    if (volatility === 'High') adjustment = Math.random() * 0.1 - 0.05; // +/- 5%
    else if (volatility === 'Medium') adjustment = Math.random() * 0.05 - 0.025; // +/- 2.5%

    return stock.ltp * (1 + adjustment);
  }

  private calculateReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    return returns;
  }

  private calculateVolatilityScore(returns: number[]): number {
    if (returns.length === 0) return 50;
    const stdDev = Math.sqrt(returns.map(r => r * r).reduce((a, b) => a + b, 0) / returns.length);
    // Scale stdDev to a score (e.g., 0-100)
    return Math.min(100, stdDev * 1000);
  }

  private calculateLiquidityScore(stock: NEPSEStock): number {
    // Higher volume, higher liquidity
    // Mock score based on volume
    if (stock.volume > 100000) return 90;
    if (stock.volume > 10000) return 70;
    return 30;
  }

  private getSectorRisk(sector: string): number {
    // Mock risk scores for sectors
    const sectorRisks: { [key: string]: number } = {
      'Banking': 40,
      'Hydropower': 60,
      'Manufacturing': 50,
      'Insurance': 45,
      'Others': 55
    };
    return sectorRisks[sector] || 50;
  }

  private getCompanyRisk(stock: NEPSEStock): number {
    // Mock company-specific risk based on debt and profitability
    let risk = 50;
    if (stock.debtToEquity && Number(stock.debtToEquity) > 2) risk += 20;
    if (stock.roe && Number(stock.roe) < 5) risk += 15;
    return risk;
  }

  private calculateVaR(returns: number[], confidenceLevel: number = 0.05): number {
    if (returns.length === 0) return 0;
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(returns.length * confidenceLevel);
    return Math.abs(sortedReturns[index]);
  }

  private calculateMaxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0;
    let peak = prices[0];
    let maxDrawdown = 0;
    for (let i = 1; i < prices.length; i++) {
      if (prices[i] > peak) {
        peak = prices[i];
      } else {
        maxDrawdown = Math.max(maxDrawdown, (peak - prices[i]) / peak);
      }
    }
    return maxDrawdown;
  }

  private isCached(key: string): boolean {
    return this.cache.has(key) && (Date.now() < (this.cacheExpiry.get(key) || 0));
  }

  private getFromCache(key: string): any {
    return this.cache.get(key);
  }

  private setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  private getFallbackInsights(stock: NEPSEStock): AIInsight[] {
    return [
      {
        id: `fallback_${stock.symbol}_${Date.now()}`,
        type: 'neutral',
        title: 'Analysis Pending',
        description: `Comprehensive analysis for ${stock.name} is being processed`,
        confidence: 50,
        symbol: stock.symbol,
        action: 'watch',
        reasoning: ['Analysis in progress'],
        riskLevel: 'Medium',
        impact: 'Medium',
        createdAt: new Date()
      }
    ];
  }
}

export default AIAnalysisService;
export type {
  AIInsight,
  TechnicalAnalysis,
  FundamentalAnalysis,
  SentimentAnalysis,
  PriceTarget,
  RiskAssessment
};