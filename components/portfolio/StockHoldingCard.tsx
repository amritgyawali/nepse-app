import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';

type StockHoldingCardProps = {
  holding: {
    symbol: string;
    name: string;
    quantity: number;
    buyPrice: number;
    currentPrice: number;
  };
  onPress: () => void;
};

export default function StockHoldingCard({ holding, onPress }: StockHoldingCardProps) {
  const calculateProfitLoss = () => {
    const invested = holding.quantity * holding.buyPrice;
    const current = holding.quantity * holding.currentPrice;
    return current - invested;
  };
  
  const calculateProfitLossPercentage = () => {
    const invested = holding.quantity * holding.buyPrice;
    const profitLoss = calculateProfitLoss();
    return (profitLoss / invested) * 100;
  };
  
  const profitLoss = calculateProfitLoss();
  const profitLossPercentage = calculateProfitLossPercentage();
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.holdingInfo}>
        <Text style={styles.symbol}>{holding.symbol}</Text>
        <Text style={styles.name}>{holding.name}</Text>
        <Text style={styles.quantity}>{holding.quantity} Shares</Text>
      </View>
      <View style={styles.valueInfo}>
        <Text style={styles.currentValue}>
          NPR {(holding.quantity * holding.currentPrice).toFixed(2)}
        </Text>
        <View style={[
          styles.profitContainer,
          profitLoss > 0 ? styles.positiveProfit : styles.negativeProfit
        ]}>
          {profitLoss > 0 ? (
            <TrendingUp size={12} color="#10B981" />
          ) : (
            <TrendingDown size={12} color="#EF4444" />
          )}
          <Text style={[
            styles.profitText,
            profitLoss > 0 ? styles.positiveProfitText : styles.negativeProfitText
          ]}>
            {profitLoss > 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercentage.toFixed(2)}%)
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
  holdingInfo: {
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
    marginBottom: 4,
  },
  quantity: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  valueInfo: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 4,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  positiveProfit: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeProfit: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  profitText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    marginLeft: 4,
  },
  positiveProfitText: {
    color: '#10B981',
  },
  negativeProfitText: {
    color: '#EF4444',
  },
});