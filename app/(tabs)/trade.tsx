import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, ChevronDown, ArrowRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useMarketData } from '@/hooks/useMarketData';
import type { NEPSEStock, OrderType, OrderSide, PortfolioHolding } from '@/types';

interface OrderFormData {
  stock: NEPSEStock | null;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  price: number;
  triggerPrice?: number;
  isAdvanced: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export default function TradeScreen() {
  const { allStocks, holdings, updateHoldings } = useMarketData();
  const router = useRouter();
  
  // Form state
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    stock: allStocks.length > 0 ? allStocks[0] as unknown as NEPSEStock : null,
    orderType: 'market' as OrderType,
    side: 'buy' as OrderSide,
    quantity: 1,
    price: allStocks[0]?.price || 0,
    triggerPrice: 0,
    isAdvanced: false
  });
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockPicker, setShowStockPicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation functions
  const validateOrder = useCallback((form: OrderFormData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!form.stock) {
      errors.push({ field: 'stock', message: 'Please select a stock' });
    }
    
    if (form.quantity <= 0) {
      errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
    }
    
    if (form.orderType !== 'market' && form.price <= 0) {
      errors.push({ field: 'price', message: 'Price must be greater than 0' });
    }
    
    if (form.orderType === 'stop_loss' && (!form.triggerPrice || form.triggerPrice <= 0)) {
      errors.push({ field: 'triggerPrice', message: 'Trigger price must be greater than 0' });
    }
    
    // Check if user has enough shares for sell orders
    if (form.side === 'sell' && form.stock) {
      const holding = holdings.find(h => h.symbol === form.stock!.symbol);
      if (!holding || holding.quantity < form.quantity) {
        errors.push({ 
          field: 'quantity', 
          message: `Insufficient shares. Available: ${holding?.quantity || 0}` 
        });
      }
    }
    
    return errors;
  }, [holdings]);
  
  // Memoized calculations
  const filteredStocks = useMemo(() => 
    allStocks.filter(stock => 
      stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    ), [allStocks, searchQuery]
  );
  
  const orderTotal = useMemo(() => {
    const price = orderForm.orderType === 'market' 
      ? orderForm.stock?.price || 0 
      : orderForm.price;
    return orderForm.quantity * price;
  }, [orderForm.quantity, orderForm.price, orderForm.orderType, orderForm.stock?.price]);
  
  const availableShares = useMemo(() => {
    if (!orderForm.stock) return 0;
    const holding = holdings.find(h => h.symbol === orderForm.stock!.symbol);
    return holding?.quantity || 0;
  }, [orderForm.stock, holdings]);
  
  // Form handlers
  const updateOrderForm = useCallback((updates: Partial<OrderFormData>) => {
    setOrderForm(prev => ({ ...prev, ...updates }));
    setValidationErrors([]);
  }, []);
  
  const handleStockSelect = useCallback((stock: NEPSEStock) => {
    updateOrderForm({
      stock,
      price: stock.price
    });
    setShowStockPicker(false);
  }, [updateOrderForm]);
  
  const handleQuantityChange = useCallback((text: string) => {
    const quantity = parseInt(text) || 0;
    updateOrderForm({ quantity });
  }, [updateOrderForm]);
  
  const handlePriceChange = useCallback((text: string) => {
    const price = parseFloat(text) || 0;
    updateOrderForm({ price });
  }, [updateOrderForm]);
  
  const handlePlaceOrder = useCallback(async () => {
    if (isSubmitting) return;
    
    const errors = validateOrder(orderForm);
    if (errors.length > 0) {
      setValidationErrors(errors);
      Alert.alert('Validation Error', errors[0].message);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const orderPrice = orderForm.orderType === 'market' 
        ? orderForm.stock!.price 
        : orderForm.price;
      
      const orderData = {
        stock: orderForm.stock!,
        type: orderForm.orderType,
        side: orderForm.side,
        quantity: orderForm.quantity,
        price: orderPrice,
        triggerPrice: orderForm.triggerPrice,
        total: orderTotal,
        timestamp: new Date().toISOString()
      };
      
      const confirmationMessage = `${orderForm.side.toUpperCase()} ${orderForm.quantity} shares of ${orderForm.stock!.symbol} at ${orderForm.orderType === 'market' ? 'market price' : `NPR ${orderPrice.toFixed(2)}`}\n\nTotal: NPR ${orderTotal.toFixed(2)}`;
      
      Alert.alert(
        'Order Confirmation',
        confirmationMessage,
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setIsSubmitting(false) },
          { 
            text: 'Confirm', 
            onPress: async () => {
              try {
                await processOrder(orderData);
                Alert.alert('Success', 'Order placed successfully!');
                resetForm();
              } catch (error) {
                Alert.alert('Error', 'Failed to place order. Please try again.');
              } finally {
                setIsSubmitting(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
      setIsSubmitting(false);
    }
  }, [orderForm, isSubmitting, validateOrder, orderTotal]);
  
  const processOrder = useCallback(async (orderData: any) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (orderForm.side === 'buy') {
      const existingHolding = holdings.find(h => h.symbol === orderForm.stock!.symbol);
      if (existingHolding) {
        const totalQuantity = existingHolding.quantity + orderForm.quantity;
        const totalValue = (existingHolding.averagePrice * existingHolding.quantity) + (orderData.price * orderForm.quantity);
        const updatedHolding: PortfolioHolding = {
          ...existingHolding,
          quantity: totalQuantity,
          averagePrice: totalValue / totalQuantity,
          currentPrice: orderForm.stock!.price,
          totalValue: totalQuantity * orderForm.stock!.price,
          profitLoss: (totalQuantity * orderForm.stock!.price) - (totalQuantity * existingHolding.averagePrice),
          profitLossPercentage: (((totalQuantity * orderForm.stock!.price) - (totalQuantity * existingHolding.averagePrice)) / (totalQuantity * existingHolding.averagePrice)) * 100,
          transactions: []
        };
        updateHoldings(
          holdings.map(h => h.symbol === orderForm.stock!.symbol ? updatedHolding : h),
          'update',
          orderForm.stock!.symbol,
          updatedHolding
        );
      } else {
        const newHolding: PortfolioHolding = {
          symbol: orderForm.stock!.symbol,
          name: orderForm.stock!.name,
          quantity: orderForm.quantity,
          averagePrice: orderData.price,
          currentPrice: orderForm.stock!.price,
          totalValue: orderForm.quantity * orderForm.stock!.price,
          profitLoss: (orderForm.stock!.price - orderData.price) * orderForm.quantity,
          profitLossPercentage: ((orderForm.stock!.price - orderData.price) / orderData.price) * 100,
          transactions: [],
          gainLoss: 0,
          gainLossPercent: 0
        };
        updateHoldings(
          [...holdings, newHolding],
          'add',
          newHolding.symbol,
          newHolding
        );
      }
    } else if (orderForm.side === 'sell') {
      const existingHolding = holdings.find(h => h.symbol === orderForm.stock!.symbol);
      if (existingHolding) {
        const remainingQuantity = existingHolding.quantity - orderForm.quantity;
        if (remainingQuantity <= 0) {
          updateHoldings(
            holdings.filter(h => h.symbol !== orderForm.stock!.symbol),
            'delete',
            orderForm.stock!.symbol
          );
        } else {
          const updatedHolding: PortfolioHolding = {
            ...existingHolding,
            quantity: remainingQuantity,
            currentPrice: orderForm.stock!.price,
            totalValue: remainingQuantity * orderForm.stock!.price,
            profitLoss: (remainingQuantity * orderForm.stock!.price) - (remainingQuantity * existingHolding.averagePrice),
            profitLossPercentage: ((remainingQuantity * orderForm.stock!.price - remainingQuantity * existingHolding.averagePrice) / (remainingQuantity * existingHolding.averagePrice)) * 100,
            transactions: []
          };
          updateHoldings(
            holdings.map(h => h.symbol === orderForm.stock!.symbol ? updatedHolding : h),
            'update',
            orderForm.stock!.symbol,
            updatedHolding
          );
        }
      } else {
        Alert.alert('Error', 'You do not own this stock to sell.');
      }
    }
  }, [orderForm, holdings, updateHoldings]);
  
  const resetForm = useCallback(() => {
    setOrderForm({
      stock: (allStocks[0] as unknown as NEPSEStock) || null,
      orderType: 'market' as OrderType,
      side: 'buy' as OrderSide,
      quantity: 1,
      price: allStocks[0]?.price || 0,
      triggerPrice: 0,
      isAdvanced: false
    });
    setValidationErrors([]);
  }, [allStocks]);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Trade</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.stockSelector}>
            <Text style={styles.label}>Select Stock</Text>
            <TouchableOpacity 
              style={[styles.stockPickerButton, validationErrors.some(e => e.field === 'stock') && styles.errorBorder]}
              onPress={() => setShowStockPicker(!showStockPicker)}
            >
              <View style={styles.selectedStock}>
                <Text style={styles.stockSymbol}>{orderForm.stock?.symbol || 'Select Stock'}</Text>
                <Text style={styles.stockName}>{orderForm.stock?.name || 'Choose a stock to trade'}</Text>
              </View>
              <ChevronDown size={20} color="#0F3460" />
            </TouchableOpacity>
            {validationErrors.find(e => e.field === 'stock') && (
              <Text style={styles.errorText}>{validationErrors.find(e => e.field === 'stock')?.message}</Text>
            )}
            
            {showStockPicker && (
              <View style={styles.stockPickerContainer}>
                <View style={styles.searchContainer}>
                  <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <ScrollView 
                  style={styles.stockList}
                  showsVerticalScrollIndicator={false}
                >
                  {filteredStocks.map((stock) => (
                    <TouchableOpacity
                      key={stock.symbol}
                      style={styles.stockItem}
                      onPress={() => handleStockSelect(stock as unknown as NEPSEStock)}
                    >
                      <View>
                        <Text style={styles.stockItemSymbol}>{stock.symbol}</Text>
                        <Text style={styles.stockItemName}>{stock.name}</Text>
                      </View>
                      <Text style={styles.stockItemPrice}>NPR {stock.price}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          <View style={styles.actionTabs}>
            <TouchableOpacity
              style={[
                styles.actionTab,
                orderForm.side === 'buy' && styles.activeActionTab
              ]}
              onPress={() => updateOrderForm({ side: 'buy' as OrderSide })}
            >
              <Text style={[
                styles.actionTabText,
                orderForm.side === 'buy' && styles.activeActionTabText
              ]}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionTab,
                orderForm.side === 'sell' && styles.activeActionTab
              ]}
              onPress={() => updateOrderForm({ side: 'sell' as OrderSide })}
            >
              <Text style={[
                styles.actionTabText,
                orderForm.side === 'sell' && styles.activeActionTabText
              ]}>Sell</Text>
            </TouchableOpacity>
          </View>
          
          {orderForm.side === 'sell' && (
            <Text style={styles.availableShares}>Available: {availableShares} shares</Text>
          )}
          
          <View style={styles.orderTypeTabs}>
            <TouchableOpacity
              style={[
                styles.orderTypeTab,
                orderForm.orderType === 'market' && styles.activeOrderTypeTab
              ]}
              onPress={() => updateOrderForm({ orderType: 'market' as OrderType })}
            >
              <Text style={[
                styles.orderTypeTabText,
                orderForm.orderType === 'market' && styles.activeOrderTypeTabText
              ]}>Market</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeTab,
                orderForm.orderType === 'limit' && styles.activeOrderTypeTab
              ]}
              onPress={() => updateOrderForm({ orderType: 'limit' as OrderType })}
            >
              <Text style={[
                styles.orderTypeTabText,
                orderForm.orderType === 'limit' && styles.activeOrderTypeTabText
              ]}>Limit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeTab,
                orderForm.orderType === 'stop_loss' && styles.activeOrderTypeTab
              ]}
              onPress={() => updateOrderForm({ orderType: 'stop_loss' as OrderType })}
            >
              <Text style={[
                styles.orderTypeTabText,
                orderForm.orderType === 'stop_loss' && styles.activeOrderTypeTabText
              ]}>Stop-Loss</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={[styles.input, validationErrors.some(e => e.field === 'quantity') && styles.errorBorder]}
                keyboardType="numeric"
                value={orderForm.quantity.toString()}
                onChangeText={handleQuantityChange}
              />
              {validationErrors.find(e => e.field === 'quantity') && (
                <Text style={styles.errorText}>{validationErrors.find(e => e.field === 'quantity')?.message}</Text>
              )}
            </View>
            
            {orderForm.orderType !== 'market' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (NPR)</Text>
                <TextInput
                  style={[styles.input, validationErrors.some(e => e.field === 'price') && styles.errorBorder]}
                  keyboardType="numeric"
                  value={orderForm.price.toString()}
                  onChangeText={handlePriceChange}
                />
                {validationErrors.find(e => e.field === 'price') && (
                  <Text style={styles.errorText}>{validationErrors.find(e => e.field === 'price')?.message}</Text>
                )}
              </View>
            )}
            
            {orderForm.orderType === 'stop_loss' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Trigger Price (NPR)</Text>
                <TextInput
                  style={[styles.input, validationErrors.some(e => e.field === 'triggerPrice') && styles.errorBorder]}
                  keyboardType="numeric"
                  value={orderForm.triggerPrice?.toString() || ''}
                  onChangeText={(text) => updateOrderForm({ triggerPrice: parseFloat(text) || 0 })}
                />
                {validationErrors.find(e => e.field === 'triggerPrice') && (
                  <Text style={styles.errorText}>{validationErrors.find(e => e.field === 'triggerPrice')?.message}</Text>
                )}
              </View>
            )}
            
            <View style={styles.advancedOptionsToggle}>
              <Text style={styles.label}>Advanced Options</Text>
              <Switch
                trackColor={{ false: '#D1D5DB', true: 'rgba(233, 69, 96, 0.4)' }}
                thumbColor={orderForm.isAdvanced ? '#E94560' : '#f4f3f4'}
                ios_backgroundColor="#D1D5DB"
                onValueChange={(value) => updateOrderForm({ isAdvanced: value })}
                value={orderForm.isAdvanced}
              />
            </View>
            
            {orderForm.isAdvanced && (
              <View style={styles.advancedOptions}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Validity</Text>
                  <TouchableOpacity style={styles.validitySelector}>
                    <Text style={styles.validitySelectorText}>Day</Text>
                    <ChevronDown size={16} color="#0F3460" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Disclosed Quantity</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              </View>
            )}
            
            <View style={styles.orderSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Market Price</Text>
                <Text style={styles.summaryValue}>NPR {orderForm.stock?.price.toFixed(2) || '0.00'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount</Text>
                <Text style={styles.summaryValue}>NPR {orderTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Brokerage</Text>
                <Text style={styles.summaryValue}>NPR {(orderTotal * 0.005).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Net Amount</Text>
                <Text style={styles.totalValue}>
                  NPR {(orderTotal * 1.005).toFixed(2)}
                </Text>
              </View>
              {validationErrors.length > 0 && (
                <View style={styles.errorSummary}>
                  <AlertTriangle size={16} color="#E74C3C" />
                  <Text style={styles.errorSummaryText}>
                    {validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={[
                styles.placeOrderButton, 
                { 
                  backgroundColor: orderForm.side === 'buy' ? '#10B981' : '#E94560',
                  opacity: isSubmitting || !orderForm.stock ? 0.6 : 1
                }
              ]}
              onPress={handlePlaceOrder}
              disabled={isSubmitting || !orderForm.stock}
            >
              {isSubmitting ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.placeOrderButtonText}>Processing...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  {validationErrors.length === 0 ? (
                    <CheckCircle size={16} color="white" />
                  ) : (
                    <AlertTriangle size={16} color="white" />
                  )}
                  <Text style={styles.placeOrderButtonText}>
                    {orderForm.side === 'buy' ? 'Buy' : 'Sell'} {orderForm.stock?.symbol || 'Stock'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.orderHistory}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order History</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowRight size={16} color="#0F3460" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <View>
                <Text style={styles.orderSymbol}>ADBL</Text>
                <Text style={styles.orderType}>Market Buy</Text>
              </View>
              <View style={styles.orderStatus}>
                <Clock size={12} color="#6B7280" />
                <Text style={styles.orderStatusText}>Pending</Text>
              </View>
            </View>
            <View style={styles.orderCardBody}>
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>Quantity</Text>
                <Text style={styles.orderDetailValue}>10</Text>
              </View>
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>Price</Text>
                <Text style={styles.orderDetailValue}>NPR 420.00</Text>
              </View>
              <View style={styles.orderDetail}>
                <Text style={styles.orderDetailLabel}>Total</Text>
                <Text style={styles.orderDetailValue}>NPR 4,200.00</Text>
              </View>
            </View>
            <View style={styles.orderCardFooter}>
              <Text style={styles.orderDate}>Today, 11:32 AM</Text>
              <TouchableOpacity style={styles.cancelOrderButton}>
                <Text style={styles.cancelOrderText}>Cancel</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  errorBorder: {
    borderColor: '#E74C3C',
    borderWidth: 1,
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  errorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#E74C3C',
  },
  errorSummaryText: {
    color: '#E74C3C',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  availableShares: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 16,
  },
  stockSelector: {
    marginBottom: 16,
    zIndex: 1000,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  stockPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  selectedStock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginRight: 8,
  },
  stockName: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  stockPickerContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
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
  stockList: {
    maxHeight: 200,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stockItemSymbol: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  stockItemName: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  stockItemPrice: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
  },
  actionTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  activeActionTab: {
    borderBottomColor: '#0F3460',
  },
  actionTabText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#6B7280',
  },
  activeActionTabText: {
    color: '#0F3460',
  },
  orderTypeTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  orderTypeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 6,
  },
  activeOrderTypeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  orderTypeTabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  activeOrderTypeTabText: {
    color: '#0F3460',
  },
  formContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F9FAFB',
  },
  advancedOptionsToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedOptions: {
    marginBottom: 16,
  },
  validitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  validitySelectorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#0F3460',
  },
  orderSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
  },
  summaryDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  totalValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  placeOrderButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  orderHistory: {
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
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderSymbol: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  orderType: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  orderStatusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  orderCardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDetail: {
    alignItems: 'center',
  },
  orderDetailLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  orderDetailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
  },
  orderCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  orderDate: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  cancelOrderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  cancelOrderText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#EF4444',
  },
});