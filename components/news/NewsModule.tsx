import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Share,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Newspaper,
  Bot,
  Star,
  Calendar,
  Tag,
  ExternalLink,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { enhancedStockData } from '@/assets/data/enhancedMockData';

const { width: screenWidth } = Dimensions.get('window');

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  timestamp: string;
  imageUrl?: string;
  source: string;
  readTime: number;
  views: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  aiSummary: string;
  relatedStocks: string[];
  isBookmarked?: boolean;
  priority: 'high' | 'medium' | 'low';
}

const categories = [
  { id: 'all', name: 'All', icon: <Newspaper size={16} color="#FFFFFF" /> },
  { id: 'market', name: 'Market', icon: <TrendingUp size={16} color="#FFFFFF" /> },
  { id: 'banking', name: 'Banking', icon: <Tag size={16} color="#FFFFFF" /> },
  { id: 'corporate', name: 'Corporate', icon: <Star size={16} color="#FFFFFF" /> },
  { id: 'economy', name: 'Economy', icon: <Calendar size={16} color="#FFFFFF" /> },
  { id: 'policy', name: 'Policy', icon: <Filter size={16} color="#FFFFFF" /> },
];

const sortOptions = [
  { id: 'latest', name: 'Latest' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'trending', name: 'Trending' },
  { id: 'bookmarked', name: 'Bookmarked' },
];

export default function NewsModule() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedNews, setBookmarkedNews] = useState<Set<string>>(new Set());
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);

  useEffect(() => {
    // Transform enhanced mock data to news format
    const transformedNews: NewsItem[] = (enhancedStockData as any[]).map((item: {
      id: any;
      title: any;
      summary: any;
      content: any;
      category: any;
      timestamp: any;
      imageUrl: any;
      source: any;
      sentiment: "positive" | "negative" | "neutral";
      tags: never[];
      aiInsight: string;
      relatedStocks: never[]; news: { id: any; title: any; summary: any; content: any; category: any; timestamp: any; imageUrl: any; source: any; sentiment: string; tags: any; aiInsight: any; relatedStocks: any; }[] 
}, index: number) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      content: item.content || item.summary,
      category: item.category,
      timestamp: item.timestamp,
      imageUrl: item.imageUrl,
      source: item.source,
      readTime: Math.floor(Math.random() * 5) + 2,
      views: Math.floor(Math.random() * 10000) + 100,
      sentiment: item.sentiment as 'positive' | 'negative' | 'neutral',
      tags: item.tags || [],
      aiSummary: item.aiInsight || 'AI analysis not available',
      relatedStocks: item.relatedStocks || [],
      isBookmarked: false,
      priority: index < 3 ? 'high' : index < 8 ? 'medium' : 'low',
    }));
    setNewsData(transformedNews);
  }, []);

  const filteredNews = newsData.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBookmark = selectedSort !== 'bookmarked' || bookmarkedNews.has(item.id);
    
    return matchesCategory && matchesSearch && matchesBookmark;
  }).sort((a, b) => {
    switch (selectedSort) {
      case 'popular':
        return b.views - a.views;
      case 'trending':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'latest':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleBookmark = (newsId: string) => {
    setBookmarkedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
      } else {
        newSet.add(newsId);
      }
      return newSet;
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp size={14} color="#10B981" />;
      case 'negative': return <TrendingDown size={14} color="#EF4444" />;
      default: return <Eye size={14} color="#6B7280" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={[styles.newsCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => setSelectedNews(item)}
    >
      {item.priority === 'high' && (
        <LinearGradient
          colors={['#EF4444', '#F59E0B']}
          style={styles.priorityBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.priorityText}>Breaking</Text>
        </LinearGradient>
      )}
      
      <View style={styles.newsHeader}>
        <View style={styles.newsMetadata}>
          <Text style={[styles.newsSource, { color: theme.colors.primary }]}>{item.source}</Text>
          <View style={styles.metadataDivider} />
          <Clock size={12} color={theme.colors.secondary} />
          <Text style={[styles.newsTime, { color: theme.colors.secondary }]}>
            {formatTimeAgo(item.timestamp)}
          </Text>
          <View style={styles.metadataDivider} />
          {getSentimentIcon(item.sentiment)}
        </View>
        
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          {bookmarkedNews.has(item.id) ? (
            <BookmarkCheck size={20} color={theme.colors.primary} />
          ) : (
            <Bookmark size={20} color={theme.colors.secondary} />
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.newsTitle, { color: theme.colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={[styles.newsSummary, { color: theme.colors.secondary }]} numberOfLines={3}>
        {item.summary}
      </Text>

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      )}

      <View style={styles.newsFooter}>
        <View style={styles.newsTags}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.newsStats}>
          <Eye size={14} color={theme.colors.secondary} />
          <Text style={[styles.statsText, { color: theme.colors.secondary }]}>
            {item.views.toLocaleString()}
          </Text>
          <Text style={[styles.readTime, { color: theme.colors.secondary }]}>
            {item.readTime} min read
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNewsDetail = () => {
    if (!selectedNews) return null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.detailHeader, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedNews(null)}>
            <ChevronRight size={24} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.detailHeaderTitle, { color: theme.colors.text }]}>News Detail</Text>
          <View style={styles.detailActions}>
            <TouchableOpacity onPress={() => toggleBookmark(selectedNews.id)}>
              {bookmarkedNews.has(selectedNews.id) ? (
                <BookmarkCheck size={24} color={theme.colors.primary} />
              ) : (
                <Bookmark size={24} color={theme.colors.secondary} />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 16 }}>
              <Share size={24} color={theme.colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
          {selectedNews.imageUrl && (
            <Image source={{ uri: selectedNews.imageUrl }} style={styles.detailImage} />
          )}
          
          <View style={styles.detailBody}>
            <View style={styles.detailMetadata}>
              <Text style={[styles.detailSource, { color: theme.colors.primary }]}>{selectedNews.source}</Text>
              <View style={styles.metadataDivider} />
              <Text style={[styles.detailTime, { color: theme.colors.secondary }]}>
                {formatTimeAgo(selectedNews.timestamp)}
              </Text>
              <View style={styles.metadataDivider} />
              {getSentimentIcon(selectedNews.sentiment)}
            </View>
            
            <Text style={[styles.detailTitle, { color: theme.colors.text }]}>
              {selectedNews.title}
            </Text>
            
            <Text style={[styles.detailSummary, { color: theme.colors.secondary }]}>
              {selectedNews.summary}
            </Text>
            
            <Text style={[styles.detailContent, { color: theme.colors.text }]}>
              {selectedNews.content}
            </Text>

            {/* AI Summary Section */}
            <View style={[styles.aiSection, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.aiHeader}>
                <Bot size={20} color={theme.colors.primary} />
                <Text style={[styles.aiTitle, { color: theme.colors.text }]}>AI Summary</Text>
              </View>
              <Text style={[styles.aiSummary, { color: theme.colors.secondary }]}>
                {selectedNews.aiSummary}
              </Text>
            </View>

            {/* Related Stocks */}
            {selectedNews.relatedStocks.length > 0 && (
              <View style={[styles.relatedSection, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Related Stocks</Text>
                <View style={styles.relatedStocks}>
                  {selectedNews.relatedStocks.map((stock, index) => (
                    <TouchableOpacity key={index} style={[styles.stockChip, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.stockChipText, { color: theme.colors.primary }]}>{stock}</Text>
                      <ExternalLink size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            <View style={styles.tagsSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {selectedNews.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  if (selectedNews) {
    return renderNewsDetail();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Newspaper size={28} color={theme.colors.primary} />
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Market News</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.secondary }]}>Stay updated</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
          <Search size={20} color={theme.colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search news, stocks, or topics..."
            placeholderTextColor={theme.colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && { backgroundColor: theme.colors.primary },
                  selectedCategory !== category.id && { backgroundColor: theme.colors.background },
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                {category.icon}
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category.id ? '#FFFFFF' : theme.colors.text },
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Sort Options */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortChip,
                  selectedSort === option.id && { backgroundColor: theme.colors.primary },
                  selectedSort !== option.id && { borderColor: theme.colors.border, borderWidth: 1 },
                ]}
                onPress={() => setSelectedSort(option.id)}
              >
                <Text style={[
                  styles.sortText,
                  { color: selectedSort === option.id ? '#FFFFFF' : theme.colors.text },
                ]}>
                  {option.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* News List */}
      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        style={styles.newsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Newspaper size={48} color={theme.colors.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No news found</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>Try adjusting your filters</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filtersContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  sortScroll: {
    paddingHorizontal: 16,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  newsCard: {
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  priorityBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  metadataDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 6,
  },
  newsTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  newsImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTags: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  newsStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    marginLeft: 4,
    marginRight: 8,
  },
  readTime: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  // Detail View Styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  detailActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailImage: {
    width: '100%',
    height: 200,
  },
  detailBody: {
    padding: 16,
  },
  detailMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailSource: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailTime: {
    fontSize: 14,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    lineHeight: 28,
    marginBottom: 12,
  },
  detailSummary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  detailContentContainer: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  aiSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  aiSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  relatedSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  relatedStocks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  stockChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  stockChipText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});