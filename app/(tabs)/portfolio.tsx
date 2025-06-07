import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, ArrowRight, Bell, CircleAlert as AlertCircle, ChartPie as PieChartIcon } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';
import PortfolioChart from '@/components/portfolio/PortfolioChart';
import StockHoldingCard from '@/components/portfolio/StockHoldingCard';

export default function PortfolioScreen() {
  const { holdings } = useMarketData();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('holdings');
  const [timeframe, setTimeframe] = useState('1M');
  
  const calculateTotalValue = () => {
    return holdings.reduce((total, holding) => total + (holding.quantity * holding.currentPrice), 0);
  };
  
  const calculateTotalProfit = () => {
    return holdings.reduce((total, holding) => {
      const investedAmount = Number(holding.quantity) * Number(holding.buyPrice);
      const currentAmount = holding.quantity * holding.currentPrice;
      return total + (currentAmount - investedAmount);
    }, 0);
  };
  
  const calculateProfitPercentage = () => {
    const totalInvested = holdings.reduce((total, holding) => total + (Number(holding.quantity) * Number(holding.buyPrice)), 0);
    const totalProfit = calculateTotalProfit();
    return (totalProfit / totalInvested) * 100;
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Portfolio</Text>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#0F3460" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.summaryCard}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Value</Text>
            <Text style={styles.balanceValue}>NPR {calculateTotalValue().toFixed(2)}</Text>
            <View style={styles.profitContainer}>
              {calculateTotalProfit() >= 0 ? (
                <>
                  <TrendingUp size={16} color="#10B981" />
                  <Text style={styles.profitText}>
                    +NPR {calculateTotalProfit().toFixed(2)} ({calculateProfitPercentage().toFixed(2)}%)
                  </Text>
                </>
              ) : (
                <>
                  <TrendingDown size={16} color="#EF4444" />
                  <Text style={[styles.profitText, styles.lossText]}>
                    NPR {calculateTotalProfit().toFixed(2)} ({calculateProfitPercentage().toFixed(2)}%)
                  </Text>
                </>
              )}
            </View>
          </View>
          
          <View style={styles.timeframeContainer}>
            {['1D', '1W', '1M', '3M', '1Y', 'All'].map((time) => (
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
            <PortfolioChart timeframe={timeframe} />
          </View>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'holdings' && styles.activeTab
            ]}
            onPress={() => setActiveTab('holdings')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'holdings' && styles.activeTabText
            ]}>
              Holdings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'transactions' && styles.activeTab
            ]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'transactions' && styles.activeTabText
            ]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'dividends' && styles.activeTab
            ]}
            onPress={() => setActiveTab('dividends')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'dividends' && styles.activeTabText
            ]}>
              Dividends
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'holdings' && (
          <View style={styles.holdingsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Stocks</Text>
              <View style={styles.allocationContainer}>
                <PieChartIcon size={16} color="#0F3460" />
                <Text style={styles.allocationText}>Allocation</Text>
              </View>
            </View>
            
            {holdings.length > 0 ? (
              <View style={styles.holdingsList}>
                {holdings.map((holding) => (
                  <StockHoldingCard
                    key={holding.symbol}
                    holding={{
                      symbol: holding.symbol,
                      name: holding.name?.toString() ?? holding.symbol,
                      quantity: holding.quantity,
                      buyPrice: Number(holding.buyPrice),
                      currentPrice: holding.currentPrice
                    }}
                    onPress={() => router.push(`/stock/${holding.symbol}`)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/6771607/pexels-photo-6771607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
                  style={styles.emptyStateImage}
                />
                <Text style={styles.emptyStateTitle}>No Holdings Yet</Text>
                <Text style={styles.emptyStateDescription}>
                  Start your investment journey by buying your first stock
                </Text>
                <TouchableOpacity 
                  style={styles.startInvestingButton}
                  onPress={() => router.push('/(tabs)/trade')}
                >
                  <Text style={styles.startInvestingButtonText}>Start Investing</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'transactions' && (
          <View style={styles.transactionsContainer}>
            <View style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View>
                  <Text style={styles.transactionTitle}>Bought ADBL</Text>
                  <Text style={styles.transactionDate}>June 15, 2024</Text>
                </View>
                <Text style={styles.transactionAmount}>NPR 42,000.00</Text>
              </View>
              <View style={styles.transactionDetails}>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Quantity</Text>
                  <Text style={styles.transactionDetailValue}>100</Text>
                </View>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Price</Text>
                  <Text style={styles.transactionDetailValue}>NPR 420.00</Text>
                </View>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Total</Text>
                  <Text style={styles.transactionDetailValue}>NPR 42,000.00</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View>
                  <Text style={styles.transactionTitle}>Sold NABIL</Text>
                  <Text style={styles.transactionDate}>June 10, 2024</Text>
                </View>
                <Text style={styles.transactionAmount}>NPR 36,500.00</Text>
              </View>
              <View style={styles.transactionDetails}>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Quantity</Text>
                  <Text style={styles.transactionDetailValue}>50</Text>
                </View>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Price</Text>
                  <Text style={styles.transactionDetailValue}>NPR 730.00</Text>
                </View>
                <View style={styles.transactionDetail}>
                  <Text style={styles.transactionDetailLabel}>Total</Text>
                  <Text style={styles.transactionDetailValue}>NPR 36,500.00</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        
        {activeTab === 'dividends' && (
          <View style={styles.dividendsContainer}>
            <View style={styles.emptyState}>
              <AlertCircle size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Dividends Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Dividend information will appear here when companies announce distributions
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.fundsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Funds</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Manage</Text>
              <ArrowRight size={16} color="#0F3460" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.fundsCard}>
            <View style={styles.fundItem}>
              <Text style={styles.fundLabel}>Available Balance</Text>
              <Text style={styles.fundValue}>NPR 125,000.00</Text>
            </View>
            <View style={styles.fundDivider} />
            <View style={styles.fundItem}>
              <Text style={styles.fundLabel}>Invested Value</Text>
              <Text style={styles.fundValue}>NPR 1,120,678.90</Text>
            </View>
            <View style={styles.fundDivider} />
            <View style={styles.fundButtons}>
              <TouchableOpacity style={styles.fundButton}>
                <Text style={styles.fundButtonText}>Add Funds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.fundButton, styles.withdrawButton]}>
                <Text style={[styles.fundButtonText, styles.withdrawButtonText]}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceContainer: {
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  balanceValue: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
    marginVertical: 4,
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
  lossText: {
    color: '#EF4444',
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    height: 200,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#0F3460',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  holdingsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  allocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
  holdingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    borderRadius: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startInvestingButton: {
    backgroundColor: '#0F3460',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startInvestingButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  transactionsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionDetail: {
    alignItems: 'center',
  },
  transactionDetailLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  transactionDetailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
  },
  dividendsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  fundsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginRight: 4,
  },
  fundsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fundItem: {
    marginVertical: 8,
  },
  fundLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  fundValue: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  fundDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  fundButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  fundButton: {
    flex: 1,
    backgroundColor: '#0F3460',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  fundButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  withdrawButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#0F3460',
  },
  withdrawButtonText: {
    color: '#0F3460',
  },
});