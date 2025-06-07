import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Bell, Search, ExternalLink, RefreshCw } from 'lucide-react-native';
import MarketIndexCard from '@/components/dashboard/MarketIndexCard';
import WatchlistCard from '@/components/dashboard/WatchlistCard';
import NewsCard from '@/components/dashboard/NewsCard';
import { useMarketData } from '@/hooks/useMarketData';
import { useAuth } from '@/hooks/useAuth';
import StockTicker from '@/components/dashboard/StockTicker';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { marketIndices, watchlist, topGainers, topLosers, latestNews, loadingStates, errors, refreshData } = useMarketData();
  const router = useRouter();
  
  // Add state for top movers tab
  const [activeTopMoversTab, setActiveTopMoversTab] = useState('gainers');
  
  function handleRefresh(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.fullName || 'Trader'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={24} color="#0F3460" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={24} color="#0F3460" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Add Stock Ticker */}
        <StockTicker />
        
        <View style={styles.portfolioSummary}>
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Portfolio Value</Text>
            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <ExternalLink size={16} color="#0F3460" />
            </TouchableOpacity>
          </View>
          <Text style={styles.portfolioValue}>NPR 1,245,678.90</Text>
          <View style={styles.profitContainer}>
            <TrendingUp size={16} color="#10B981" />
            <Text style={styles.profitText}>+NPR 12,345.67 (4.32%)</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Market Indices</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.marketIndicesContainer}
          >
            {marketIndices.map((index) => (
              <MarketIndexCard key={index.id} marketIndex={{
                id: index.id as string,
                name: index.name,
                value: index.value,
                change: index.change
              }} />
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Watchlist</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.watchlistContainer}>
            {watchlist.length > 0 ? (
              watchlist.slice(0, 5).map((stock) => (
                <WatchlistCard 
                  key={stock.symbol} 
                  stock={stock} 
                  onPress={() => router.push(`/stock/${stock.symbol}`)}
                />
              ))
            ) : errors.stocks ? (
              <WatchlistCard 
                stock={{
                  symbol: 'ERROR',
                  name: 'Unable to load watchlist',
                  price: 0,
                  change: 0
                }}
                onPress={() => {}}
                error={errors.stocks}
                onRefresh={refreshData}
              />
            ) : loadingStates.stocks ? (
              <WatchlistCard 
                stock={{
                  symbol: 'LOADING',
                  name: 'Loading watchlist...', 
                  price: 0,
                  change: 0
                }}
                onPress={() => {}}
                isLoading={true}
              />
            ) : (
              <WatchlistCard 
                stock={{
                  symbol: 'EMPTY',
                  name: 'No stocks in watchlist',
                  price: 0,
                  change: 0
                }}
                onPress={() => {}}
              />
            )}
          </View>
        </View>
        
        <View style={styles.topMoversContainer}>
          <View style={styles.topMoversHeader}>
            <Text style={styles.sectionTitle}>Top Movers</Text>
            <View style={styles.headerActionsRow}>
              {loadingStates.gainers || loadingStates.losers ? (
                <ActivityIndicator size="small" color="#0F3460" style={styles.smallLoader} />
              ) : (errors.gainers || errors.losers) && (
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                  <RefreshCw size={16} color="#0F3460" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              )}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tab, activeTopMoversTab === 'gainers' && styles.activeTab]}
                  onPress={() => setActiveTopMoversTab('gainers')}
                >
                  <Text style={[styles.tabText, activeTopMoversTab === 'gainers' && styles.activeTabText]}>Gainers</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTopMoversTab === 'losers' && styles.activeTab]}
                  onPress={() => setActiveTopMoversTab('losers')}
                >
                  <Text style={[styles.tabText, activeTopMoversTab === 'losers' && styles.activeTabText]}>Losers</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          {activeTopMoversTab === 'gainers' ? (
            topGainers.length > 0 ? (
              <FlatList
                data={topGainers.slice(0, 5)}
                keyExtractor={(item) => item.symbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.topMoverCard}
                    onPress={() => router.push(`/stock/${item.symbol}`)}
                  >
                    <View style={styles.topMoverHeader}>
                      <Text style={styles.topMoverSymbol}>{item.symbol}</Text>
                      <View style={styles.topMoverChangeContainer}>
                        <TrendingUp size={12} color="#10B981" />
                        <Text style={styles.topMoverChangeText}>{item.changePercent.toFixed(2)}%</Text>
                      </View>
                    </View>
                    <Text style={styles.topMoverName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.topMoverPrice}>NPR {item.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : errors.gainers ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.errorText}>{errors.gainers}</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                  <RefreshCw size={16} color="#0F3460" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : loadingStates.gainers ? (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#0F3460" />
                <Text style={styles.loadingText}>Loading top gainers...</Text>
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyText}>No top gainers available</Text>
              </View>
            )
          ) : (
            topLosers.length > 0 ? (
              <FlatList
                data={topLosers.slice(0, 5)}
                keyExtractor={(item) => item.symbol}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.topMoverCard}
                    onPress={() => router.push(`/stock/${item.symbol}`)}
                  >
                    <View style={styles.topMoverHeader}>
                      <Text style={styles.topMoverSymbol}>{item.symbol}</Text>
                      <View style={styles.topMoverChangeContainer}>
                        <TrendingDown size={12} color="#EF4444" />
                        <Text style={[styles.topMoverChangeText, styles.negativeChangeText]}>{Math.abs(item.changePercent).toFixed(2)}%</Text>
                      </View>
                    </View>
                    <Text style={styles.topMoverName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.topMoverPrice}>NPR {item.price.toFixed(2)}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : errors.losers ? (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.errorText}>{errors.losers}</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                  <RefreshCw size={16} color="#0F3460" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : loadingStates.losers ? (
              <View style={styles.emptyStateContainer}>
                <ActivityIndicator size="large" color="#0F3460" />
                <Text style={styles.loadingText}>Loading top losers...</Text>
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyText}>No top losers available</Text>
              </View>
            )
          )}
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest News</Text>
            <View style={styles.headerActions}>
              {loadingStates.news ? (
                <ActivityIndicator size="small" color="#0F3460" style={styles.smallLoader} />
              ) : errors.news && (
                <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
                  <RefreshCw size={16} color="#0F3460" />
                  <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.newsContainer}>
            {latestNews.length > 0 ? (
              latestNews.slice(0, 3).map((news) => (
                <NewsCard 
                  key={news.id} 
                  news={{
                    ...news,
                    imageUrl: news.imageUrl || 'https://via.placeholder.com/100',
                    relatedSymbols: news.relatedSymbols || []
                  }} 
                  onPress={() => {
                    // Since there's no news route defined, show an alert instead
                    Alert.alert(
                      news.title,
                      news.description,
                      [
                        { text: 'Close', style: 'cancel' },
                        { 
                          text: 'View Details', 
                          onPress: () => console.log(`News details for ID: ${news.id}`) 
                        }
                      ]
                    );
                  }}
                />
              ))
            ) : errors.news ? (
              <NewsCard 
                news={{
                  id: 'error',
                  title: 'Unable to load news',
                  source: '',
                  date: '',
                  imageUrl: '',
                  relatedSymbols: []
                }}
                onPress={() => {}}
                error={errors.news}
                onRefresh={refreshData}
              />
            ) : loadingStates.news ? (
              <NewsCard 
                news={{
                  id: 'loading',
                  title: '',
                  source: '',
                  date: '',
                  imageUrl: '',
                  relatedSymbols: []
                }}
                onPress={() => {}}
                isLoading={true}
              />
            ) : (
              <NewsCard 
                news={{
                  id: 'empty',
                  title: 'No news available',
                  source: '',
                  date: '',
                  imageUrl: '',
                  relatedSymbols: []
                }}
                onPress={() => {}}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  username: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallLoader: {
    marginRight: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  portfolioSummary: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginRight: 4,
  },
  portfolioValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
    marginBottom: 4,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profitText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
    marginLeft: 4,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#E94560',
  },
  marketIndicesContainer: {
    paddingRight: 16,
    paddingBottom: 8,
  },
  watchlistContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 100,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  refreshText: {
    fontSize: 12,
    color: '#0F3460',
    marginLeft: 4,
    fontWeight: '500',
  },
  topMoversContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  topMoversHeader: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#0F3460',
  },
  topMoversContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topMoverCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topMoverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topMoverSymbol: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  topMoverName: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 8,
    height: 40,
  },
  topMoverPrice: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  topMoverChangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topMoverChangeText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#10B981',
    marginLeft: 2,
  },
  negativeChangeText: {
    color: '#EF4444',
  },
  newsContainer: {
    gap: 16,
  },
});