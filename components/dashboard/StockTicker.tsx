import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';
import { useTheme } from '@/hooks/useTheme';

export default function StockTicker() {
  const { allStocks, loadingStates, errors, refreshData } = useMarketData();
  const { theme } = useTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const isLoading = loadingStates.stocks;

  // Auto-scroll animation
  useEffect(() => {
    const scrollAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -5000, // A large negative value to ensure continuous scrolling
        duration: 120000, // 2 minutes to scroll through
        useNativeDriver: true,
      })
    );
    
    scrollAnimation.start();
    
    return () => {
      scrollAnimation.stop();
    };
  }, []);

  // Handle refresh action
  const handleRefresh = () => {
    refreshData();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading market data...</Text>
        </View>
      ) : errors.stocks ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors.stocks}</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <RefreshCw size={16} color={theme.colors.primary} />
            <Text style={[styles.refreshText, { color: theme.colors.primary }]}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.scrollView, { transform: [{ translateX: scrollX }] }]}
          contentContainerStyle={styles.scrollContent}
        >
          {allStocks.map((stock, index) => (
            <View key={`${stock.symbol}-${index}`} style={styles.tickerItem}>
              <Text style={[styles.symbol, { color: theme.colors.text }]}>{stock.symbol}</Text>
              <Text 
                style={[
                  styles.price, 
                  { color: stock.change >= 0 ? theme.colors.success : theme.colors.error }
                ]}
              >
                {stock.price.toFixed(2)}
              </Text>
              <View style={styles.changeContainer}>
                {stock.change >= 0 ? (
                  <TrendingUp size={12} color={theme.colors.success} />
                ) : (
                  <TrendingDown size={12} color={theme.colors.error} />
                )}
                <Text 
                  style={[
                    styles.changeText, 
                    { color: stock.change >= 0 ? theme.colors.success : theme.colors.error }
                  ]}
                >
                  {Math.abs(stock.change).toFixed(2)}%
                </Text>
              </View>
            </View>
          ))}
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: '100%',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: '100%',
  },
  symbol: {
    fontWeight: '600',
    fontSize: 14,
    marginRight: 6,
  },
  price: {
    fontSize: 14,
    marginRight: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 12,
    marginLeft: 2,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    flex: 1,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  refreshText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
});