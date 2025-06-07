import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Search,
  Eye,
  EyeOff,
  Target,
  Zap,
  Shield,
  Award,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  User,
  Newspaper,
  BookOpen,
  Calculator,
  MessageCircle,
  Filter,
  MoreHorizontal,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { enhancedStockData } from '@/assets/data/enhancedMockData';
import StockTicker from '@/components/dashboard/StockTicker';
import { LineChart } from 'react-native-chart-kit';
const { width: screenWidth } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  route?: string;
  action?: () => void;
}

interface MarketSummary {
  index: string;
  value: number;
  change: number;
  changePercent: number;
}

interface PortfolioSummary {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  holdings: number;
}

interface AIInsight {
  id: string;
  type: 'bullish' | 'bearish' | 'neutral' | 'alert';
  title: string;
  description: string;
  confidence: number;
  symbol?: string;
  action?: string;
}

export default function EnhancedDashboard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioVisible, setPortfolioVisible] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  const [marketData, setMarketData] = useState<any[]>([]);

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'buy_sell',
      title: 'Buy/Sell',
      icon: <Target size={24} color="#FFFFFF" />,
      color: '#10B981',
      route: '/buy-sell',
    },
    {
      id: 'ai_analysis',
      title: 'AI Analysis',
      icon: <Zap size={24} color="#FFFFFF" />,
      color: '#8B5CF6',
      route: '/ai-analysis',
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      icon: <PieChart size={24} color="#FFFFFF" />,
      color: '#06B6D4',
      route: '/portfolio-analytics',
    },
    {
      id: 'news',
      title: 'News',
      icon: <Newspaper size={24} color="#FFFFFF" />,
      color: '#F59E0B',
      route: '/news',
    },
    {
      id: 'education',
      title: 'Learn',
      icon: <BookOpen size={24} color="#FFFFFF" />,
      color: '#EC4899',
      route: '/education',
    },
    {
      id: 'calculator',
      title: 'Calculator',
      icon: <Calculator size={24} color="#FFFFFF" />,
      color: '#EF4444',
      route: '/calculators',
    },
    {
      id: 'ai_chat',
      title: 'AI Chat',
      icon: <MessageCircle size={24} color="#FFFFFF" />,
      color: '#6366F1',
      route: '/ai-chat',
    },
    {
      id: 'search',
      title: 'Search',
      icon: <Search size={24} color="#FFFFFF" />,
      color: '#84CC16',
      route: '/search',
    },
  ];

  // Market Summary
  const marketSummary: MarketSummary[] = [
    {
      index: 'NEPSE',
      value: 2156.78,
      change: 12.45,
      changePercent: 0.58,
    },
    {
      index: 'Sensitive',
      value: 412.34,
      change: -2.67,
      changePercent: -0.64,
    },
    {
      index: 'Float',
      value: 156.89,
      change: 1.23,
      changePercent: 0.79,
    },
    {
      index: 'Banking',
      value: 1834.56,
      change: 8.91,
      changePercent: 0.49,
    },
  ];

  // Portfolio Summary
  const portfolioSummary: PortfolioSummary = {
    totalValue: 485750,
    dayChange: 2340,
    dayChangePercent: 0.48,
    totalReturn: 23450,
    totalReturnPercent: 5.07,
    holdings: 8,
  };

  // AI Insights
  const aiInsights: AIInsight[] = [
    {
      id: '1',
      type: 'bullish',
      title: 'Strong Buy Signal',
      description: 'NABIL shows strong technical indicators with RSI oversold and MACD bullish crossover.',
      confidence: 87,
      symbol: 'NABIL',
      action: 'Consider buying',
    },
    {
      id: '2',
      type: 'alert',
      title: 'Portfolio Risk Alert',
      description: 'Your portfolio concentration in banking sector is above 60%. Consider diversification.',
      confidence: 92,
      action: 'Rebalance portfolio',
    },
    {
      id: '3',
      type: 'neutral',
      title: 'Market Outlook',
      description: 'NEPSE index showing sideways movement. Wait for clear breakout signals.',
      confidence: 75,
      action: 'Monitor closely',
    },
  ];

  // Generate market chart data
  const chartData = useMemo(() => {
    const days = selectedTimeframe === '1D' ? 24 : 
                selectedTimeframe === '1W' ? 7 :
                selectedTimeframe === '1M' ? 30 : 90;
    
    const data = [];
    const labels = [];
    let currentValue = 2156.78;
    
    for (let i = 0; i <= days; i++) {
      const randomChange = (Math.random() - 0.5) * 0.02;
      currentValue *= (1 + randomChange);
      
      data.push(Math.round(currentValue));
      labels.push(selectedTimeframe === '1D' ? `${i}h` : `${i}d`);
    }
    
    return {
      labels: labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0),
      datasets: [{
        data,
        color: (opacity = 1) => theme.colors.primary,
        strokeWidth: 2
      }]
    };
  }, [selectedTimeframe, theme.colors.primary]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return '#10B981';
    if (change < 0) return '#EF4444';
    return theme.colors.secondary;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUpRight size={16} color="#10B981" />;
    if (change < 0) return <ArrowDownRight size={16} color="#EF4444" />;
    return <Minus size={16} color={theme.colors.secondary} />;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'bullish': return <TrendingUp size={20} color="#10B981" />;
      case 'bearish': return <TrendingDown size={20} color="#EF4444" />;
      case 'alert': return <Shield size={20} color="#F59E0B" />;
      default: return <Activity size={20} color="#6B7280" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'bullish': return '#10B981';
      case 'bearish': return '#EF4444';
      case 'alert': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={[theme.colors.primary, `${theme.colors.primary}CC`]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <View style={styles.userAvatar}>
            <User size={24} color="#FFFFFF" />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.fullName || 'Investor'}</Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/search' as any)}>
            <Search size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/notifications' as any)}>
            <Bell size={24} color="#FFFFFF" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderQuickActions = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
        <TouchableOpacity>
          <MoreHorizontal size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickActionItem, { backgroundColor: action.color }]}
            onPress={() => action.route && router.push(action.route as any)}
          >
            {action.icon}
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMarketOverview = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Market Overview</Text>
        <View style={styles.timeframeSelector}>
          {['1D', '1W', '1M', '3M'].map((timeframe) => (
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
      
      {/* Market Indices */}
      <View style={styles.marketIndices}>
        {marketSummary.map((market, index) => (
          <View key={market.index} style={styles.marketItem}>
            <Text style={[styles.marketIndex, { color: theme.colors.text }]}>{market.index}</Text>
            <Text style={[styles.marketValue, { color: theme.colors.text }]}>
              {market.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.marketChange}>
              {getChangeIcon(market.change)}
              <Text style={[styles.marketChangeText, { color: getChangeColor(market.change) }]}>
                {formatPercent(market.changePercent)}
              </Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Market Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={screenWidth - 32}
          height={220}
          yAxisLabel="₨"
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: theme.colors.background,
            backgroundGradientFrom: theme.colors.background,
            backgroundGradientTo: theme.colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => theme.colors.primary,
            labelColor: (opacity = 1) => theme.colors.text,
            propsForDots: {
              r: '2',
              strokeWidth: '1',
              stroke: theme.colors.primary
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: theme.colors.border,
              strokeOpacity: 0.2
            },
            style: {
              borderRadius: 16
            }
          }}
          bezier
          withInnerLines={true}
          withOuterLines={true}
          withVerticalLines={false}
          withHorizontalLines={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
// Remove duplicate bezier prop since it's already specified above
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
          withDots={false}
          withShadow={false}
          // Remove duplicate withInnerLines prop since it's already specified above
          // Remove duplicate withOuterLines prop since it's already specified above
// Remove duplicate withVerticalLines prop since it's already specified above
          // Remove duplicate withHorizontalLines prop since it's already specified above
        />
      </View>
    </View>
  );

  const renderPortfolioSummary = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Portfolio</Text>
        <View style={styles.portfolioActions}>
          <TouchableOpacity onPress={() => setPortfolioVisible(!portfolioVisible)}>
            {portfolioVisible ? (
              <Eye size={20} color={theme.colors.secondary} />
            ) : (
              <EyeOff size={20} color={theme.colors.secondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/portfolio-analytics' as any)} style={{ marginLeft: 12 }}>
            <ChevronRight size={20} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {portfolioVisible && (
        <>
          <LinearGradient
            colors={[theme.colors.primary, `${theme.colors.primary}80`]}
            style={styles.portfolioCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.portfolioMain}>
              <Text style={styles.portfolioValue}>{formatCurrency(portfolioSummary.totalValue)}</Text>
              <Text style={styles.portfolioLabel}>Total Value</Text>
            </View>
            
            <View style={styles.portfolioStats}>
              <View style={styles.portfolioStat}>
                <Text style={[styles.portfolioStatValue, { color: getChangeColor(portfolioSummary.dayChange) }]}>
                  {formatCurrency(portfolioSummary.dayChange)}
                </Text>
                <Text style={styles.portfolioStatLabel}>Today</Text>
              </View>
              
              <View style={styles.portfolioStat}>
                <Text style={[styles.portfolioStatValue, { color: getChangeColor(portfolioSummary.totalReturn) }]}>
                  {formatPercent(portfolioSummary.totalReturnPercent)}
                </Text>
                <Text style={styles.portfolioStatLabel}>Total Return</Text>
              </View>
            </View>
          </LinearGradient>
          
          <View style={styles.portfolioMetrics}>
            <View style={styles.metricItem}>
              <BarChart3 size={16} color={theme.colors.primary} />
              <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Holdings</Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{portfolioSummary.holdings}</Text>
            </View>
            
            <View style={styles.metricItem}>
              <Target size={16} color={theme.colors.primary} />
              <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>Invested</Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {formatCurrency(portfolioSummary.totalValue - portfolioSummary.totalReturn)}
              </Text>
            </View>
            
            <View style={styles.metricItem}>
              <Award size={16} color={theme.colors.primary} />
              <Text style={[styles.metricLabel, { color: theme.colors.secondary }]}>P&L</Text>
              <Text style={[styles.metricValue, { color: getChangeColor(portfolioSummary.totalReturn) }]}>
                {formatCurrency(portfolioSummary.totalReturn)}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderAIInsights = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWithIcon}>
          <Zap size={20} color={theme.colors.primary} />
          <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 8 }]}>AI Insights</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/ai-analysis' as any)}>
          <ChevronRight size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {aiInsights.map((insight) => (
          <TouchableOpacity
            key={insight.id}
            style={[styles.insightCard, { backgroundColor: theme.colors.background }]}
            onPress={() => router.push('ai-analysis' as any)}
          >
            <View style={styles.insightHeader}>
              {getInsightIcon(insight.type)}
              <View style={[styles.confidenceBadge, { backgroundColor: getInsightColor(insight.type) }]}>
                <Text style={styles.confidenceText}>{insight.confidence}%</Text>
              </View>
            </View>
            
            <Text style={[styles.insightTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {insight.title}
            </Text>
            
            <Text style={[styles.insightDescription, { color: theme.colors.secondary }]} numberOfLines={2}>
              {insight.description}
            </Text>
            
            {insight.symbol && (
              <View style={[styles.symbolBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.symbolText}>{insight.symbol}</Text>
              </View>
            )}
            
            <Text style={[styles.insightAction, { color: theme.colors.primary }]} numberOfLines={1}>
              {insight.action}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTopMovers = () => (
    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Top Movers</Text>
        <TouchableOpacity>
          <Filter size={20} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.moversContainer}>
        {enhancedStockData.slice(0, 5).map((stock, index) => (
          <TouchableOpacity
            key={stock.symbol}
            style={styles.moverItem}
            onPress={() => router.push(`/stock/${stock.symbol}`)}
          >
            <View style={styles.moverInfo}>
              <Text style={[styles.moverSymbol, { color: theme.colors.text }]}>{stock.symbol}</Text>
              <Text style={[styles.moverName, { color: theme.colors.secondary }]} numberOfLines={1}>
                {stock.name}
              </Text>
            </View>
            
            <View style={styles.moverStats}>
              <Text style={[styles.moverPrice, { color: theme.colors.text }]}>Rs. {stock.price.toFixed(2)}</Text>
              <View style={styles.moverChange}>
                {getChangeIcon(stock.change)}
                <Text style={[styles.moverChangeText, { color: getChangeColor(stock.change) }]}>
                  {formatPercent(stock.change)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Stock Ticker */}
        <StockTicker />
        
        {renderQuickActions()}
        {renderMarketOverview()}
        {renderPortfolioSummary()}
        {renderAIInsights()}
        {renderTopMovers()}
        
        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 12,
  },
  welcomeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  quickActionItem: {
    width: (screenWidth - 80) / 4,
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
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
  marketIndices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  marketItem: {
    alignItems: 'center',
  },
  marketIndex: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  marketValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  marketChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  marketChangeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  chartContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  portfolioActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  portfolioCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
  },
  portfolioMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  portfolioLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  portfolioStat: {
    alignItems: 'center',
  },
  portfolioStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  portfolioStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  portfolioMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  insightCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    marginLeft: 16,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  symbolBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  symbolText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  moversContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  moverItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  moverInfo: {
    flex: 1,
  },
  moverSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moverName: {
    fontSize: 14,
    marginTop: 2,
  },
  moverStats: {
    alignItems: 'flex-end',
  },
  moverPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moverChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  moverChangeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
});