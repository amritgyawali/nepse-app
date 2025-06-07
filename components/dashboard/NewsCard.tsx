import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { RefreshCw } from 'lucide-react-native';

type NewsCardProps = {
  news: {
    id: string;
    title: string;
    source: string;
    date: string;
    imageUrl: string;
    relatedSymbols: string[];
  };
  onPress: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
};

export default function NewsCard({ news, onPress, isLoading = false, error = null, onRefresh }: NewsCardProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0F3460" />
        <Text style={styles.loadingText}>Loading news...</Text>
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
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{news.title}</Text>
        <View style={styles.sourceContainer}>
          <Text style={styles.source}>{news.source}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.date}>{news.date}</Text>
        </View>
        {news.relatedSymbols.length > 0 && (
          <View style={styles.tagsContainer}>
            {news.relatedSymbols.slice(0, 3).map((symbol) => (
              <View key={symbol} style={styles.tag}>
                <Text style={styles.tagText}>{symbol}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {news.imageUrl && (
        <Image source={{ uri: news.imageUrl }} style={styles.image} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 100,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 8,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  separator: {
    fontSize: 12,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  date: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
  },
  image: {
    width: 100,
    height: '100%',
  },
  loadingContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
  },
  refreshText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    marginLeft: 4,
  },
});