import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react-native';

type MarketIndexProps = {
  marketIndex: {
    id: string;
    name: string;
    value: number;
    change: number;
  };
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
};

export default function MarketIndexCard({ marketIndex, isLoading, error, onRefresh }: MarketIndexProps) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#0F3460" style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
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
    <View style={styles.container}>
      <Text style={styles.name}>{marketIndex.name}</Text>
      <Text style={styles.value}>{marketIndex.value.toFixed(2)}</Text>
      <View style={[
        styles.changeContainer,
        marketIndex.change > 0 ? styles.positiveChange : styles.negativeChange
      ]}>
        {marketIndex.change > 0 ? (
          <TrendingUp size={12} color="#10B981" />
        ) : (
          <TrendingDown size={12} color="#EF4444" />
        )}
        <Text style={[
          styles.changeText,
          marketIndex.change > 0 ? styles.positiveChangeText : styles.negativeChangeText
        ]}>
          {marketIndex.change > 0 ? '+' : ''}{marketIndex.change.toFixed(2)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 150,
    minHeight: 100,
    marginRight: 12,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
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
  loader: {
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#0F3460',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 52, 96, 0.1)',
    borderRadius: 4,
    alignSelf: 'center',
  },
  refreshText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
});