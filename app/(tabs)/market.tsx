import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, TrendingUp, TrendingDown, ArrowUpDown, Filter } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';

type SortOption = 'name' | 'price' | 'change' | 'volume';
type SortDirection = 'asc' | 'desc';

export default function MarketScreen() {
  const { allStocks } = useMarketData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [activeTab, setActiveTab] = useState('all');
  
  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };
  
  const sortedStocks = [...allStocks].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortDirection === 'asc' 
        ? a.price - b.price
        : b.price - a.price;
    } else if (sortBy === 'change') {
      return sortDirection === 'asc' 
        ? a.change - b.change
        : b.change - a.change;
    } else if (sortBy === 'volume') {
      return sortDirection === 'asc' 
        ? a.volume - b.volume
        : b.volume - a.volume;
    }
    return 0;
  });
  
  const filteredStocks = sortedStocks.filter((stock) => {
    if (searchQuery) {
      return (
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeTab === 'gainers') {
      return stock.change > 0;
    } else if (activeTab === 'losers') {
      return stock.change < 0;
    }
    
    return true;
  });
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Market</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stocks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#0F3460" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'gainers' && styles.activeTab]}
          onPress={() => setActiveTab('gainers')}
        >
          <Text style={[styles.tabText, activeTab === 'gainers' && styles.activeTabText]}>Gainers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'losers' && styles.activeTab]}
          onPress={() => setActiveTab('losers')}
        >
          <Text style={[styles.tabText, activeTab === 'losers' && styles.activeTabText]}>Losers</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'watchlist' && styles.activeTab]}
          onPress={() => setActiveTab('watchlist')}
        >
          <Text style={[styles.tabText, activeTab === 'watchlist' && styles.activeTabText]}>Watchlist</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.tableHeaderContainer}>
        <TouchableOpacity 
          style={styles.tableHeader}
          onPress={() => handleSort('name')}
        >
          <Text style={styles.tableHeaderText}>Name</Text>
          {sortBy === 'name' && (
            <ArrowUpDown size={14} color="#0F3460" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tableHeader, styles.centerHeader]}
          onPress={() => handleSort('price')}
        >
          <Text style={styles.tableHeaderText}>Price</Text>
          {sortBy === 'price' && (
            <ArrowUpDown size={14} color="#0F3460" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tableHeader, styles.centerHeader]}
          onPress={() => handleSort('change')}
        >
          <Text style={styles.tableHeaderText}>Change</Text>
          {sortBy === 'change' && (
            <ArrowUpDown size={14} color="#0F3460" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tableHeader, styles.rightHeader]}
          onPress={() => handleSort('volume')}
        >
          <Text style={styles.tableHeaderText}>Volume</Text>
          {sortBy === 'volume' && (
            <ArrowUpDown size={14} color="#0F3460" />
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.stockRow}
            onPress={() => router.push(`/stock/${item.symbol}`)}
          >
            <View style={styles.stockNameColumn}>
              <Text style={styles.stockSymbol}>{item.symbol}</Text>
              <Text style={styles.stockName}>{item.name}</Text>
            </View>
            <View style={styles.stockPriceColumn}>
              <Text style={styles.stockPrice}>NPR {item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.stockChangeColumn}>
              <View style={[
                styles.changeContainer,
                item.change > 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {item.change > 0 ? (
                  <TrendingUp size={12} color="#10B981" />
                ) : (
                  <TrendingDown size={12} color="#EF4444" />
                )}
                <Text style={[
                  styles.changeText,
                  item.change > 0 ? styles.positiveChangeText : styles.negativeChangeText
                ]}>
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
                </Text>
              </View>
            </View>
            <View style={styles.stockVolumeColumn}>
              <Text style={styles.stockVolume}>{(item.volume / 1000).toFixed(1)}K</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.stocksList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  activeTab: {
    backgroundColor: '#0F3460',
  },
  tabText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tableHeaderContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: 16,
  },
  tableHeader: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerHeader: {
    flex: 1,
    justifyContent: 'center',
  },
  rightHeader: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  tableHeaderText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  stocksList: {
    paddingBottom: 100,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stockRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stockNameColumn: {
    flex: 2,
  },
  stockSymbol: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#0F3460',
  },
  stockName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  stockPriceColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  stockPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#0F3460',
  },
  stockChangeColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positiveChange: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeChange: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 2,
  },
  positiveChangeText: {
    color: '#10B981',
  },
  negativeChangeText: {
    color: '#EF4444',
  },
  stockVolumeColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stockVolume: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#6B7280',
  },
});