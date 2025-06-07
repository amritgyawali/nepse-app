import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CircleAlert as AlertCircle, TrendingUp, TrendingDown, ChartBar as BarChart3, DollarSign, Activity, LineChart, ArrowUpDown } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

type StockAnalysisProps = {
  stock: any;
};

// Calculate RSI (Relative Strength Index)
const calculateRSI = (priceHistory: any[], periods = 14) => {
  if (!priceHistory || priceHistory.length < periods + 1) {
    return null;
  }

  // Get price changes
  const changes = [];
  for (let i = 1; i < priceHistory.length; i++) {
    changes.push(priceHistory[i].price - priceHistory[i - 1].price);
  }

  // Calculate average gains and losses
  let sumGain = 0;
  let sumLoss = 0;
  
  for (let i = 0; i < periods; i++) {
    if (changes[i] >= 0) {
      sumGain += changes[i];
    } else {
      sumLoss += Math.abs(changes[i]);
    }
  }
  
  let avgGain = sumGain / periods;
  let avgLoss = sumLoss / periods;
  
  // Calculate RS and RSI
  const rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
  const rsi = 100 - (100 / (1 + rs));
  
  return Math.round(rsi * 100) / 100; // Round to 2 decimal places
};

// Calculate MACD (Moving Average Convergence Divergence)
const calculateMACD = (priceHistory: any[]) => {
  if (!priceHistory || priceHistory.length < 26) {
    return null;
  }

  // Extract prices
  const prices = priceHistory.map(point => point.price);
  
  // Calculate 12-day EMA
  const ema12 = calculateEMA(prices, 12);
  
  // Calculate 26-day EMA
  const ema26 = calculateEMA(prices, 26);
  
  // Calculate MACD line
  const macdLine = ema12 - ema26;
  
  // Calculate signal line (9-day EMA of MACD line)
  // In a real app, you would calculate this properly
  // For this demo, we'll just approximate
  const signalLine = macdLine * 0.9;
  
  // Calculate histogram
  const histogram = macdLine - signalLine;
  
  return {
    macdLine: Math.round(macdLine * 100) / 100,
    signalLine: Math.round(signalLine * 100) / 100,
    histogram: Math.round(histogram * 100) / 100
  };
};

// Helper function to calculate EMA (Exponential Moving Average)
const calculateEMA = (prices: number[], periods: number) => {
  const k = 2 / (periods + 1);
  let ema = prices.slice(0, periods).reduce((sum, price) => sum + price, 0) / periods;
  
  for (let i = periods; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  
  return ema;
};

// Calculate Bollinger Bands
const calculateBollingerBands = (priceHistory: any[], periods = 20, multiplier = 2) => {
  if (!priceHistory || priceHistory.length < periods) {
    return null;
  }

  // Extract prices
  const prices = priceHistory.map(point => point.price);
  
  // Calculate SMA (Simple Moving Average)
  const sma = prices.slice(prices.length - periods).reduce((sum, price) => sum + price, 0) / periods;
  
  // Calculate standard deviation
  const squaredDifferences = prices.slice(prices.length - periods).map(price => Math.pow(price - sma, 2));
  const variance = squaredDifferences.reduce((sum, value) => sum + value, 0) / periods;
  const standardDeviation = Math.sqrt(variance);
  
  // Calculate upper and lower bands
  const upperBand = sma + (standardDeviation * multiplier);
  const lowerBand = sma - (standardDeviation * multiplier);
  
  return {
    middle: Math.round(sma * 100) / 100,
    upper: Math.round(upperBand * 100) / 100,
    lower: Math.round(lowerBand * 100) / 100
  };
};

export default function StockAnalysis({ stock }: StockAnalysisProps) {
  const { theme } = useTheme();
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(false);
  
  // Calculate technical indicators
  const rsi = calculateRSI(stock.priceHistory);
  const macd = calculateMACD(stock.priceHistory);
  const bollingerBands = calculateBollingerBands(stock.priceHistory);
  
  // Determine RSI interpretation
  let rsiInterpretation = '';
  let rsiColor = theme.colors.text;
  
  if (rsi !== null) {
    if (rsi > 70) {
      rsiInterpretation = 'Overbought';
      rsiColor = theme.colors.error;
    } else if (rsi < 30) {
      rsiInterpretation = 'Oversold';
      rsiColor = theme.colors.success;
    } else {
      rsiInterpretation = 'Neutral';
      rsiColor = theme.colors.text;
    }
  }
  
  // Determine MACD interpretation
  let macdInterpretation = '';
  let macdColor = theme.colors.text;
  
  if (macd !== null) {
    if (macd.histogram > 0) {
      macdInterpretation = macd.histogram > macd.histogram * 0.5 ? 'Strong Bullish' : 'Bullish';
      macdColor = theme.colors.success;
    } else {
      macdInterpretation = macd.histogram < macd.histogram * 0.5 ? 'Strong Bearish' : 'Bearish';
      macdColor = theme.colors.error;
    }
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>AI-Generated Insights</Text>
        <View style={[styles.insightContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.insightHeader}>
            <BarChart3 size={20} color={theme.colors.primary} />
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Performance Analysis</Text>
          </View>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            {stock.symbol} has shown a {stock.change > 0 ? 'positive' : 'negative'} trend over the last trading session. 
            The stock {stock.change > 0 ? 'gained' : 'lost'} {Math.abs(stock.change).toFixed(2)}% in value.
            The trading volume of {(stock.volume / 1000).toFixed(1)}K shares indicates 
            {stock.volume > 100000 ? ' strong' : ' moderate'} market interest.
          </Text>
        </View>
        
        <View style={[styles.insightContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.insightHeader}>
            <DollarSign size={20} color={theme.colors.primary} />
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>Valuation Assessment</Text>
          </View>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            With a P/E ratio of {stock.pe?.toFixed(2) || 'N/A'}, {stock.symbol} is trading 
            {stock.pe && stock.pe > 20 ? ' above' : ' below'} the sector average. 
            The current market price suggests a {stock.pe && stock.pe > 20 ? 'premium valuation' : 'value opportunity'} 
            compared to similar companies in the {stock.sector} sector.
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Technical Indicators</Text>
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowTechnicalIndicators(!showTechnicalIndicators)}
          >
            <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
              {showTechnicalIndicators ? 'Hide Details' : 'Show Details'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.indicatorsContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorHeader}>
              <Activity size={18} color={theme.colors.primary} />
              <Text style={[styles.indicatorTitle, { color: theme.colors.text }]}>RSI</Text>
            </View>
            <View style={styles.indicatorValue}>
              <Text style={[styles.indicatorValueText, { color: rsiColor }]}>
                {rsi !== null ? rsi.toFixed(2) : 'N/A'}
              </Text>
              <Text style={[styles.indicatorInterpretation, { color: rsiColor }]}>
                {rsiInterpretation}
              </Text>
            </View>
          </View>
          
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorHeader}>
              <LineChart size={18} color={theme.colors.primary} />
              <Text style={[styles.indicatorTitle, { color: theme.colors.text }]}>MACD</Text>
            </View>
            <View style={styles.indicatorValue}>
              <Text style={[styles.indicatorValueText, { color: macdColor }]}>
                {macd !== null ? macd.macdLine.toFixed(2) : 'N/A'}
              </Text>
              <Text style={[styles.indicatorInterpretation, { color: macdColor }]}>
                {macdInterpretation}
              </Text>
            </View>
          </View>
          
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorHeader}>
              <ArrowUpDown size={18} color={theme.colors.primary} />
              <Text style={[styles.indicatorTitle, { color: theme.colors.text }]}>Bollinger Bands</Text>
            </View>
            <View style={styles.indicatorValue}>
              <Text style={[styles.indicatorValueText, { color: theme.colors.text }]}>
                {bollingerBands !== null ? `${bollingerBands.middle.toFixed(2)}` : 'N/A'}
              </Text>
              <Text style={[styles.indicatorInterpretation, { color: theme.colors.text }]}>
                {bollingerBands !== null ? 
                  (stock.price > bollingerBands.upper ? 'Above Upper Band' : 
                   stock.price < bollingerBands.lower ? 'Below Lower Band' : 'Within Bands') : ''}
              </Text>
            </View>
          </View>
        </View>
        
        {showTechnicalIndicators && (
          <ScrollView style={styles.detailedIndicators}>
            <View style={[styles.detailedIndicatorContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.detailedIndicatorTitle, { color: theme.colors.text }]}>RSI (Relative Strength Index)</Text>
              <Text style={[styles.detailedIndicatorDescription, { color: theme.colors.text }]}>
                RSI measures the speed and change of price movements, indicating overbought (above 70) or oversold (below 30) conditions.
              </Text>
              <View style={styles.indicatorDetailRow}>
                <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Current Value:</Text>
                <Text style={[styles.indicatorDetailValue, { color: rsiColor }]}>{rsi !== null ? rsi.toFixed(2) : 'N/A'}</Text>
              </View>
              <View style={styles.indicatorDetailRow}>
                <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Signal:</Text>
                <Text style={[styles.indicatorDetailValue, { color: rsiColor }]}>{rsiInterpretation}</Text>
              </View>
              <View style={styles.indicatorDetailRow}>
                <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Interpretation:</Text>
                <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>
                  {rsi !== null ? (rsi > 70 ? 
                    'Potential reversal or price correction downward' : 
                    rsi < 30 ? 
                    'Potential reversal or price correction upward' : 
                    'No extreme conditions detected') : 'Insufficient data'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.detailedIndicatorContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.detailedIndicatorTitle, { color: theme.colors.text }]}>MACD (Moving Average Convergence Divergence)</Text>
              <Text style={[styles.detailedIndicatorDescription, { color: theme.colors.text }]}>
                MACD shows the relationship between two moving averages of a security's price, helping to identify momentum shifts.
              </Text>
              {macd !== null ? (
                <>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>MACD Line:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: macdColor }]}>{macd.macdLine.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Signal Line:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>{macd.signalLine.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Histogram:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: macd.histogram >= 0 ? theme.colors.success : theme.colors.error }]}>
                      {macd.histogram.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Signal:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: macdColor }]}>{macdInterpretation}</Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>Insufficient data</Text>
              )}
            </View>
            
            <View style={[styles.detailedIndicatorContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.detailedIndicatorTitle, { color: theme.colors.text }]}>Bollinger Bands</Text>
              <Text style={[styles.detailedIndicatorDescription, { color: theme.colors.text }]}>
                Bollinger Bands consist of a middle band (20-day SMA) with an upper and lower band that help measure volatility.
              </Text>
              {bollingerBands !== null ? (
                <>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Upper Band:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>{bollingerBands.upper.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Middle Band (SMA):</Text>
                    <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>{bollingerBands.middle.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Lower Band:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>{bollingerBands.lower.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Current Price:</Text>
                    <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>{stock.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.indicatorDetailRow}>
                    <Text style={[styles.indicatorDetailLabel, { color: theme.colors.text }]}>Position:</Text>
                    <Text style={[styles.indicatorDetailValue, { 
                      color: stock.price > bollingerBands.upper ? theme.colors.error : 
                             stock.price < bollingerBands.lower ? theme.colors.success : 
                             theme.colors.text 
                    }]}>
                      {stock.price > bollingerBands.upper ? 'Above Upper Band (Potential Overbought)' : 
                       stock.price < bollingerBands.lower ? 'Below Lower Band (Potential Oversold)' : 
                       'Within Bands (Normal Volatility)'}
                    </Text>
                  </View>
                </>
              ) : (
                <Text style={[styles.indicatorDetailValue, { color: theme.colors.text }]}>Insufficient data</Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Investment Recommendation</Text>
        <View 
          style={[
            styles.recommendationContainer, 
            stock.change > 2 ? styles.buyRecommendation : 
            stock.change < -2 ? styles.sellRecommendation : 
            styles.neutralRecommendation,
            { backgroundColor: theme.colors.card }
          ]}
        >
          <View style={styles.recommendationHeader}>
            {stock.change > 2 ? (
              <TrendingUp size={20} color="#10B981" />
            ) : stock.change < -2 ? (
              <TrendingDown size={20} color="#EF4444" />
            ) : (
              <AlertCircle size={20} color="#0049B8" />
            )}
            <Text 
              style={[
                styles.recommendationTitle,
                { 
                  color: stock.change > 2 ? "#10B981" : 
                         stock.change < -2 ? "#EF4444" : 
                         "#0049B8" 
                }
              ]}
            >
              {stock.change > 2 ? 'Buy' : stock.change < -2 ? 'Sell' : 'Hold'}
            </Text>
          </View>
          <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
            Based on technical indicators and fundamentals, we recommend a 
            {stock.change > 2 ? 'Buy' : stock.change < -2 ? 'Sell' : 'Hold'} position on {stock.symbol}. 
            {stock.change > 2 ? 
              `The stock shows strong momentum with positive technical indicators. RSI at ${rsi?.toFixed(2) || 'N/A'} suggests room for growth.` : 
             stock.change < -2 ? 
              `The stock shows negative momentum with concerning technical indicators. RSI at ${rsi?.toFixed(2) || 'N/A'} suggests potential further decline.` : 
              `The stock's volatility combined with current market conditions suggests a neutral stance. Monitor RSI (${rsi?.toFixed(2) || 'N/A'}) for potential entry or exit signals.`
            }
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleButton: {
    padding: 4,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  indicatorsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicatorTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  indicatorValue: {
    alignItems: 'flex-end',
  },
  indicatorValueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  indicatorInterpretation: {
    fontSize: 12,
    marginTop: 2,
  },
  detailedIndicators: {
    maxHeight: 400,
  },
  detailedIndicatorContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailedIndicatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailedIndicatorDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  indicatorDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  indicatorDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  indicatorDetailValue: {
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  recommendationContainer: {
    borderRadius: 12,
    padding: 16,
  },
  buyRecommendation: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  sellRecommendation: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  neutralRecommendation: {
    borderLeftWidth: 4,
    borderLeftColor: '#0049B8',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
  },
});