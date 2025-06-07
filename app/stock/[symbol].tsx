import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Star, ChartBar as BarChart3, Bell, DollarSign } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';
import StockChart from '@/components/stock/StockChart';
import StockStats from '@/components/stock/StockStats';
import StockNews from '@/components/stock/StockNews';
import StockAnalysis from '@/components/stock/StockAnalysis';
import { NEPSEStock } from '@/types';

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams();
  const { 
    getStockBySymbol, 
    latestNews, 
    addToWatchlist, 
    removeFromWatchlist, 
    isInWatchlist 
  } = useMarketData();
  const router = useRouter();
  
  const stock = getStockBySymbol(symbol as string);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('1D');
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // Check if stock is in watchlist when component mounts
  useEffect(() => {
    if (stock) {
      setInWatchlist(isInWatchlist(stock.symbol));
    }
  }, [stock, isInWatchlist]);
  
  if (!stock) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Stock not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const toggleWatchlist = () => {
    if (!stock) return;
    
    if (inWatchlist) {
      removeFromWatchlist(stock.symbol);
      setInWatchlist(false);
    } else {
      addToWatchlist(stock);
      setInWatchlist(true);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#0F3460" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={toggleWatchlist}
            >
              <Star size={24} color={inWatchlist ? "#FFB800" : "#0F3460"} fill={inWatchlist ? "#FFB800" : "none"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Bell size={24} color="#0F3460" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.stockName}>{stock.name}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.stockPrice}>NPR {stock.price.toFixed(2)}</Text>
            <View style={[
              styles.changeContainer,
              stock.change > 0 ? styles.positiveChange : styles.negativeChange
            ]}>
              {stock.change > 0 ? (
                <TrendingUp size={16} color="#10B981" />
              ) : (
                <TrendingDown size={16} color="#EF4444" />
              )}
              <Text style={[
                styles.changeText,
                stock.change > 0 ? styles.positiveChangeText : styles.negativeChangeText
              ]}>
                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.timeframeContainer}>
          {['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeframeButton,
                timeframe === time && styles.activeTimeframeButton
              ]}
              onPress={() => setTimeframe(time)}
            >
              <Text style={[
                styles.timeframeText,
                timeframe === time && styles.activeTimeframeText
              ]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.chartContainer}>
          <StockChart stock={stock as unknown as NEPSEStock} timeframe={timeframe} />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.tradeButton, styles.buyButton]}
            onPress={() => router.push({ pathname: '/(tabs)/trade', params: { symbol: stock.symbol, action: 'buy' } })}
          >
            <Text style={styles.tradeButtonText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tradeButton, styles.sellButton]}
            onPress={() => router.push({ pathname: '/(tabs)/trade', params: { symbol: stock.symbol, action: 'sell' } })}
          >
            <Text style={styles.tradeButtonText}>Sell</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'overview' && styles.activeTab
              ]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText
              ]}>
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'chart' && styles.activeTab
              ]}
              onPress={() => setActiveTab('chart')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'chart' && styles.activeTabText
              ]}>
                Chart
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'financials' && styles.activeTab
              ]}
              onPress={() => setActiveTab('financials')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'financials' && styles.activeTabText
              ]}>
                Financials
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'news' && styles.activeTab
              ]}
              onPress={() => setActiveTab('news')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'news' && styles.activeTabText
              ]}>
                News
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'analysis' && styles.activeTab
              ]}
              onPress={() => setActiveTab('analysis')}
            >
              <Text style={[
                styles.tabText,
                activeTab === 'analysis' && styles.activeTabText
              ]}>
                Analysis
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {activeTab === 'overview' && (
          <View style={styles.overviewContainer}>
            <StockStats stock={stock as unknown as NEPSEStock} />
            
            <View style={styles.aboutSection}>
              <Text style={styles.sectionTitle}>About {stock.name}</Text>
              <Text style={styles.aboutText}>
                {stock.description || `${stock.name} is a company listed on the Nepal Stock Exchange (NEPSE). It operates in the ${stock.sector} sector and has been a key player in the Nepalese market.`}
              </Text>
            </View>
            
            <View style={styles.keyMetrics}>
              <Text style={styles.sectionTitle}>Key Metrics</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Market Cap</Text>
                  <Text style={styles.metricValue}>NPR {(stock.marketCap / 1000000).toFixed(2)}M</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>P/E Ratio</Text>
                  <Text style={styles.metricValue}>{stock.pe?.toFixed(2) || 'N/A'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Dividend Yield</Text>
                  <Text style={styles.metricValue}>{stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : 'N/A'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>52W High</Text>
                  <Text style={styles.metricValue}>NPR {stock.high52W?.toFixed(2) || 'N/A'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>52W Low</Text>
                  <Text style={styles.metricValue}>NPR {stock.low52W?.toFixed(2) || 'N/A'}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Volume</Text>
                  <Text style={styles.metricValue}>{(stock.volume / 1000).toFixed(1)}K</Text>
                </View>
              </View>
            </View>
            
            <StockNews 
              stockSymbol={stock.symbol} 
              news={latestNews
                .filter(n => n.relatedSymbols.includes(stock.symbol))
                .map(news => ({
                  ...news,
                  summary: news.description || '',
                  category: news.type || 'general',
                  timestamp: news.date,
                  tags: Array.isArray(news.keywords) ? news.keywords : (typeof news.keywords === 'string' ? news.keywords.split(',') : [])
                }))} 
            />
          </View>
        )}
        
        {activeTab === 'chart' && (
          <View style={styles.chartTabContainer}>
            <View style={styles.chartTools}>
              <Text style={styles.sectionTitle}>Technical Analysis</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={styles.indicatorButton}>
                  <BarChart3 size={16} color="#0F3460" />
                  <Text style={styles.indicatorText}>Moving Average</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.indicatorButton}>
                  <BarChart3 size={16} color="#0F3460" />
                  <Text style={styles.indicatorText}>MACD</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.indicatorButton}>
                  <BarChart3 size={16} color="#0F3460" />
                  <Text style={styles.indicatorText}>RSI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.indicatorButton}>
                  <BarChart3 size={16} color="#0F3460" />
                  <Text style={styles.indicatorText}>Bollinger</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
            
            <View style={styles.expandedChartContainer}>
              <StockChart stock={stock as unknown as NEPSEStock} timeframe={timeframe} expanded={true} />
            </View>
          </View>
        )}
        
        {activeTab === 'financials' && (
          <View style={styles.financialsContainer}>
            <Text style={styles.sectionTitle}>Financial Statements</Text>
            <View style={styles.financialTabs}>
              <TouchableOpacity style={[styles.financialTab, styles.activeFinancialTab]}>
                <Text style={[styles.financialTabText, styles.activeFinancialTabText]}>Income</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.financialTab}>
                <Text style={styles.financialTabText}>Balance Sheet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.financialTab}>
                <Text style={styles.financialTabText}>Cash Flow</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.financialTable}>
              <View style={styles.financialTableHeader}>
                <Text style={styles.financialTableHeaderCell}>Item</Text>
                <Text style={styles.financialTableHeaderCell}>2023</Text>
                <Text style={styles.financialTableHeaderCell}>2022</Text>
                <Text style={styles.financialTableHeaderCell}>2021</Text>
              </View>
              
              <View style={styles.financialTableRow}>
                <Text style={styles.financialTableCell}>Revenue</Text>
                <Text style={styles.financialTableCell}>2,450M</Text>
                <Text style={styles.financialTableCell}>2,100M</Text>
                <Text style={styles.financialTableCell}>1,850M</Text>
              </View>
              
              <View style={styles.financialTableRow}>
                <Text style={styles.financialTableCell}>Gross Profit</Text>
                <Text style={styles.financialTableCell}>980M</Text>
                <Text style={styles.financialTableCell}>840M</Text>
                <Text style={styles.financialTableCell}>740M</Text>
              </View>
              
              <View style={styles.financialTableRow}>
                <Text style={styles.financialTableCell}>Operating Income</Text>
                <Text style={styles.financialTableCell}>735M</Text>
                <Text style={styles.financialTableCell}>630M</Text>
                <Text style={styles.financialTableCell}>555M</Text>
              </View>
              
              <View style={styles.financialTableRow}>
                <Text style={styles.financialTableCell}>Net Income</Text>
                <Text style={styles.financialTableCell}>490M</Text>
                <Text style={styles.financialTableCell}>420M</Text>
                <Text style={styles.financialTableCell}>370M</Text>
              </View>
              
              <View style={styles.financialTableRow}>
                <Text style={styles.financialTableCell}>EPS</Text>
                <Text style={styles.financialTableCell}>49.0</Text>
                <Text style={styles.financialTableCell}>42.0</Text>
                <Text style={styles.financialTableCell}>37.0</Text>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'news' && (
          <View style={styles.newsTabContainer}>
            <StockNews 
              stockSymbol={stock.symbol} 
              news={latestNews
                .filter(n => n.relatedSymbols.includes(stock.symbol))
                .map(news => ({
                  ...news,
                  summary: news.description || '',
                  category: news.type || 'general',
                  timestamp: news.date,
                  tags: Array.isArray(news.keywords) ? news.keywords : (typeof news.keywords === 'string' ? news.keywords.split(',') : [])
                }))}
              expanded={true} 
            />
          </View>
        )}
        
        {activeTab === 'analysis' && (
          <View style={styles.analysisContainer}>
            <StockAnalysis stock={stock} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  stockHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stockInfo: {
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  stockName: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockPrice: {
    fontSize: 24,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginRight: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  positiveChange: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  positiveChangeText: {
    color: '#10B981',
  },
  negativeChangeText: {
    color: '#EF4444',
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
  },
  activeTimeframeButton: {
    backgroundColor: 'rgba(15, 52, 96, 0.1)',
  },
  timeframeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTimeframeText: {
    color: '#0F3460',
  },
  chartContainer: {
    paddingHorizontal: 16,
    height: 200,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tradeButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  buyButton: {
    backgroundColor: '#10B981',
  },
  sellButton: {
    backgroundColor: '#E94560',
  },
  tradeButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0F3460',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#0F3460',
  },
  overviewContainer: {
    paddingHorizontal: 16,
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  keyMetrics: {
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  metricItem: {
    width: '33.33%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  chartTabContainer: {
    paddingHorizontal: 16,
  },
  chartTools: {
    marginBottom: 16,
  },
  indicatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  indicatorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
  expandedChartContainer: {
    height: 300,
    marginBottom: 16,
  },
  financialsContainer: {
    paddingHorizontal: 16,
  },
  financialTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  financialTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFinancialTab: {
    backgroundColor: '#FFFFFF',
  },
  financialTabText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeFinancialTabText: {
    color: '#0F3460',
  },
  financialTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  financialTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  financialTableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  financialTableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  financialTableCell: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#4B5563',
  },
  newsTabContainer: {
    paddingHorizontal: 16,
  },
  analysisContainer: {
    paddingHorizontal: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
});