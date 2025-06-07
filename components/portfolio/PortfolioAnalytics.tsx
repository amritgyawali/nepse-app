import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  TrendingDown,
  BarChart3,
  Shield,
  DollarSign,
  Percent,
  Activity,
  Award,
  Settings,
  Share,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';

import type { 
  NEPSEStock, 
  PortfolioHolding, 
  Transaction, 
  TimeFrame,
  SortOrder,
  RiskLevel 
} from '@/types';

import { useTheme } from '@/hooks/useTheme';
import enhancedMockData from '@/assets/data/enhancedMockData';

const { width: screenWidth } = Dimensions.get('window');

interface ExtendedPortfolioHolding extends PortfolioHolding {
  readonly id: string;
  readonly sector: string;
  readonly marketValue: number;
  readonly totalReturn: number;
  readonly totalReturnPercent: number;
  readonly dayChange: number;
  readonly dayChangePercent: number;
  readonly weight: number;
  readonly riskLevel: RiskLevel;
  readonly beta: number;
  readonly dividendYield: number;
  readonly peRatio: number;
}

interface PortfolioMetrics {
  readonly totalValue: number;
  readonly totalInvested: number;
  readonly totalReturn: number;
  readonly totalReturnPercent: number;
  readonly dayChange: number;
  readonly dayChangePercent: number;
  readonly unrealizedGainLoss: number;
  readonly realizedGainLoss: number;
  readonly dividendIncome: number;
  readonly portfolioBeta: number;
  readonly sharpeRatio: number;
  readonly volatility: number;
  readonly maxDrawdown: number;
  readonly winRate: number;
  readonly avgHoldingPeriod: number;
}

interface SectorAllocation {
  readonly sector: string;
  readonly value: number;
  readonly percentage: number;
  readonly color: string;
  readonly return: number;
  readonly returnPercent: number;
}

interface PerformanceData {
  readonly date: string;
  readonly value: number;
  readonly return: number;
}

type PortfolioTab = 'overview' | 'holdings' | 'performance' | 'analytics';
type SortField = 'value' | 'return' | 'weight';

const timeframes: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const riskColors: Record<RiskLevel, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
} as const;

const sectorColors: readonly string[] = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B',
  '#10B981', '#06B6D4', '#84CC16', '#F97316', '#8B5A2B',
] as const;

export default function PortfolioAnalytics() {

  const { theme } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1M');
  const [selectedTab, setSelectedTab] = useState<PortfolioTab>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [sortBy, setSortBy] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Memoized callbacks for performance
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);
  
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  // Generate mock portfolio data with proper typing
  const portfolioHoldings = useMemo<ExtendedPortfolioHolding[]>(() => {
    // Get a subset of stocks for the portfolio
    const portfolioStocks = enhancedMockData.enhancedStockData.slice(0, 8);
    
    // Create holdings with calculated metrics
    const holdings = portfolioStocks.map((stock: NEPSEStock & { sector: string }) => {
      const quantity = Math.floor(Math.random() * 100) + 10;
      const avgPrice = stock.price * (0.8 + Math.random() * 0.4);
      const marketValue = quantity * stock.price;
      const totalReturn = marketValue - (quantity * avgPrice);
      const totalReturnPercent = (totalReturn / (quantity * avgPrice)) * 100;
      const dayChange = marketValue * (stock.change / 100);
      const dayChangePercent = stock.change;
      
      // Map risk level based on volatility (using change as a proxy)
      let riskLevel: RiskLevel;
      if (Math.abs(stock.change) < 1.5) {
        riskLevel = 'low';
      } else if (Math.abs(stock.change) < 3) {
        riskLevel = 'medium';
      } else {
        riskLevel = 'high';
      }
      
      return {
        id: stock.symbol,
        symbol: stock.symbol,
        name: stock.name,
        quantity,
        avgPrice,
        currentPrice: stock.price,
        sector: stock.sector,
        marketValue,
        totalReturn,
        totalReturnPercent,
        dayChange,
        dayChangePercent,
        weight: 0, // Will be calculated after total portfolio value is known
        riskLevel,
        beta: 0.5 + Math.random() * 1.5,
        dividendYield: Math.random() * 5,
        peRatio: 10 + Math.random() * 30,
        change: stock.change,
        changePercent: stock.change
      };
    });
    
    // Calculate portfolio weights
    const totalValue = holdings.reduce((sum, holding) => sum + holding.marketValue, 0);
    return holdings.map(holding => ({
      ...holding,
      weight: (holding.marketValue / totalValue) * 100
    }));
  }, []);

  // Helper functions for portfolio risk calculations
  const calculatePortfolioVolatility = useCallback((holdings: ExtendedPortfolioHolding[]): number => {
    // Calculate weighted volatility based on stock changes and weights
    const weightedVolatility = holdings.reduce((sum, holding) => {
      // Use change as a proxy for volatility
      const stockVolatility = Math.abs(holding.changePercent) || 1;
      return sum + (stockVolatility * (holding.weight / 100));
    }, 0);
    
    // Scale to a reasonable range (5-20%)
    return 5 + (weightedVolatility * 2);
  }, []);
  
  const calculateMaxDrawdown = useCallback((volatility: number): number => {
    // Estimate max drawdown based on volatility (higher volatility = higher potential drawdown)
    return -(volatility * 1.5);
  }, []);
  
  const calculateSharpeRatio = useCallback((returnPercent: number, volatility: number): number => {
    // Simple Sharpe ratio calculation (return / risk)
    // Assuming risk-free rate of 3%
    const riskFreeRate = 3;
    const excessReturn = returnPercent - riskFreeRate;
    
    // Avoid division by zero
    if (volatility <= 0) return 0;
    
    const ratio = excessReturn / volatility;
    // Normalize to a reasonable range (0.5 - 2.0)
    return Math.max(0.5, Math.min(2.0, ratio + 1));
  }, []);

  // Calculate portfolio metrics with memoization for better performance
  const portfolioMetrics = useMemo<PortfolioMetrics>(() => {
    // Calculate core metrics
    const totalValue = portfolioHoldings.reduce((sum, holding) => sum + holding.marketValue, 0);
    const totalInvested = portfolioHoldings.reduce((sum, holding) => sum + (holding.quantity * holding.avgPrice), 0);
    const totalReturn = totalValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const dayChange = portfolioHoldings.reduce((sum, holding) => sum + holding.dayChange, 0);
    const dayChangePercent = totalValue > 0 ? (dayChange / totalValue) * 100 : 0;
    
    // Update weights
    portfolioHoldings.forEach(holding => {
      holding.weight = (holding.marketValue / totalValue) * 100;
    });
    
    // Calculate portfolio beta (weighted average of individual betas)
    const portfolioBeta = portfolioHoldings.reduce(
      (sum, holding) => sum + (holding.beta * (holding.weight / 100)), 
      0
    );
    
    // Calculate risk metrics based on portfolio composition
    const volatility = calculatePortfolioVolatility(portfolioHoldings);
    const maxDrawdown = calculateMaxDrawdown(volatility);
    const sharpeRatio = calculateSharpeRatio(totalReturnPercent, volatility);
    
    return {
      totalValue,
      totalInvested,
      totalReturn,
      totalReturnPercent,
      dayChange,
      dayChangePercent,
      unrealizedGainLoss: totalReturn,
      realizedGainLoss: Math.random() * 10000 - 5000,
      dividendIncome: Math.random() * 2000,
      portfolioBeta,
      sharpeRatio,
      volatility,
      maxDrawdown,
      winRate: 60 + Math.random() * 30,
      avgHoldingPeriod: 30 + Math.random() * 200,
    };
  }, [portfolioHoldings, calculatePortfolioVolatility, calculateMaxDrawdown, calculateSharpeRatio]);

  // Calculate sector allocation with improved type safety
  const sectorAllocation = useMemo<SectorAllocation[]>(() => {
    // Group holdings by sector
    const sectorMap = new Map<string, {
      value: number;
      return: number;
      invested: number;
      count: number;
    }>();
    
    portfolioHoldings.forEach(holding => {
      const invested = holding.quantity * holding.avgPrice;
      const existing = sectorMap.get(holding.sector) || { 
        value: 0, 
        return: 0, 
        invested: 0, 
        count: 0 
      };
      
      sectorMap.set(holding.sector, {
        value: existing.value + holding.marketValue,
        return: existing.return + holding.totalReturn,
        invested: existing.invested + invested,
        count: existing.count + 1,
      });
    });
    
    const totalValue = portfolioMetrics.totalValue;
    
    // Convert to array and calculate percentages
    const sectors = Array.from(sectorMap.entries()).map(([sector, data], index) => ({
      sector,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      color: sectorColors[index % sectorColors.length],
      return: data.return,
      returnPercent: data.invested > 0 ? (data.return / data.invested) * 100 : 0,
    }));
    
    // Sort by value (largest first)
    return sectors.sort((a, b) => b.value - a.value);
  }, [portfolioHoldings, portfolioMetrics.totalValue]);

  // Generate performance data with improved typing and realistic patterns
  const performanceData = useMemo<PerformanceData[]>(() => {
    // Map timeframes to number of days
    const timeframeMap: Record<TimeFrame, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 1095, // 3 years
    };
    
    const days = timeframeMap[selectedTimeframe];
    const data: PerformanceData[] = [];
    
    // Calculate starting value based on current performance
    let startValue: number;
    if (selectedTimeframe === '1D') {
      // For 1D, start with today's opening value (current minus day change)
      startValue = portfolioMetrics.totalValue - portfolioMetrics.dayChange;
    } else {
      // For longer timeframes, estimate a realistic starting point
      const annualizedReturn = portfolioMetrics.totalReturnPercent / 100;
      const periodReturn = annualizedReturn * (days / 365);
      startValue = portfolioMetrics.totalValue / (1 + periodReturn);
    }
    
    // Use portfolio volatility to generate realistic price movements
    const dailyVolatility = portfolioMetrics.volatility / Math.sqrt(252); // Annualized to daily
    
    // Generate daily data points with realistic patterns
    let currentValue = startValue;
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      if (i > 0) {
        // Calculate daily return with random walk + drift
        const drift = (portfolioMetrics.totalValue - startValue) / days;
        const randomComponent = (Math.random() * 2 - 1) * dailyVolatility * currentValue / 100;
        const dailyChange = drift + randomComponent;
        
        // Update current value
        currentValue += dailyChange;
        
        // Ensure we end exactly at the current portfolio value on the last day
        if (i === days) {
          currentValue = portfolioMetrics.totalValue;
        }
      }
      
      // Calculate daily return
      const prevValue = i > 0 ? data[i - 1].value : startValue;
      const dailyReturn = currentValue - prevValue;
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: currentValue,
        return: dailyReturn,
      });
    }
    
    return data;
  }, [selectedTimeframe, portfolioMetrics.totalValue, portfolioMetrics.dayChange, portfolioMetrics.totalReturnPercent, portfolioMetrics.volatility]);

  // Sort holdings based on selected criteria with improved type safety
  const sortedHoldings = useMemo<ExtendedPortfolioHolding[]>(() => {
    // Create a copy to avoid mutating the original array
    const sorted = [...portfolioHoldings];
    
    // Define type-safe sorting functions
    const sortFunctions: Record<SortField, (a: ExtendedPortfolioHolding, b: ExtendedPortfolioHolding) => number> = {
      'value': (a, b) => b.marketValue - a.marketValue,
      'return': (a, b) => b.totalReturnPercent - a.totalReturnPercent,
      'weight': (a, b) => b.weight - a.weight
    };
    
    // Get the appropriate sort function
    const sortFn = sortFunctions[sortBy];
    
    // Apply sorting with direction
    return sorted.sort((a, b) => {
      const result = sortFn(a, b);
      return sortOrder === 'asc' ? -result : result;
    });
  }, [portfolioHoldings, sortBy, sortOrder]);

  // Generate chart data with improved typing
  const chartData = useMemo<Array<{x: string, y: number}>>(() => {
    // Map performance data to chart-compatible format
    return performanceData.map(dataPoint => ({
      x: dataPoint.date,
      y: dataPoint.value,
    }));
  }, [performanceData]);
  
  // Calculate performance metrics based on chart data
  const performanceMetrics = useMemo(() => {
    if (performanceData.length < 2) {
      return {
        startValue: 0,
        endValue: 0,
        absoluteChange: 0,
        percentChange: 0,
        isPositive: true
      };
    }
    
    const startValue = performanceData[0].value;
    const endValue = performanceData[performanceData.length - 1].value;
    const absoluteChange = endValue - startValue;
    const percentChange = startValue > 0 ? (absoluteChange / startValue) * 100 : 0;
    
    return {
      startValue,
      endValue,
      absoluteChange,
      percentChange,
      isPositive: percentChange >= 0
    };
  }, [performanceData]);

  // Memoized utility functions for formatting
  const formatCurrency = useCallback((amount: number): string => {
    return `Rs. ${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  }, []);

  const formatPercent = useCallback((percent: number): string => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  }, []);
  
  const formatNumber = useCallback((num: number, decimals: number = 2): string => {
    return num.toLocaleString('en-IN', { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  }, []);

  const getChangeColor = useCallback((change: number): string => {
    if (change > 0) return '#10B981'; // Green for positive
    if (change < 0) return '#EF4444'; // Red for negative
    return theme.colors.secondary; // Theme color for neutral
  }, [theme.colors.secondary]);

  // Memoized utility function for determining icon based on change value
  const getChangeIcon = useCallback((change: number): React.ReactNode => {
    if (change > 0) return <ArrowUpRight size={16} color="#10B981" />;
    if (change < 0) return <ArrowDownRight size={16} color="#EF4444" />;
    return <Minus size={16} color={theme.colors.secondary} />;
  }, [theme.colors.secondary]);

  const renderOverviewCard = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <LinearGradient
        colors={[theme.colors.primary, `${theme.colors.primary}CC`]}
        style={styles.overviewHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.overviewContent}>
          <View style={styles.overviewMain}>
            <Text style={styles.portfolioValue}>{formatCurrency(portfolioMetrics.totalValue)}</Text>
            <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getChangeColor(portfolioMetrics.totalReturn) }]}>
                {formatCurrency(portfolioMetrics.totalReturn)}
              </Text>
              <Text style={styles.statLabel}>Total Return</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: getChangeColor(portfolioMetrics.dayChange) }]}>
                {formatPercent(portfolioMetrics.dayChangePercent)}
              </Text>
              <Text style={styles.statLabel}>Today's Change</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <DollarSign size={20} color={theme.colors.primary} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {formatCurrency(portfolioMetrics.totalInvested)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Invested</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Percent size={20} color={theme.colors.primary} />
          <Text style={[styles.metricValue, { color: getChangeColor(portfolioMetrics.totalReturnPercent) }]}>
            {formatPercent(portfolioMetrics.totalReturnPercent)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Return %</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Activity size={20} color={theme.colors.primary} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {portfolioMetrics.portfolioBeta.toFixed(2)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Beta</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Shield size={20} color={theme.colors.primary} />
          <Text style={[styles.metricValue, { color: theme.colors.text }]}>
            {portfolioMetrics.sharpeRatio.toFixed(2)}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Sharpe</Text>
        </View>
      </View>
    </View>
  );

  const renderPerformanceChart = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Performance</Text>
        <View style={styles.timeframeSelector}>
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[
                styles.timeframeButton,
                selectedTimeframe === timeframe && { backgroundColor: theme.colors.primary },
                selectedTimeframe !== timeframe && { backgroundColor: theme.colors.background },
              ]}
              onPress={() => setSelectedTimeframe(timeframe)}
            >
              <Text style={[
                styles.timeframeText,
                { color: selectedTimeframe === timeframe ? '#FFFFFF' : theme.colors.text },
              ]}>
                {timeframe}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <View style={{ height: 200, backgroundColor: theme.colors.surface, borderRadius: 8, padding: 16 }}>
          <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Performance Chart</Text>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.secondary }}>Performance chart will be implemented</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSectorAllocation = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => toggleSection('sectors')}
      >
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sector Allocation</Text>
        {expandedSections.has('sectors') ? (
          <ChevronUp size={20} color={theme.colors.secondary} />
        ) : (
          <ChevronDown size={20} color={theme.colors.secondary} />
        )}
      </TouchableOpacity>
      
      {expandedSections.has('sectors') && (
        <>
          <View style={styles.pieChartContainer}>
            <View style={{ height: 200, backgroundColor: theme.colors.surface, borderRadius: 8, padding: 16 }}>
              <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Sector Allocation</Text>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.secondary }}>Pie chart will be implemented</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectorList}>
            {sectorAllocation.map((sector, index) => (
              <View key={sector.sector} style={styles.sectorItem}>
                <View style={styles.sectorInfo}>
                  <View style={[styles.sectorColor, { backgroundColor: sector.color }]} />
                  <Text style={[styles.sectorName, { color: theme.colors.text }]}>{sector.sector}</Text>
                </View>
                
                <View style={styles.sectorStats}>
                  <Text style={[styles.sectorValue, { color: theme.colors.text }]}>
                    {formatCurrency(sector.value)}
                  </Text>
                  <Text style={[styles.sectorPercent, { color: theme.colors.secondary }]}>
                    {sector.percentage.toFixed(1)}%
                  </Text>
                  <Text style={[styles.sectorReturn, { color: getChangeColor(sector.returnPercent) }]}>
                    {formatPercent(sector.returnPercent)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderHoldingsTable = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Holdings</Text>
        <TouchableOpacity>
          <Filter size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.sortControls}>
        <Text style={[styles.sortLabel, { color: theme.colors.secondary }]}>Sort by:</Text>
        {['value', 'return', 'weight'].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.sortButton,
              sortBy === option && { backgroundColor: theme.colors.primary },
              sortBy !== option && { backgroundColor: theme.colors.background },
            ]}
            onPress={() => {
              if (sortBy === option) {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
              } else {
                setSortBy(option as SortField);
                setSortOrder('desc');
              }
            }}
          >
            <Text style={[
              styles.sortButtonText,
              { color: sortBy === option ? '#FFFFFF' : theme.colors.text },
            ]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
            {sortBy === option && (
              sortOrder === 'desc' ? 
                <ChevronDown size={16} color="#FFFFFF" /> : 
                <ChevronUp size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      <FlatList
        data={sortedHoldings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.holdingItem}>
            <View style={styles.holdingMain}>
              <View style={styles.holdingInfo}>
                <Text style={[styles.holdingSymbol, { color: theme.colors.text }]}>{item.symbol}</Text>
                <Text style={[styles.holdingName, { color: theme.colors.secondary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.holdingMeta}>
                  <Text style={[styles.holdingQuantity, { color: theme.colors.secondary }]}>
                    {item.quantity} shares
                  </Text>
                  <View style={[styles.riskBadge, { backgroundColor: riskColors[item.riskLevel] }]}>
                    <Text style={styles.riskText}>{item.riskLevel}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.holdingStats}>
                <Text style={[styles.holdingValue, { color: theme.colors.text }]}>
                  {formatCurrency(item.marketValue)}
                </Text>
                <Text style={[styles.holdingWeight, { color: theme.colors.secondary }]}>
                  {item.weight.toFixed(1)}%
                </Text>
                <View style={styles.holdingReturns}>
                  <Text style={[styles.holdingReturn, { color: getChangeColor(item.totalReturn) }]}>
                    {formatCurrency(item.totalReturn)}
                  </Text>
                  <Text style={[styles.holdingReturnPercent, { color: getChangeColor(item.totalReturnPercent) }]}>
                    {formatPercent(item.totalReturnPercent)}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.holdingDetails}>
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Avg Price:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  Rs. {item.avgPrice.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Current:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  Rs. {item.currentPrice.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Day Change:</Text>
                <View style={styles.detailChange}>
                  {getChangeIcon(item.dayChange)}
                  <Text style={[styles.detailValue, { color: getChangeColor(item.dayChange) }]}>
                    {formatPercent(item.dayChangePercent)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={[styles.detailLabel, { color: theme.colors.secondary }]}>Beta:</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {item.beta.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />
    </View>
  );

  // Memoized section header renderer for better performance
  const renderSectionHeader = useCallback((title: string, section: string): React.ReactNode => (
    <TouchableOpacity 
      style={styles.sectionHeader} 
      onPress={() => toggleSection(section)}
      accessibilityRole="button"
      accessibilityLabel={`${title} section, ${expandedSections.has(section) ? 'expanded' : 'collapsed'}`}
    >
      <Text style={styles.sectionTitle}>{title}</Text>
      {expandedSections.has(section) ? 
        <ChevronUp size={20} color={theme.colors.secondary} /> : 
        <ChevronDown size={20} color={theme.colors.secondary} />}
    </TouchableOpacity>
  ), [expandedSections, toggleSection, theme.colors.secondary]);

  const renderRiskMetrics = () => (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity 
        style={styles.cardHeader}
        onPress={() => toggleSection('risk')}
      >
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Risk Analysis</Text>
        {expandedSections.has('risk') ? (
          <ChevronUp size={20} color={theme.colors.secondary} />
        ) : (
          <ChevronDown size={20} color={theme.colors.secondary} />
        )}
      </TouchableOpacity>
      
      {expandedSections.has('risk') && (
        <View style={styles.riskMetrics}>
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Shield size={20} color={theme.colors.primary} />
              <Text style={[styles.riskLabel, { color: theme.colors.text }]}>Portfolio Beta</Text>
            </View>
            <Text style={[styles.riskValue, { color: theme.colors.text }]}>
              {portfolioMetrics.portfolioBeta.toFixed(2)}
            </Text>
            <Text style={[styles.riskDescription, { color: theme.colors.secondary }]}>
              {portfolioMetrics.portfolioBeta > 1 ? 'More volatile than market' : 'Less volatile than market'}
            </Text>
          </View>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Activity size={20} color={theme.colors.primary} />
              <Text style={[styles.riskLabel, { color: theme.colors.text }]}>Volatility</Text>
            </View>
            <Text style={[styles.riskValue, { color: theme.colors.text }]}>
              {portfolioMetrics.volatility.toFixed(1)}%
            </Text>
            <Text style={[styles.riskDescription, { color: theme.colors.secondary }]}>
              Annual volatility measure
            </Text>
          </View>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <TrendingDown size={20} color="#EF4444" />
              <Text style={[styles.riskLabel, { color: theme.colors.text }]}>Max Drawdown</Text>
            </View>
            <Text style={[styles.riskValue, { color: '#EF4444' }]}>
              {portfolioMetrics.maxDrawdown.toFixed(1)}%
            </Text>
            <Text style={[styles.riskDescription, { color: theme.colors.secondary }]}>
              Largest peak-to-trough decline
            </Text>
          </View>
          
          <View style={styles.riskItem}>
            <View style={styles.riskHeader}>
              <Award size={20} color="#10B981" />
              <Text style={[styles.riskLabel, { color: theme.colors.text }]}>Win Rate</Text>
            </View>
            <Text style={[styles.riskValue, { color: '#10B981' }]}>
              {portfolioMetrics.winRate.toFixed(1)}%
            </Text>
            <Text style={[styles.riskDescription, { color: theme.colors.secondary }]}>
              Percentage of profitable trades
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerContent}>
          <BarChart3 size={24} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Portfolio Analytics</Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <RefreshCw size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Share size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOverviewCard()}
        {renderPerformanceChart()}
        {renderSectorAllocation()}
        {renderHoldingsTable()}
        {renderRiskMetrics()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  overviewHeader: {
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overviewContent: {
    alignItems: 'center',
  },
  overviewMain: {
    alignItems: 'center',
    marginBottom: 20,
  },
  portfolioValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  portfolioLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  timeframeSelector: {
    flexDirection: 'row',
  },
  timeframeButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  timeframeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  sectorList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectorColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sectorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectorStats: {
    alignItems: 'flex-end',
  },
  sectorValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectorPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  sectorReturn: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sortControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  holdingItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  holdingMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingName: {
    fontSize: 14,
    marginTop: 2,
  },
  holdingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  holdingQuantity: {
    fontSize: 12,
    marginRight: 8,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  holdingStats: {
    alignItems: 'flex-end',
  },
  holdingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingWeight: {
    fontSize: 12,
    marginTop: 2,
  },
  holdingReturns: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  holdingReturn: {
    fontSize: 14,
    fontWeight: '600',
  },
  holdingReturnPercent: {
    fontSize: 12,
    marginTop: 2,
  },
  holdingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskMetrics: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  riskItem: {
    marginBottom: 16,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  riskValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
