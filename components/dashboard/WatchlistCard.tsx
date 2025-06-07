import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react-native';

type WatchlistCardProps = {
  stock: {
    symbol: string;
    name: string;
    price: number;
    change: number;
  };
  onPress: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export default function WatchlistCard({ stock, onPress, isLoading = false, error = null, onRefresh }: WatchlistCardProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#0F3460" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <RefreshCw size={16} color="#0F3460" />
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.stockInfo}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name}>{stock.name}</Text>
      </View>
      <View style={styles.priceInfo}>
        <Text style={styles.price}>NPR {stock.price.toFixed(2)}</Text>
        <View style={[
          styles.changeContainer,
          stock.change > 0 ? styles.positiveChange : styles.negativeChange
        ]}>
          {stock.change > 0 ? (
            <TrendingUp size={12} color="#10B981" />
          ) : (
            <TrendingDown size={12} color="#EF4444" />
          )}
          <Text style={[
            styles.changeText,
            stock.change > 0 ? styles.positiveChangeText : styles.negativeChangeText
          ]}>
            {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  loadingContainer: {
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#EF4444',
    marginBottom: 8,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
  stockInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  name: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 4,
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
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  positiveChangeText: {
    color: '#10B981',
  },
  negativeChangeText: {
    color: '#EF4444',
  },
});