import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NEPSEStock } from '@/types';

interface StockStatsProps {
  stock: NEPSEStock;
}

export default function StockStats({ stock }: StockStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Open</Text>
          <Text style={styles.statValue}>NPR {stock.open?.toFixed(2) || 'N/A'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={styles.statValue}>NPR {stock.high?.toFixed(2) || 'N/A'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={styles.statValue}>NPR {stock.low?.toFixed(2) || 'N/A'}</Text>
        </View>
      </View>
      
      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>{(stock.volume / 1000).toFixed(1)}K</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg Vol</Text>
          <Text style={styles.statValue}>{((stock.volume * 0.8) / 1000).toFixed(1)}K</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>{(stock.marketCap / 1000000).toFixed(1)}M</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
});