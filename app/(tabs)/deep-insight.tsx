import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@/components/ui/Picker';
import DataTableComponents from '@/components/ui/DataTable';

const { DataTable, Row: DataTableRow, Cell: DataTableCell } = DataTableComponents;
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Search,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  DollarSign,
  Percent,
  Users,
  Globe,
  Shield,
  Award,
  Clock,
  Newspaper,
  Brain,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import NewsCard from '@/components/dashboard/NewsCard';
import CandleChart from '@/components/stock/CandleChart';

const { width: screenWidth } = Dimensions.get('window');

interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url?: string;
}

interface MetricData {
  [key: string]: string | number;
}

interface AIRecommendation {
  recommendation: 'BUY' | 'WATCH' | 'SELL';
  confidence: number;
  justification: string;
  bullets: string[];
}

interface InsightData {
  symbol: string;
  companyName: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  news: NewsItem[];
  historicalData: any[];
  fundamentals: MetricData;
  technical: MetricData;
  sentiment: MetricData;
  macro: MetricData;
  industry: MetricData;
  aiSummary: AIRecommendation;
  lastUpdated: string;
}

export default function DeepInsightScreen() {
  const { theme } = useTheme();
  const [stockSymbol, setStockSymbol] = useState('');
  const [dateRangeDays, setDateRangeDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState<InsightData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for demonstration
  const mockInsightData: InsightData = {
    symbol: 'NICA',
    companyName: 'NIC Asia Bank Limited',
    currentPrice: 1245.50,
    priceChange: 12.30,
    priceChangePercent: 1.0,
    news: [
      {
        id: '1',
        title: 'NIC Asia Bank reports strong Q3 earnings with 15% growth',
        source: 'Nepali Times',
        date: '2024-01-15',
        sentiment: 'positive',
      },
      {
        id: '2',
        title: 'Banking sector faces regulatory challenges amid economic uncertainty',
        source: 'The Himalayan Times',
        date: '2024-01-14',
        sentiment: 'negative',
      },
      {
        id: '3',
        title: 'NIC Asia expands digital banking services across rural areas',
        source: 'Kantipur Daily',
        date: '2024-01-13',
        sentiment: 'positive',
      },
    ],
    historicalData: generateMockHistoricalData(),
    fundamentals: {
      'Revenue (NPR Cr)': '45.2',
      'Net Income (NPR Cr)': '12.8',
      'Book Value': '1,156.78',
      'P/E Ratio': '18.5',
      'D/E Ratio': '0.65',
      'ROE (%)': '16.2',
      'Dividend Yield (%)': '8.5',
      'Market Cap (NPR Cr)': '89.4',
    },
    technical: {
      'RSI (14)': '58.2',
      'MACD': '2.45',
      'MA 20': '1,235.60',
      'MA 50': '1,198.40',
      'Bollinger Upper': '1,285.30',
      'Bollinger Lower': '1,195.70',
      'Volume (Avg)': '125,450',
      'Beta': '1.15',
    },
    sentiment: {
      'News Sentiment': 'Positive (72%)',
      'Social Media': 'Neutral (58%)',
      'Analyst Rating': 'Buy (4/5)',
      'Insider Activity': 'Neutral',
      'Institutional Flow': 'Positive',
      'Retail Interest': 'High',
    },
    macro: {
      'Nepal CPI (%)': '6.8',
      'Interest Rate (%)': '8.5',
      'GDP Growth (%)': '4.2',
      'Banking Index': '+2.3%',
      'Currency (NPR/USD)': '132.45',
      'Inflation Outlook': 'Stable',
    },
    industry: {
      'Sector Performance': '+5.2%',
      'Peer Comparison': 'Outperforming',
      'Market Share': '12.5%',
      'Competitive Position': 'Strong',
      'Industry Trend': 'Positive',
      'Regulatory Environment': 'Stable',
    },
    aiSummary: {
      recommendation: 'BUY',
      confidence: 78,
      justification: 'Strong fundamentals with improving profitability and positive market sentiment support a buy recommendation.',
      bullets: [
        'Consistent earnings growth with 15% YoY increase',
        'Strong ROE of 16.2% indicates efficient capital utilization',
        'Expanding digital banking presence in rural markets',
        'Regulatory environment remains stable and supportive',
        'Technical indicators suggest continued upward momentum',
      ],
    },
    lastUpdated: new Date().toISOString(),
  };

  function generateMockHistoricalData() {
    const data = [];
    let price = 1200;
    const today = new Date();
    
    for (let i = 180; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 0.03;
      price *= (1 + change);
      
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * 0.02);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 200000) + 50000;
      
      data.push({
        x: date,
        open,
        high,
        low,
        close,
        volume,
      });
      
      price = close;
    }
    
    return data;
  }

  const fetchInsight = async () => {
    if (!stockSymbol.trim()) {
      Alert.alert('Error', 'Please enter a stock symbol');
      return;
    }

    setLoading(true);
    
    try {
      // Fetch real-time data from Nepal Stock Exchange API
      // Using the unofficial API from https://github.com/surajrimal07/NepseAPI
      // You would need to set up a proxy server or use a CORS-enabled API in production
      
      // For demo purposes, we'll use a combination of real API calls and mock data
      // In a production app, you would implement proper error handling and caching
      
      // Fetch live market data for the symbol
      const symbol = stockSymbol.trim().toUpperCase();
      
      // Try to fetch from the API, fall back to mock data if it fails
      let historicalData = [];
      let currentPrice = 0;
      let priceChange = 0;
      let priceChangePercent = 0;
      let companyName = '';
      
      try {
        // Fetch live market data
        const liveMarketResponse = await fetch('https://nepse-data-api.herokuapp.com/data/todaysprice');
        if (liveMarketResponse.ok) {
          const liveMarketData = await liveMarketResponse.json();
          
          // Find the stock in the response
          const stockData = liveMarketData.find((item: { symbol: string; companyName: string | string[]; }) => 
            item.symbol === symbol || item.companyName.includes(symbol)
          );
          
          if (stockData) {
            currentPrice = parseFloat(stockData.ltp) || mockInsightData.currentPrice;
            priceChange = parseFloat(stockData.pointChange) || mockInsightData.priceChange;
            priceChangePercent = parseFloat(stockData.percentChange) || mockInsightData.priceChangePercent;
            companyName = stockData.companyName || `${symbol} Company`;
          }
        }
      } catch (apiError) {
        console.log('API fetch error, using mock data:', apiError);
      }
      
      // Generate historical data based on current price and date range
      historicalData = generateHistoricalData(currentPrice || mockInsightData.currentPrice, dateRangeDays);
      
      // Create the insight data object with real and mock data combined
      const insightData = {
        ...mockInsightData,
        symbol,
        companyName: companyName || `${symbol} Company`,
        currentPrice: currentPrice || mockInsightData.currentPrice,
        priceChange: priceChange || mockInsightData.priceChange,
        priceChangePercent: priceChangePercent || mockInsightData.priceChangePercent,
        historicalData,
        lastUpdated: new Date().toISOString(),
      };
      
      setInsightData(insightData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch insight data. Please try again.');
      console.error('Insight fetch error:', error);
      
      // Fall back to mock data on error
      const mockData = {
        ...mockInsightData,
        symbol: stockSymbol.trim().toUpperCase(),
      };
      
      setInsightData(mockData);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate historical data based on current price and date range
  const generateHistoricalData = (currentPrice: number, days: number) => {
    const data = [];
    let price = currentPrice * 0.95; // Start slightly below current price
    const today = new Date();
    
    // Generate more realistic price movements with some trends
    const trendFactor = Math.random() > 0.5 ? 1 : -1; // Random upward or downward trend
    const volatility = 0.015; // Daily price volatility
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create more realistic price movements
      // Add some trend and randomness
      const trend = (i / days) * trendFactor * 0.1; // Gradual trend component
      const dailyChange = (Math.random() - 0.5) * volatility + trend;
      
      price *= (1 + dailyChange);
      
      // Create realistic intraday price movements
      const dayVolatility = volatility * 0.6;
      const open = price;
      const close = price * (1 + (Math.random() - 0.5) * dayVolatility);
      const high = Math.max(open, close) * (1 + Math.random() * dayVolatility * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * dayVolatility * 0.5);
      
      // Volume tends to be higher on days with bigger price movements
      const priceMove = Math.abs(close - open) / open;
      const baseVolume = 50000 + Math.floor(Math.random() * 150000);
      const volume = Math.floor(baseVolume * (1 + priceMove * 10));
      
      data.push({
        x: date,
        open,
        high,
        low,
        close,
        volume,
      });
      
      price = close;
    }
    
    return data;
  };

  const getSentimentEmoji = (sentiment: string) => {
    if (sentiment === 'positive') return '👍';
    if (sentiment === 'negative') return '👎';
    return '😐';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return '#004D40';
      case 'SELL': return '#B71C1C';
      default: return '#F57F17';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY': return <CheckCircle size={24} color="#FFFFFF" />;
      case 'SELL': return <XCircle size={24} color="#FFFFFF" />;
      default: return <AlertCircle size={24} color="#FFFFFF" />;
    }
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={[styles.newsItem, { backgroundColor: theme.colors.card }]}>
      <View style={styles.newsHeader}>
        <Text style={styles.sentimentEmoji}>{getSentimentEmoji(item.sentiment)}</Text>
        <View style={styles.newsInfo}>
          <Text style={[styles.newsSource, { color: theme.colors.secondary }]}>{item.source}</Text>
          <Text style={[styles.newsDate, { color: theme.colors.secondary }]}>{item.date}</Text>
        </View>
      </View>
      <Text style={[styles.newsTitle, { color: theme.colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
    </View>
  );

  const renderMetricsTable = (title: string, data: MetricData, icon: React.ReactNode) => (
    <View style={[styles.metricsSection, { backgroundColor: theme.colors.card }]}>
      <View style={styles.metricsSectionHeader}>
        {icon}
        <Text style={[styles.metricsSectionTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <DataTable>
        {Object.entries(data).map(([name, value]) => (
          <DataTableRow key={name}>
            <DataTableCell>
              <Text style={[styles.metricName, { color: theme.colors.text }]}>{name}</Text>
            </DataTableCell>
            <DataTableCell numeric>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTable>
    </View>
  );

  const renderTabButton = (tabId: string, title: string, icon: React.ReactNode) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabId && { backgroundColor: theme.colors.primary },
        activeTab !== tabId && { backgroundColor: theme.colors.background },
      ]}
      onPress={() => setActiveTab(tabId)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tabId ? '#FFFFFF' : theme.colors.text },
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (!insightData) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Stock Header */}
            <View style={[styles.stockHeader, { backgroundColor: theme.colors.card }]}>
              <View>
                <Text style={[styles.stockSymbol, { color: theme.colors.text }]}>{insightData.symbol}</Text>
                <Text style={[styles.companyName, { color: theme.colors.secondary }]}>{insightData.companyName}</Text>
              </View>
              <View style={styles.priceInfo}>
                <Text style={[styles.currentPrice, { color: theme.colors.text }]}>Rs. {insightData.currentPrice.toFixed(2)}</Text>
                <View style={styles.priceChange}>
                  {insightData.priceChange >= 0 ? (
                    <TrendingUp size={16} color="#10B981" />
                  ) : (
                    <TrendingDown size={16} color="#EF4444" />
                  )}
                  <Text style={[styles.priceChangeText, { color: insightData.priceChange >= 0 ? '#10B981' : '#EF4444' }]}>
                    {insightData.priceChange >= 0 ? '+' : ''}{insightData.priceChangePercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Recommendation */}
            <View style={[styles.recommendationContainer, { backgroundColor: getRecommendationColor(insightData.aiSummary.recommendation) }]}>
              <View style={styles.recommendationHeader}>
                {getRecommendationIcon(insightData.aiSummary.recommendation)}
                <Text style={styles.recommendationText}>{insightData.aiSummary.recommendation}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>{insightData.aiSummary.confidence}%</Text>
                </View>
              </View>
              <Text style={styles.justificationText}>{insightData.aiSummary.justification}</Text>
              {insightData.aiSummary.bullets.map((bullet, index) => (
                <Text key={index} style={styles.bulletText}>• {bullet}</Text>
              ))}
            </View>

            {/* Quick Metrics */}
            <View style={styles.quickMetrics}>
              <View style={[styles.quickMetricItem, { backgroundColor: theme.colors.card }]}>
                <DollarSign size={20} color={theme.colors.primary} />
                <Text style={[styles.quickMetricLabel, { color: theme.colors.secondary }]}>P/E Ratio</Text>
                <Text style={[styles.quickMetricValue, { color: theme.colors.text }]}>{insightData.fundamentals['P/E Ratio']}</Text>
              </View>
              <View style={[styles.quickMetricItem, { backgroundColor: theme.colors.card }]}>
                <Percent size={20} color={theme.colors.primary} />
                <Text style={[styles.quickMetricLabel, { color: theme.colors.secondary }]}>ROE</Text>
                <Text style={[styles.quickMetricValue, { color: theme.colors.text }]}>{insightData.fundamentals['ROE (%)']}</Text>
              </View>
              <View style={[styles.quickMetricItem, { backgroundColor: theme.colors.card }]}>
                <Activity size={20} color={theme.colors.primary} />
                <Text style={[styles.quickMetricLabel, { color: theme.colors.secondary }]}>RSI</Text>
                <Text style={[styles.quickMetricValue, { color: theme.colors.text }]}>{insightData.technical['RSI (14)']}</Text>
              </View>
            </View>
          </View>
        );

      case 'news':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>News & Sentiment Analysis</Text>
            <FlatList
              data={insightData.news}
              renderItem={renderNewsItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        );

      case 'chart':
        return (
          <View>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>6-Month Price Chart</Text>
            <CandleChart data={insightData.historicalData} width={screenWidth - 32} height={300} />
          </View>
        );

      case 'metrics':
        return (
          <View>
            {renderMetricsTable('Fundamentals', insightData.fundamentals, <BarChart3 size={20} color={theme.colors.primary} />)}
            {renderMetricsTable('Technical Analysis', insightData.technical, <Activity size={20} color={theme.colors.primary} />)}
            {renderMetricsTable('Market Sentiment', insightData.sentiment, <Users size={20} color={theme.colors.primary} />)}
            {renderMetricsTable('Macro Environment', insightData.macro, <Globe size={20} color={theme.colors.primary} />)}
            {renderMetricsTable('Industry Analysis', insightData.industry, <Shield size={20} color={theme.colors.primary} />)}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Brain size={28} color={theme.colors.primary} />
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Deep Stock Insight</Text>
        </View>

        {/* Input Section */}
        <View style={[styles.inputSection, { backgroundColor: theme.colors.card }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Stock Symbol</Text>
            <TextInput
              style={[styles.textInput, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
              value={stockSymbol}
              onChangeText={(text) => setStockSymbol(text.toUpperCase())}
              placeholder="Enter NEPSE symbol (e.g., NICA, NMB)"
              placeholderTextColor={theme.colors.secondary}
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Analysis Period</Text>
            <Picker
              selectedValue={dateRangeDays}
              onValueChange={(value) => setDateRangeDays(value)}
              style={[styles.pickerContainer, { backgroundColor: theme.colors.background }]}
            >
              <option value={1}>1 Day</option>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
              <option value={90}>90 Days</option>
              <option value={180}>180 Days</option>
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchInsight}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Search size={20} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>Get Deep Insight</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {insightData && (
          <View style={styles.resultsSection}>
            {/* Tab Navigation */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
              {renderTabButton('overview', 'Overview', <Target size={16} color={activeTab === 'overview' ? '#FFFFFF' : theme.colors.text} />)}
              {renderTabButton('news', 'News', <Newspaper size={16} color={activeTab === 'news' ? '#FFFFFF' : theme.colors.text} />)}
              {renderTabButton('chart', 'Chart', <BarChart3 size={16} color={activeTab === 'chart' ? '#FFFFFF' : theme.colors.text} />)}
              {renderTabButton('metrics', 'Metrics', <Activity size={16} color={activeTab === 'metrics' ? '#FFFFFF' : theme.colors.text} />)}
            </ScrollView>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {renderTabContent()}
            </View>

            {/* Last Updated */}
            <View style={styles.lastUpdated}>
              <Clock size={14} color={theme.colors.secondary} />
              <Text style={[styles.lastUpdatedText, { color: theme.colors.secondary }]}>
                Last updated: {new Date(insightData.lastUpdated).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  inputSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsSection: {
    margin: 16,
  },
  tabContainer: {
    marginBottom: 16,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  tabContent: {
    minHeight: 200,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  stockSymbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 14,
    marginTop: 4,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendationContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  justificationText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  bulletText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 12,
    marginTop: 4,
    lineHeight: 20,
  },
  quickMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickMetricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickMetricLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  quickMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  newsItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sentimentEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  newsInfo: {
    flex: 1,
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsDate: {
    fontSize: 11,
    marginTop: 2,
  },
  newsTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  metricsSection: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  metricsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  metricsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  metricName: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  lastUpdatedText: {
    fontSize: 12,
    marginLeft: 6,
  },
});