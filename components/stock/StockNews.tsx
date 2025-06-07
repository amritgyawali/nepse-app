import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

import type { NewsArticle } from '@/types';

interface StockNewsProps {
  stockSymbol: string;
  news: NewsArticle[];
  expanded?: boolean;
}

export default function StockNews({ stockSymbol, news, expanded = false }: StockNewsProps) {
  const router = useRouter();
  
  const renderNewsItem = ({ item }: { item: NewsArticle }) => (
    <TouchableOpacity 
      style={styles.newsItem}
      onPress={() => router.push({
        pathname: '/news/[id]',
        params: { id: item.id }
      })}
    >
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <View style={styles.newsSource}>
          <Text style={styles.sourceText}>{item.source}</Text>
          <Text style={styles.sourceDot}>•</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.newsImage}
        />
      )}
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>News</Text>
        {!expanded && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => router.push(`/stock/${stockSymbol}?tab=news`)}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <ArrowRight size={16} color="#0F3460" />
          </TouchableOpacity>
        )}
      </View>
      
      {news.length > 0 ? (
        expanded ? (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.newsList}
          />
        ) : (
          <>
            {news.slice(0, 3).map((item) => renderNewsItem({ item }))}
          </>
        )
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news available for {stockSymbol}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
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
  newsList: {
    paddingBottom: 16,
  },
  newsItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsContent: {
    flex: 1,
    padding: 12,
  },
  newsTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 8,
  },
  newsSource: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
  sourceDot: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#9CA3AF',
  },
  newsImage: {
    width: 80,
    height: '100%',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#6B7280',
  },
});