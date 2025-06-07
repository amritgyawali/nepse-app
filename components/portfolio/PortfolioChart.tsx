import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type PortfolioChartProps = {
  timeframe: string;
};

export default function PortfolioChart({ timeframe }: PortfolioChartProps) {
  // In a real app, this would be a chart component using a library like Victory or react-native-chart-kit
  // For now, we'll create a simple placeholder
  
  return (
    <View style={styles.container}>
      <View style={styles.chartLines}>
        <View style={styles.chartLine} />
        <View style={styles.chartLine} />
        <View style={styles.chartLine} />
        <View style={styles.chartLine} />
      </View>
      
      <View style={styles.chartData}>
        <View style={[styles.dataPoint, { height: '40%' }]} />
        <View style={[styles.dataPoint, { height: '60%' }]} />
        <View style={[styles.dataPoint, { height: '50%' }]} />
        <View style={[styles.dataPoint, { height: '70%' }]} />
        <View style={[styles.dataPoint, { height: '65%' }]} />
        <View style={[styles.dataPoint, { height: '80%' }]} />
        <View style={[styles.dataPoint, { height: '85%' }]} />
      </View>
      
      <View style={styles.chartOverlay}>
        <View style={styles.chartLine} />
      </View>
      
      <View style={styles.chartLabels}>
        <Text style={styles.chartLabel}>Mon</Text>
        <Text style={styles.chartLabel}>Tue</Text>
        <Text style={styles.chartLabel}>Wed</Text>
        <Text style={styles.chartLabel}>Thu</Text>
        <Text style={styles.chartLabel}>Fri</Text>
        <Text style={styles.chartLabel}>Sat</Text>
        <Text style={styles.chartLabel}>Sun</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartLines: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 20,
    justifyContent: 'space-between',
  },
  chartLine: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  chartData: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 20,
  },
  dataPoint: {
    width: 30,
    backgroundColor: '#0F3460',
    opacity: 0.8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 60,
    zIndex: 10,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  chartLabel: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
});