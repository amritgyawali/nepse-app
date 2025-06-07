import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/hooks/useTheme';

import type { NEPSEStock, PriceHistory, ChartData } from '@/types';

interface StockChartProps {
  stock: NEPSEStock & { priceHistory?: PriceHistory[] };
  timeframe: string;
  expanded?: boolean;
}

export default function StockChart({ stock, timeframe, expanded = false }: StockChartProps) {
  const { theme } = useTheme();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const screenWidth = Dimensions.get('window').width - (expanded ? 40 : 60);
  
  useEffect(() => {
    if (stock && stock.priceHistory) {
      // Filter data based on timeframe
      let filteredData = stock.priceHistory;
      
      if (timeframe === '1D') {
        // For 1 day, use the most recent data points
        filteredData = stock.priceHistory.slice(-24); // Assuming hourly data points
      } else if (timeframe === '1W') {
        filteredData = stock.priceHistory.slice(-7); // Last 7 days
      } else if (timeframe === '1M') {
        filteredData = stock.priceHistory.slice(-30); // Last 30 days
      } else if (timeframe === '3M') {
        filteredData = stock.priceHistory.slice(-90); // Last 90 days
      } else if (timeframe === '1Y') {
        filteredData = stock.priceHistory; // All available data
      }
      
      // Format data for the chart
      const labels = filteredData.map((item: PriceHistory) => {
        const date = new Date(item.date);
        if (timeframe === '1D') {
          return `${date.getHours()}:00`;
        } else {
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }
      });
      
      // Only show a subset of labels to avoid overcrowding
      const visibleLabels = labels.filter((_, i: number) => i % Math.ceil(labels.length / 6) === 0);
      
      // Fill in empty labels for the ones we're skipping
      const displayLabels = labels.map((label: string, i: number) => {
        if (visibleLabels.includes(label) && i % Math.ceil(labels.length / 6) === 0) {
          return label;
        }
        return '';
      });
      
      setChartData({
        labels: displayLabels,
        datasets: [
          {
            data: filteredData.map((item: PriceHistory) => item.price),
            color: () => stock.change >= 0 ? theme.colors.success : theme.colors.error,
            strokeWidth: 2
          }
        ]
      });
    }
  }, [stock, timeframe, theme]);
  
  if (!chartData) {
    return (
      <View style={[styles.container, expanded && styles.expandedContainer]}>
        <Text style={{ color: theme.colors.text }}>Loading chart data...</Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, expanded && styles.expandedContainer]}>
      <LineChart
        data={chartData}
        width={screenWidth}
        height={expanded ? 250 : 180}
        chartConfig={{
          backgroundColor: theme.colors.card,
          backgroundGradientFrom: theme.colors.card,
          backgroundGradientTo: theme.colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => stock.change >= 0 
            ? `rgba(16, 185, 129, ${opacity})` 
            : `rgba(239, 68, 68, ${opacity})`,
          labelColor: () => theme.colors.text,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: '2',
            strokeWidth: '1',
            stroke: stock.change >= 0 ? theme.colors.success : theme.colors.error
          },
          propsForBackgroundLines: {
            strokeDasharray: '', // solid background lines
            stroke: theme.colors.border,
            strokeWidth: 1
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
        withDots={false}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={false}
        yAxisLabel=""
        yAxisSuffix=""
      />
      
      {/* Volume indicator */}
      {expanded && (
        <View style={styles.volumeContainer}>
          <Text style={[styles.volumeLabel, { color: theme.colors.text }]}>Volume</Text>
          <View style={styles.volumeBarContainer}>
            {chartData.datasets[0].data.map((_, index: number) => {
              const volume = stock.priceHistory[index]?.volume || 0;
              const maxVolume = Math.max(...(stock.priceHistory || []).map((item: PriceHistory) => item.volume));
              const volumeHeight = (volume / maxVolume) * 50; // Max height of 50
              
              return (
                <View 
                  key={`volume-${index}`} 
                  style={[
                    styles.volumeBar,
                    { 
                      height: volumeHeight,
                      backgroundColor: stock.change >= 0 ? theme.colors.success : theme.colors.error,
                      opacity: 0.5
                    }
                  ]}
                />
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 16,
    marginVertical: 10,
  },
  expandedContainer: {
    padding: 15,
  },
  chartLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartLine: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  chartData: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 150,
    paddingVertical: 10,
  },
  dataPoint: {
    width: 8,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  chartOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  volumeContainer: {
    marginTop: 20,
    height: 70,
  },
  volumeLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  volumeBarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
    justifyContent: 'space-between',
  },
  volumeBar: {
    width: 3,
    marginHorizontal: 1,
    borderRadius: 1,
  },
});