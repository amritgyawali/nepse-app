import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart as Chart, VictoryCandlestick, VictoryLine, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/hooks/useTheme';

interface CandleData {
  x: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandleChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  showMA?: boolean;
  ma20Period?: number;
  ma50Period?: number;
}

export default function CandleChart({
  data,
  width = Dimensions.get('window').width - 32,
  height = 300,
  showMA = true,
  ma20Period = 20,
  ma50Period = 50,
}: CandleChartProps) {
  const { theme } = useTheme();

  // Calculate moving averages
  const calculateMA = (data: CandleData[], period: number) => {
    const maData = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      const average = sum / period;
      
      maData.push({
        x: data[i].x,
        y: average,
      });
    }
    
    return maData;
  };

  const ma20Data = showMA ? calculateMA(data, ma20Period) : [];
  const ma50Data = showMA ? calculateMA(data, ma50Period) : [];

  // Format data for Victory components
  const candleData = data.map(item => ({
    x: item.x,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
  }));

  // Custom theme for dark mode - create our own theme instead of using VictoryTheme.material
  const chartTheme = {
    axis: {
      style: {
        axis: { stroke: theme.colors.border },
        axisLabel: { 
          fontSize: 12, 
          padding: 35,
          fill: theme.colors.secondary,
        },
        grid: { 
          stroke: theme.colors.border, 
          strokeWidth: 0.5,
          strokeOpacity: 0.3,
        },
        ticks: { stroke: theme.colors.border, size: 5 },
        tickLabels: { 
          fontSize: 10, 
          padding: 5,
          fill: theme.colors.secondary,
        },
      },
    },
    candlestick: {
      style: {
        data: {
          stroke: (d) => d.close > d.open ? '#10B981' : '#EF4444',
          fill: (d) => d.close > d.open ? '#10B981' : '#EF4444',
          strokeWidth: 1,
          fillOpacity: 0.8
        }
      }
    },
    line: {
      style: {
        data: {
          stroke: '#4ECDC4',
          strokeWidth: 2,
        }
      }
    }
  };

  // Format tick values
  const formatPrice = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // Get min and max values for proper scaling
  const allValues = data.flatMap(d => [d.high, d.low]);
  const minValue = Math.min(...allValues) * 0.98;
  const maxValue = Math.max(...allValues) * 1.02;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <VictoryChart
        theme={chartTheme}
        width={width}
        height={height}
        padding={{ left: 60, top: 20, right: 20, bottom: 40 }}
        domain={{ y: [minValue, maxValue] }}
        scale={{ x: 'time' }}
      >
        {/* Y-axis for price */}
        <VictoryAxis
          dependentAxis
          tickFormat={formatPrice}
          style={{
            axis: { stroke: theme.colors.border },
            tickLabels: { fill: theme.colors.secondary, fontSize: 10 },
            grid: { stroke: theme.colors.border, strokeWidth: 0.5, strokeOpacity: 0.3 },
          }}
        />
        
        {/* X-axis for dates */}
        <VictoryAxis
          tickFormat={(date: string | number | Date) => formatDate(new Date(date))}
          tickCount={6}
          style={{
            axis: { stroke: theme.colors.border },
            tickLabels: { fill: theme.colors.secondary, fontSize: 10, angle: -45 },
            grid: { stroke: theme.colors.border, strokeWidth: 0.5, strokeOpacity: 0.3 },
          }}
        />
        
        {/* Moving Average Lines */}
        {showMA && ma50Data.length > 0 && (
          <VictoryLine
            data={ma50Data}
            style={{
              data: { 
                stroke: '#FF6B6B', 
                strokeWidth: 2,
                strokeOpacity: 0.8,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        )}
        
        {showMA && ma20Data.length > 0 && (
          <VictoryLine
            data={ma20Data}
            style={{
              data: { 
                stroke: '#4ECDC4', 
                strokeWidth: 2,
                strokeOpacity: 0.8,
              },
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 },
            }}
          />
        )}
        
        {/* Candlestick Chart */}
        <VictoryCandlestick
          data={candleData}
          candleColors={{ positive: '#10B981', negative: '#EF4444' }}
          style={{
            data: {
              strokeWidth: 1,
              stroke: (datum: any) => datum.close > datum.open ? '#10B981' : '#EF4444',
              fill: (datum: any) => datum.close > datum.open ? '#10B981' : '#EF4444',
              fillOpacity: 0.8,
            },
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 },
          }}
        />
      </VictoryChart>
      
      {/* Legend */}
      {showMA && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4ECDC4' }]} />
            <Text style={[styles.legendText, { color: theme.colors.secondary }]}>MA20</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
            <Text style={[styles.legendText, { color: theme.colors.secondary }]}>MA50</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.colors.secondary }]}>Bullish</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.colors.secondary }]}>Bearish</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});