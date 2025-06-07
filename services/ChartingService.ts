import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChartDataPoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  value?: number; // For line charts
}

interface TechnicalIndicator {
  name: string;
  type: 'overlay' | 'oscillator' | 'volume';
  data: {
    timestamp: Date;
    value: number;
    signal?: number;
    histogram?: number;
    upper?: number;
    lower?: number;
    middle?: number;
  }[];
  parameters: { [key: string]: any };
  color: string;
  visible: boolean;
}

interface ChartAnnotation {
  id: string;
  type: 'trendline' | 'horizontal' | 'vertical' | 'rectangle' | 'text' | 'arrow';
  coordinates: {
    x1: number;
    y1: number;
    x2?: number;
    y2?: number;
  };
  style: {
    color: string;
    width: number;
    dashArray?: number[];
    opacity: number;
  };
  text?: string;
  timestamp: Date;
  isVisible: boolean;
}

interface ChartSettings {
  chartType: 'candlestick' | 'line' | 'area' | 'bar' | 'heikin_ashi' | 'renko' | 'point_figure';
  timeframe: '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';
  theme: 'light' | 'dark';
  showVolume: boolean;
  showGrid: boolean;
  showCrosshair: boolean;
  showLastPrice: boolean;
  autoScale: boolean;
  logScale: boolean;
  indicators: string[]; // Array of indicator names
  overlays: string[]; // Array of overlay names
  colors: {
    background: string;
    grid: string;
    text: string;
    bullish: string;
    bearish: string;
    volume: string;
    crosshair: string;
  };
  fontSize: number;
  lineWidth: number;
}

interface ChartTemplate {
  id: string;
  name: string;
  description: string;
  settings: ChartSettings;
  indicators: TechnicalIndicator[];
  annotations: ChartAnnotation[];
  createdAt: Date;
  isDefault: boolean;
  category: 'technical' | 'fundamental' | 'custom';
}

interface PriceAlert {
  id: string;
  symbol: string;
  price: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

interface ChartStudy {
  id: string;
  name: string;
  type: 'pattern' | 'support_resistance' | 'fibonacci' | 'elliott_wave';
  data: any;
  isVisible: boolean;
  color: string;
}

interface MarketProfile {
  symbol: string;
  date: Date;
  valueArea: {
    high: number;
    low: number;
    poc: number; // Point of Control
  };
  profile: {
    price: number;
    volume: number;
    percentage: number;
  }[];
}

interface ChartAnalysis {
  symbol: string;
  timeframe: string;
  analysis: {
    trend: {
      direction: 'bullish' | 'bearish' | 'sideways';
      strength: 'strong' | 'moderate' | 'weak';
      confidence: number;
    };
    support: number[];
    resistance: number[];
    patterns: {
      name: string;
      type: 'bullish' | 'bearish' | 'neutral';
      confidence: number;
      target?: number;
      stopLoss?: number;
    }[];
    indicators: {
      name: string;
      signal: 'buy' | 'sell' | 'neutral';
      value: number;
      interpretation: string;
    }[];
  };
  timestamp: Date;
}

class ChartingService {
  private static instance: ChartingService;
  private chartData: Map<string, Map<string, ChartDataPoint[]>> = new Map(); // symbol -> timeframe -> data
  private indicators: Map<string, TechnicalIndicator[]> = new Map(); // symbol -> indicators
  private annotations: Map<string, ChartAnnotation[]> = new Map(); // symbol -> annotations
  private templates: Map<string, ChartTemplate> = new Map();
  private priceAlerts: Map<string, PriceAlert[]> = new Map();
  private chartStudies: Map<string, ChartStudy[]> = new Map();
  private marketProfiles: Map<string, MarketProfile[]> = new Map();
  private subscribers: Map<string, (data: any) => void> = new Map();
  private defaultSettings: ChartSettings;

  private constructor() {
    this.defaultSettings = {
      chartType: 'candlestick',
      timeframe: '1d',
      theme: 'dark',
      showVolume: true,
      showGrid: true,
      showCrosshair: true,
      showLastPrice: true,
      autoScale: true,
      logScale: false,
      indicators: [],
      overlays: [],
      colors: {
        background: '#1a1a1a',
        grid: '#333333',
        text: '#ffffff',
        bullish: '#00ff88',
        bearish: '#ff4444',
        volume: '#666666',
        crosshair: '#888888'
      },
      fontSize: 12,
      lineWidth: 1
    };

    this.loadStoredData();
    this.initializeDefaultTemplates();
  }

  public static getInstance(): ChartingService {
    if (!ChartingService.instance) {
      ChartingService.instance = new ChartingService();
    }
    return ChartingService.instance;
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

  // Chart Data Management
  public async loadChartData(symbol: string, timeframe: string, startDate?: Date, endDate?: Date): Promise<ChartDataPoint[]> {
    const key = symbol.toUpperCase();
    
    if (!this.chartData.has(key)) {
      this.chartData.set(key, new Map());
    }
    
    const symbolData = this.chartData.get(key)!;
    
    if (!symbolData.has(timeframe)) {
      // In a real implementation, this would fetch from NEPSE API
      const mockData = this.generateMockChartData(symbol, timeframe, startDate, endDate);
      symbolData.set(timeframe, mockData);
    }
    
    let data = symbolData.get(timeframe)!;
    
    // Filter by date range if provided
    if (startDate || endDate) {
      data = data.filter(point => {
        const timestamp = point.timestamp.getTime();
        const start = startDate ? startDate.getTime() : 0;
        const end = endDate ? endDate.getTime() : Date.now();
        return timestamp >= start && timestamp <= end;
      });
    }
    
    this.notifySubscribers('chart_data_loaded', { symbol, timeframe, data });
    return data;
  }

  private generateMockChartData(symbol: string, timeframe: string, startDate?: Date, endDate?: Date): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const end = endDate || new Date();
    const start = startDate || new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago
    
    const timeframeMs = this.getTimeframeMilliseconds(timeframe);
    let currentTime = start.getTime();
    let currentPrice = 100 + Math.random() * 900; // Random starting price
    
    while (currentTime <= end.getTime()) {
      const volatility = 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility * currentPrice;
      
      const open = currentPrice;
      const close = Math.max(1, currentPrice + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 100000) + 1000;
      
      data.push({
        timestamp: new Date(currentTime),
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume,
        value: close
      });
      
      currentPrice = close;
      currentTime += timeframeMs;
    }
    
    return data;
  }

  private getTimeframeMilliseconds(timeframe: string): number {
    const timeframes: { [key: string]: number } = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000,
      '1M': 30 * 24 * 60 * 60 * 1000
    };
    
    return timeframes[timeframe] || timeframes['1d'];
  }

  // Technical Indicators
  public addIndicator(symbol: string, indicatorName: string, parameters: any = {}): TechnicalIndicator {
    const key = symbol.toUpperCase();
    
    if (!this.indicators.has(key)) {
      this.indicators.set(key, []);
    }
    
    const indicators = this.indicators.get(key)!;
    
    // Remove existing indicator of the same type
    const existingIndex = indicators.findIndex(ind => ind.name === indicatorName);
    if (existingIndex !== -1) {
      indicators.splice(existingIndex, 1);
    }
    
    const indicator = this.calculateIndicator(symbol, indicatorName, parameters);
    indicators.push(indicator);
    
    this.saveIndicatorsToStorage();
    this.notifySubscribers('indicator_added', { symbol, indicator });
    
    return indicator;
  }

  public removeIndicator(symbol: string, indicatorName: string): boolean {
    const key = symbol.toUpperCase();
    const indicators = this.indicators.get(key);
    
    if (!indicators) return false;
    
    const index = indicators.findIndex(ind => ind.name === indicatorName);
    if (index === -1) return false;
    
    indicators.splice(index, 1);
    this.saveIndicatorsToStorage();
    this.notifySubscribers('indicator_removed', { symbol, indicatorName });
    
    return true;
  }

  public getIndicators(symbol: string): TechnicalIndicator[] {
    return this.indicators.get(symbol.toUpperCase()) || [];
  }

  private calculateIndicator(symbol: string, name: string, parameters: any): TechnicalIndicator {
    const chartData = this.chartData.get(symbol.toUpperCase())?.get('1d') || [];
    
    switch (name) {
      case 'SMA':
        return this.calculateSMA(chartData, parameters.period || 20);
      case 'EMA':
        return this.calculateEMA(chartData, parameters.period || 20);
      case 'RSI':
        return this.calculateRSI(chartData, parameters.period || 14);
      case 'MACD':
        return this.calculateMACD(chartData, parameters.fast || 12, parameters.slow || 26, parameters.signal || 9);
      case 'Bollinger Bands':
        return this.calculateBollingerBands(chartData, parameters.period || 20, parameters.deviation || 2);
      case 'Stochastic':
        return this.calculateStochastic(chartData, parameters.k || 14, parameters.d || 3);
      case 'Williams %R':
        return this.calculateWilliamsR(chartData, parameters.period || 14);
      case 'ATR':
        return this.calculateATR(chartData, parameters.period || 14);
      case 'Volume SMA':
        return this.calculateVolumeSMA(chartData, parameters.period || 20);
      default:
        throw new Error(`Unknown indicator: ${name}`);
    }
  }

  private calculateSMA(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'SMA',
      type: 'overlay',
      data: [],
      parameters: { period },
      color: '#ffaa00',
      visible: true
    };
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.close, 0);
      const sma = sum / period;
      
      result.data.push({
        timestamp: data[i].timestamp,
        value: Math.round(sma * 100) / 100
      });
    }
    
    return result;
  }

  private calculateEMA(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'EMA',
      type: 'overlay',
      data: [],
      parameters: { period },
      color: '#00aaff',
      visible: true
    };
    
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;
    
    result.data.push({
      timestamp: data[0].timestamp,
      value: Math.round(ema * 100) / 100
    });
    
    for (let i = 1; i < data.length; i++) {
      ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
      
      result.data.push({
        timestamp: data[i].timestamp,
        value: Math.round(ema * 100) / 100
      });
    }
    
    return result;
  }

  private calculateRSI(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'RSI',
      type: 'oscillator',
      data: [],
      parameters: { period },
      color: '#ff6600',
      visible: true
    };
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      result.data.push({
        timestamp: data[i + 1].timestamp,
        value: Math.round(rsi * 100) / 100
      });
    }
    
    return result;
  }

  private calculateMACD(data: ChartDataPoint[], fastPeriod: number, slowPeriod: number, signalPeriod: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'MACD',
      type: 'oscillator',
      data: [],
      parameters: { fastPeriod, slowPeriod, signalPeriod },
      color: '#00ff88',
      visible: true
    };
    
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    const macdLine: number[] = [];
    const startIndex = Math.max(fastEMA.data.length, slowEMA.data.length) - Math.min(fastEMA.data.length, slowEMA.data.length);
    
    for (let i = startIndex; i < Math.min(fastEMA.data.length, slowEMA.data.length); i++) {
      const macd = fastEMA.data[i].value - slowEMA.data[i].value;
      macdLine.push(macd);
    }
    
    // Calculate signal line (EMA of MACD line)
    const signalMultiplier = 2 / (signalPeriod + 1);
    let signalEMA = macdLine[0];
    
    for (let i = 0; i < macdLine.length; i++) {
      if (i === 0) {
        signalEMA = macdLine[i];
      } else {
        signalEMA = (macdLine[i] * signalMultiplier) + (signalEMA * (1 - signalMultiplier));
      }
      
      const histogram = macdLine[i] - signalEMA;
      
      result.data.push({
        timestamp: data[startIndex + i].timestamp,
        value: Math.round(macdLine[i] * 100) / 100,
        signal: Math.round(signalEMA * 100) / 100,
        histogram: Math.round(histogram * 100) / 100
      });
    }
    
    return result;
  }

  private calculateBollingerBands(data: ChartDataPoint[], period: number, deviation: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'Bollinger Bands',
      type: 'overlay',
      data: [],
      parameters: { period, deviation },
      color: '#aa88ff',
      visible: true
    };
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sma = slice.reduce((acc, point) => acc + point.close, 0) / period;
      
      const variance = slice.reduce((acc, point) => acc + Math.pow(point.close - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      const upper = sma + (stdDev * deviation);
      const lower = sma - (stdDev * deviation);
      
      result.data.push({
        timestamp: data[i].timestamp,
        value: Math.round(sma * 100) / 100,
        upper: Math.round(upper * 100) / 100,
        lower: Math.round(lower * 100) / 100,
        middle: Math.round(sma * 100) / 100
      });
    }
    
    return result;
  }

  private calculateStochastic(data: ChartDataPoint[], kPeriod: number, dPeriod: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'Stochastic',
      type: 'oscillator',
      data: [],
      parameters: { kPeriod, dPeriod },
      color: '#ff8800',
      visible: true
    };
    
    const kValues: number[] = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(p => p.high));
      const lowest = Math.min(...slice.map(p => p.low));
      const current = data[i].close;
      
      const k = ((current - lowest) / (highest - lowest)) * 100;
      kValues.push(k);
    }
    
    // Calculate %D (SMA of %K)
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const k = kValues[i];
      const d = kValues.slice(i - dPeriod + 1, i + 1).reduce((a, b) => a + b, 0) / dPeriod;
      
      result.data.push({
        timestamp: data[kPeriod - 1 + i].timestamp,
        value: Math.round(k * 100) / 100,
        signal: Math.round(d * 100) / 100
      });
    }
    
    return result;
  }

  private calculateWilliamsR(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'Williams %R',
      type: 'oscillator',
      data: [],
      parameters: { period },
      color: '#ff4488',
      visible: true
    };
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const highest = Math.max(...slice.map(p => p.high));
      const lowest = Math.min(...slice.map(p => p.low));
      const current = data[i].close;
      
      const williamsR = ((highest - current) / (highest - lowest)) * -100;
      
      result.data.push({
        timestamp: data[i].timestamp,
        value: Math.round(williamsR * 100) / 100
      });
    }
    
    return result;
  }

  private calculateATR(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'ATR',
      type: 'oscillator',
      data: [],
      parameters: { period },
      color: '#88ff44',
      visible: true
    };
    
    const trueRanges: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      const tr1 = current.high - current.low;
      const tr2 = Math.abs(current.high - previous.close);
      const tr3 = Math.abs(current.low - previous.close);
      
      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }
    
    // Calculate ATR (SMA of True Range)
    for (let i = period - 1; i < trueRanges.length; i++) {
      const atr = trueRanges.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      result.data.push({
        timestamp: data[i + 1].timestamp,
        value: Math.round(atr * 100) / 100
      });
    }
    
    return result;
  }

  private calculateVolumeSMA(data: ChartDataPoint[], period: number): TechnicalIndicator {
    const result: TechnicalIndicator = {
      name: 'Volume SMA',
      type: 'volume',
      data: [],
      parameters: { period },
      color: '#666666',
      visible: true
    };
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.volume, 0);
      const sma = sum / period;
      
      result.data.push({
        timestamp: data[i].timestamp,
        value: Math.round(sma)
      });
    }
    
    return result;
  }

  // Chart Annotations
  public addAnnotation(symbol: string, annotation: Omit<ChartAnnotation, 'id' | 'timestamp'>): string {
    const key = symbol.toUpperCase();
    const id = `annotation_${Date.now()}_${Math.random()}`;
    
    const newAnnotation: ChartAnnotation = {
      ...annotation,
      id,
      timestamp: new Date()
    };
    
    if (!this.annotations.has(key)) {
      this.annotations.set(key, []);
    }
    
    this.annotations.get(key)!.push(newAnnotation);
    this.saveAnnotationsToStorage();
    this.notifySubscribers('annotation_added', { symbol, annotation: newAnnotation });
    
    return id;
  }

  public removeAnnotation(symbol: string, annotationId: string): boolean {
    const key = symbol.toUpperCase();
    const annotations = this.annotations.get(key);
    
    if (!annotations) return false;
    
    const index = annotations.findIndex(ann => ann.id === annotationId);
    if (index === -1) return false;
    
    annotations.splice(index, 1);
    this.saveAnnotationsToStorage();
    this.notifySubscribers('annotation_removed', { symbol, annotationId });
    
    return true;
  }

  public getAnnotations(symbol: string): ChartAnnotation[] {
    return this.annotations.get(symbol.toUpperCase()) || [];
  }

  // Chart Templates
  public saveTemplate(template: Omit<ChartTemplate, 'id' | 'createdAt'>): string {
    const id = `template_${Date.now()}_${Math.random()}`;
    const newTemplate: ChartTemplate = {
      ...template,
      id,
      createdAt: new Date()
    };
    
    this.templates.set(id, newTemplate);
    this.saveTemplatesToStorage();
    this.notifySubscribers('template_saved', newTemplate);
    
    return id;
  }

  public loadTemplate(templateId: string, symbol: string): boolean {
    const template = this.templates.get(templateId);
    if (!template) return false;
    
    const key = symbol.toUpperCase();
    
    // Apply indicators
    this.indicators.set(key, [...template.indicators]);
    
    // Apply annotations
    this.annotations.set(key, [...template.annotations]);
    
    this.notifySubscribers('template_loaded', { symbol, template });
    return true;
  }

  public getTemplates(category?: string): ChartTemplate[] {
    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    
    return templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public deleteTemplate(templateId: string): boolean {
    const deleted = this.templates.delete(templateId);
    if (deleted) {
      this.saveTemplatesToStorage();
      this.notifySubscribers('template_deleted', { templateId });
    }
    return deleted;
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: Omit<ChartTemplate, 'id' | 'createdAt'>[] = [
      {
        name: 'Technical Analysis',
        description: 'Basic technical analysis setup with moving averages and RSI',
        settings: {
          ...this.defaultSettings,
          indicators: ['SMA', 'EMA', 'RSI'],
          overlays: ['SMA', 'EMA']
        },
        indicators: [],
        annotations: [],
        isDefault: true,
        category: 'technical'
      },
      {
        name: 'Momentum Trading',
        description: 'Setup for momentum trading with MACD and Stochastic',
        settings: {
          ...this.defaultSettings,
          indicators: ['MACD', 'Stochastic', 'RSI'],
          overlays: ['EMA']
        },
        indicators: [],
        annotations: [],
        isDefault: true,
        category: 'technical'
      },
      {
        name: 'Volatility Analysis',
        description: 'Bollinger Bands and ATR for volatility analysis',
        settings: {
          ...this.defaultSettings,
          indicators: ['Bollinger Bands', 'ATR'],
          overlays: ['Bollinger Bands']
        },
        indicators: [],
        annotations: [],
        isDefault: true,
        category: 'technical'
      }
    ];
    
    defaultTemplates.forEach(template => {
      if (!Array.from(this.templates.values()).some(t => t.name === template.name && t.isDefault)) {
        this.saveTemplate(template);
      }
    });
  }

  // Chart Analysis
  public analyzeChart(symbol: string, timeframe: string): ChartAnalysis {
    const chartData = this.chartData.get(symbol.toUpperCase())?.get(timeframe) || [];
    const indicators = this.getIndicators(symbol);
    
    if (chartData.length === 0) {
      throw new Error('No chart data available for analysis');
    }
    
    const analysis: ChartAnalysis = {
      symbol: symbol.toUpperCase(),
      timeframe,
      analysis: {
        trend: this.analyzeTrend(chartData),
        support: this.findSupportLevels(chartData),
        resistance: this.findResistanceLevels(chartData),
        patterns: this.detectPatterns(chartData),
        indicators: this.analyzeIndicators(indicators)
      },
      timestamp: new Date()
    };
    
    this.notifySubscribers('chart_analyzed', analysis);
    return analysis;
  }

  private analyzeTrend(data: ChartDataPoint[]): ChartAnalysis['analysis']['trend'] {
    if (data.length < 20) {
      return { direction: 'sideways', strength: 'weak', confidence: 0 };
    }
    
    const recent = data.slice(-20);
    const firstPrice = recent[0].close;
    const lastPrice = recent[recent.length - 1].close;
    const change = (lastPrice - firstPrice) / firstPrice;
    
    let direction: 'bullish' | 'bearish' | 'sideways';
    let strength: 'strong' | 'moderate' | 'weak';
    
    if (Math.abs(change) < 0.02) {
      direction = 'sideways';
      strength = 'weak';
    } else if (change > 0) {
      direction = 'bullish';
      strength = change > 0.1 ? 'strong' : change > 0.05 ? 'moderate' : 'weak';
    } else {
      direction = 'bearish';
      strength = change < -0.1 ? 'strong' : change < -0.05 ? 'moderate' : 'weak';
    }
    
    const confidence = Math.min(Math.abs(change) * 500, 100);
    
    return { direction, strength, confidence: Math.round(confidence) };
  }

  private findSupportLevels(data: ChartDataPoint[]): number[] {
    const lows = data.map(d => d.low).sort((a, b) => a - b);
    const supports: number[] = [];
    
    // Find significant low levels
    for (let i = 0; i < lows.length; i += Math.floor(lows.length / 5)) {
      if (lows[i] && !supports.some(s => Math.abs(s - lows[i]) < lows[i] * 0.02)) {
        supports.push(Math.round(lows[i] * 100) / 100);
      }
    }
    
    return supports.slice(0, 3); // Return top 3 support levels
  }

  private findResistanceLevels(data: ChartDataPoint[]): number[] {
    const highs = data.map(d => d.high).sort((a, b) => b - a);
    const resistances: number[] = [];
    
    // Find significant high levels
    for (let i = 0; i < highs.length; i += Math.floor(highs.length / 5)) {
      if (highs[i] && !resistances.some(r => Math.abs(r - highs[i]) < highs[i] * 0.02)) {
        resistances.push(Math.round(highs[i] * 100) / 100);
      }
    }
    
    return resistances.slice(0, 3); // Return top 3 resistance levels
  }

  private detectPatterns(data: ChartDataPoint[]): ChartAnalysis['analysis']['patterns'] {
    const patterns: ChartAnalysis['analysis']['patterns'] = [];
    
    // Simple pattern detection (in a real implementation, this would be more sophisticated)
    if (data.length >= 10) {
      const recent = data.slice(-10);
      const trend = this.analyzeTrend(recent);
      
      if (trend.direction === 'bullish' && trend.strength === 'strong') {
        patterns.push({
          name: 'Bullish Trend',
          type: 'bullish',
          confidence: trend.confidence,
          target: recent[recent.length - 1].close * 1.1,
          stopLoss: recent[recent.length - 1].close * 0.95
        });
      } else if (trend.direction === 'bearish' && trend.strength === 'strong') {
        patterns.push({
          name: 'Bearish Trend',
          type: 'bearish',
          confidence: trend.confidence,
          target: recent[recent.length - 1].close * 0.9,
          stopLoss: recent[recent.length - 1].close * 1.05
        });
      }
    }
    
    return patterns;
  }

  private analyzeIndicators(indicators: TechnicalIndicator[]): ChartAnalysis['analysis']['indicators'] {
    const analysis: ChartAnalysis['analysis']['indicators'] = [];
    
    indicators.forEach(indicator => {
      if (indicator.data.length === 0) return;
      
      const latest = indicator.data[indicator.data.length - 1];
      
      switch (indicator.name) {
        case 'RSI':
          let rsiSignal: 'buy' | 'sell' | 'neutral' = 'neutral';
          let rsiInterpretation = 'Neutral momentum';
          
          if (latest.value < 30) {
            rsiSignal = 'buy';
            rsiInterpretation = 'Oversold condition - potential buying opportunity';
          } else if (latest.value > 70) {
            rsiSignal = 'sell';
            rsiInterpretation = 'Overbought condition - potential selling opportunity';
          }
          
          analysis.push({
            name: 'RSI',
            signal: rsiSignal,
            value: latest.value,
            interpretation: rsiInterpretation
          });
          break;
          
        case 'MACD':
          let macdSignal: 'buy' | 'sell' | 'neutral' = 'neutral';
          let macdInterpretation = 'Neutral momentum';
          
          if (latest.value && latest.signal) {
            if (latest.value > latest.signal) {
              macdSignal = 'buy';
              macdInterpretation = 'MACD above signal line - bullish momentum';
            } else {
              macdSignal = 'sell';
              macdInterpretation = 'MACD below signal line - bearish momentum';
            }
          }
          
          analysis.push({
            name: 'MACD',
            signal: macdSignal,
            value: latest.value || 0,
            interpretation: macdInterpretation
          });
          break;
      }
    });
    
    return analysis;
  }

  // Price Alerts
  public createPriceAlert(symbol: string, price: number, condition: 'above' | 'below'): string {
    const key = symbol.toUpperCase();
    const id = `alert_${Date.now()}_${Math.random()}`;
    
    const alert: PriceAlert = {
      id,
      symbol: key,
      price,
      condition,
      isActive: true,
      createdAt: new Date()
    };
    
    if (!this.priceAlerts.has(key)) {
      this.priceAlerts.set(key, []);
    }
    
    this.priceAlerts.get(key)!.push(alert);
    this.savePriceAlertsToStorage();
    this.notifySubscribers('price_alert_created', alert);
    
    return id;
  }

  public getPriceAlerts(symbol?: string): PriceAlert[] {
    if (symbol) {
      return this.priceAlerts.get(symbol.toUpperCase()) || [];
    }
    
    const allAlerts: PriceAlert[] = [];
    this.priceAlerts.forEach(alerts => allAlerts.push(...alerts));
    return allAlerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public deletePriceAlert(symbol: string, alertId: string): boolean {
    const key = symbol.toUpperCase();
    const alerts = this.priceAlerts.get(key);
    
    if (!alerts) return false;
    
    const index = alerts.findIndex(alert => alert.id === alertId);
    if (index === -1) return false;
    
    alerts.splice(index, 1);
    this.savePriceAlertsToStorage();
    this.notifySubscribers('price_alert_deleted', { symbol, alertId });
    
    return true;
  }

  // Utility Methods
  public getAvailableIndicators(): { name: string; type: string; description: string; parameters: any }[] {
    return [
      {
        name: 'SMA',
        type: 'overlay',
        description: 'Simple Moving Average',
        parameters: { period: { type: 'number', default: 20, min: 1, max: 200 } }
      },
      {
        name: 'EMA',
        type: 'overlay',
        description: 'Exponential Moving Average',
        parameters: { period: { type: 'number', default: 20, min: 1, max: 200 } }
      },
      {
        name: 'RSI',
        type: 'oscillator',
        description: 'Relative Strength Index',
        parameters: { period: { type: 'number', default: 14, min: 2, max: 50 } }
      },
      {
        name: 'MACD',
        type: 'oscillator',
        description: 'Moving Average Convergence Divergence',
        parameters: {
          fast: { type: 'number', default: 12, min: 1, max: 50 },
          slow: { type: 'number', default: 26, min: 1, max: 100 },
          signal: { type: 'number', default: 9, min: 1, max: 50 }
        }
      },
      {
        name: 'Bollinger Bands',
        type: 'overlay',
        description: 'Bollinger Bands',
        parameters: {
          period: { type: 'number', default: 20, min: 2, max: 100 },
          deviation: { type: 'number', default: 2, min: 0.1, max: 5 }
        }
      },
      {
        name: 'Stochastic',
        type: 'oscillator',
        description: 'Stochastic Oscillator',
        parameters: {
          k: { type: 'number', default: 14, min: 1, max: 50 },
          d: { type: 'number', default: 3, min: 1, max: 20 }
        }
      },
      {
        name: 'Williams %R',
        type: 'oscillator',
        description: 'Williams %R',
        parameters: { period: { type: 'number', default: 14, min: 1, max: 50 } }
      },
      {
        name: 'ATR',
        type: 'oscillator',
        description: 'Average True Range',
        parameters: { period: { type: 'number', default: 14, min: 1, max: 50 } }
      },
      {
        name: 'Volume SMA',
        type: 'volume',
        description: 'Volume Simple Moving Average',
        parameters: { period: { type: 'number', default: 20, min: 1, max: 100 } }
      }
    ];
  }

  public getDefaultSettings(): ChartSettings {
    return { ...this.defaultSettings };
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
      const [indicatorsData, annotationsData, templatesData, alertsData] = await Promise.all([
        AsyncStorage.getItem('chart_indicators'),
        AsyncStorage.getItem('chart_annotations'),
        AsyncStorage.getItem('chart_templates'),
        AsyncStorage.getItem('chart_price_alerts')
      ]);

      if (indicatorsData) {
        const indicators = JSON.parse(indicatorsData);
        Object.entries(indicators).forEach(([symbol, inds]: [string, any]) => {
          this.indicators.set(symbol, inds.map((ind: any) => ({
            ...ind,
            data: ind.data.map((d: any) => ({
              ...d,
              timestamp: new Date(d.timestamp)
            }))
          })));
        });
      }

      if (annotationsData) {
        const annotations = JSON.parse(annotationsData);
        Object.entries(annotations).forEach(([symbol, anns]: [string, any]) => {
          this.annotations.set(symbol, anns.map((ann: any) => ({
            ...ann,
            timestamp: new Date(ann.timestamp)
          })));
        });
      }

      if (templatesData) {
        const templates = JSON.parse(templatesData);
        templates.forEach((template: any) => {
          template.createdAt = new Date(template.createdAt);
          this.templates.set(template.id, template);
        });
      }

      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        Object.entries(alerts).forEach(([symbol, alts]: [string, any]) => {
          this.priceAlerts.set(symbol, alts.map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
            triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined
          })));
        });
      }
    } catch (error) {
      console.error('Failed to load charting data:', error);
    }
  }

  private async saveIndicatorsToStorage(): Promise<void> {
    try {
      const indicators: { [key: string]: any } = {};
      this.indicators.forEach((value, key) => {
        indicators[key] = value;
      });
      await AsyncStorage.setItem('chart_indicators', JSON.stringify(indicators));
    } catch (error) {
      console.error('Failed to save indicators:', error);
    }
  }

  private async saveAnnotationsToStorage(): Promise<void> {
    try {
      const annotations: { [key: string]: any } = {};
      this.annotations.forEach((value, key) => {
        annotations[key] = value;
      });
      await AsyncStorage.setItem('chart_annotations', JSON.stringify(annotations));
    } catch (error) {
      console.error('Failed to save annotations:', error);
    }
  }

  private async saveTemplatesToStorage(): Promise<void> {
    try {
      const templates = Array.from(this.templates.values());
      await AsyncStorage.setItem('chart_templates', JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  private async savePriceAlertsToStorage(): Promise<void> {
    try {
      const alerts: { [key: string]: any } = {};
      this.priceAlerts.forEach((value, key) => {
        alerts[key] = value;
      });
      await AsyncStorage.setItem('chart_price_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save price alerts:', error);
    }
  }

  // Cleanup
  public cleanup(): void {
    this.subscribers.clear();
    this.chartData.clear();
    this.indicators.clear();
    this.annotations.clear();
    this.priceAlerts.clear();
    this.chartStudies.clear();
    this.marketProfiles.clear();
  }
}

export default ChartingService;
export type {
  ChartDataPoint,
  TechnicalIndicator,
  ChartAnnotation,
  ChartSettings,
  ChartTemplate,
  PriceAlert,
  ChartStudy,
  MarketProfile,
  ChartAnalysis
};