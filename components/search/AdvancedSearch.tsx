import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Newspaper,
  BarChart3,
  Building2,
  DollarSign,
  Calendar,
  ArrowRight,
  X,
  History,
  Zap,
  Target,
  BookOpen,
  Bot,
  Eye,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { enhancedStockData, EnhancedMockData } from '@/assets/data/enhancedMockData';
import { useRouter } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface SearchResult {
  id: string;
  type: 'stock' | 'news' | 'analysis' | 'education' | 'calculator';
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ReactNode;
  data: any;
  relevanceScore: number;
  category?: string;
  tags?: string[];
}

interface SearchFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const searchFilters: SearchFilter[] = [
  {
    id: 'all',
    name: 'All',
    icon: <Search size={16} color="#FFFFFF" />,
    color: '#6366F1',
  },
  {
    id: 'stock',
    name: 'Stocks',
    icon: <TrendingUp size={16} color="#FFFFFF" />,
    color: '#10B981',
  },
  {
    id: 'news',
    name: 'News',
    icon: <Newspaper size={16} color="#FFFFFF" />,
    color: '#F59E0B',
  },
  {
    id: 'analysis',
    name: 'Analysis',
    icon: <BarChart3 size={16} color="#FFFFFF" />,
    color: '#8B5CF6',
  },
  {
    id: 'education',
    name: 'Education',
    icon: <BookOpen size={16} color="#FFFFFF" />,
    color: '#EF4444',
  },
  {
    id: 'calculator',
    name: 'Tools',
    icon: <Target size={16} color="#FFFFFF" />,
    color: '#06B6D4',
  },
];

const quickSearches = [
  'NABIL Bank',
  'NEPSE Index',
  'Banking Sector',
  'Market Analysis',
  'SIP Calculator',
  'Stock Basics',
  'Portfolio Tips',
  'Technical Analysis',
];

export default function AdvancedSearch() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Memoized search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();

    // Search stocks
    if (selectedFilter === 'all' || selectedFilter === 'stock') {
      (enhancedStockData as EnhancedMockData).stocks.forEach((stock: {
        [x: string]: any;
        sector: string; 
        symbol: string; 
        name: string; 
        price: number;
        change: number;
        changePercent: number;
        volume: number;
        marketCap: number;
        pe: number;
        eps: number;
      }) => {
        const relevance = calculateRelevance(query, [
          stock.symbol,
          stock.name,
          stock.sector,
          ...(stock.tags || [])
        ]);

        if (relevance > 0) {
          results.push({
            id: `stock-${stock.symbol}`,
            type: 'stock',
            title: `${stock.symbol} - ${stock.name}`,

            subtitle: `NPR ${stock.currentPrice.toLocaleString()} (${stock.change > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`,
            description: `${stock.sector} • Market Cap: NPR ${(stock.marketCap / 1000000).toFixed(0)}M`,
            icon: stock.change > 0 ? 
              <TrendingUp size={20} color="#10B981" /> : 
              <TrendingDown size={20} color="#EF4444" />,
            data: stock,
            relevanceScore: relevance,
            category: stock.sector,
            tags: stock.tags,
          });
        }
      });
    }

    // Search news
    if (selectedFilter === 'all' || selectedFilter === 'news') {
      (enhancedStockData as EnhancedMockData).news.forEach((news: { title: string; summary: string; category: string; source: string; tags: any; id: any; timestamp: string; }) => {
        const relevance = calculateRelevance(query, [
          news.title,
          news.summary,
          news.category,
          news.source,
          ...(news.tags || [])
        ]);
        
        if (relevance > 0) {
          results.push({
            id: `news-${news.id}`,
            type: 'news',
            title: news.title,
            subtitle: `${news.source} • ${formatTimeAgo(news.timestamp)}`,
            description: news.summary,
            icon: <Newspaper size={20} color="#F59E0B" />,
            data: news,
            relevanceScore: relevance,
            category: news.category,
            tags: news.tags,
          });
        }
      });
    }

    // Search AI analysis
    if (selectedFilter === 'all' || selectedFilter === 'analysis') {
      (enhancedStockData as EnhancedMockData).aiAnalysis.forEach((analysis: { stockSymbol: string; summary: string; recommendation: string; riskLevel: string; keyPoints: any; id: any; }) => {
        const relevance = calculateRelevance(query, [
          analysis.stockSymbol,
          analysis.summary,
          analysis.recommendation,
          analysis.riskLevel,
          ...analysis.keyPoints
        ]);
        
        if (relevance > 0) {
          results.push({
            id: `analysis-${analysis.id}`,
            type: 'analysis',
            title: `AI Analysis: ${analysis.stockSymbol}`,
            subtitle: `${analysis.recommendation} • ${analysis.riskLevel} Risk`,
            description: analysis.summary,
            icon: <Bot size={20} color="#8B5CF6" />,
            data: analysis,
            relevanceScore: relevance,
            category: 'AI Analysis',
          });
        }
      });
    }

    // Search education content
    if (selectedFilter === 'all' || selectedFilter === 'education') {
      (enhancedStockData as EnhancedMockData).educationContent.forEach((content: { title: string; description: string; category: string; level: string; tags: any; id: any; }) => {
        const relevance = calculateRelevance(query, [
          content.title,
          content.description,
          content.category,
          content.level,
          ...content.tags
        ]);
        
        if (relevance > 0) {
          results.push({
            id: `education-${content.id}`,
            type: 'education',
            title: content.title,
            subtitle: `${content.category} • ${content.level} Level`,
            description: content.description,
            icon: <BookOpen size={20} color="#EF4444" />,
            data: content,
            relevanceScore: relevance,
            category: content.category,
            tags: content.tags,
          });
        }
      });
    }

    // Search calculators
    if (selectedFilter === 'all' || selectedFilter === 'calculator') {
      const calculators = [
        { id: 'sip', title: 'SIP Calculator', description: 'Calculate returns from Systematic Investment Plan' },
        { id: 'roi', title: 'ROI Calculator', description: 'Calculate Return on Investment' },
        { id: 'pe', title: 'P/E Ratio Calculator', description: 'Calculate Price-to-Earnings ratio' },
        { id: 'dividend', title: 'Dividend Yield Calculator', description: 'Calculate dividend yield and income' },
        { id: 'goal', title: 'Investment Goal Planner', description: 'Plan your investment to reach financial goals' },
      ];
      
      calculators.forEach(calc => {
        const relevance = calculateRelevance(query, [calc.title, calc.description]);
        
        if (relevance > 0) {
          results.push({
            id: `calculator-${calc.id}`,
            type: 'calculator',
            title: calc.title,
            subtitle: 'Financial Tool',
            description: calc.description,
            icon: <Target size={20} color="#06B6D4" />,
            data: calc,
            relevanceScore: relevance,
            category: 'Tools',
          });
        }
      });
    }

    // Sort by relevance score
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [searchQuery, selectedFilter]);

  const calculateRelevance = (query: string, searchFields: string[]): number => {
    let score = 0;
    const queryWords = query.split(' ').filter(word => word.length > 0);
    
    searchFields.forEach(field => {
      if (!field) return;
      const fieldLower = field.toLowerCase();
      
      queryWords.forEach(word => {
        if (fieldLower.includes(word)) {
          // Exact match gets higher score
          if (fieldLower === query) score += 10;
          // Start of field gets high score
          else if (fieldLower.startsWith(word)) score += 5;
          // Contains word gets medium score
          else score += 2;
        }
      });
    });
    
    return score;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]);
    }
  };

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'stock':
        router.push(`/stock/${result.data.symbol}`);
        break;
      case 'news':
        // Navigate to news detail
        break;
      case 'analysis':
        // Navigate to analysis detail
        break;
      case 'education':
        // Navigate to education content
        break;
      case 'calculator':
        // Navigate to calculator
        break;
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultIcon}>
        {item.icon}
      </View>
      
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultTitle, { color: theme.colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.typeChip, { backgroundColor: searchFilters.find(f => f.id === item.type)?.color }]}>
            <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        
        <Text style={[styles.resultSubtitle, { color: theme.colors.secondary }]} numberOfLines={1}>
          {item.subtitle}
        </Text>
        
        {item.description && (
          <Text style={[styles.resultDescription, { color: theme.colors.secondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.resultTags}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <ArrowRight size={16} color={theme.colors.secondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.background }]}>
            <Search size={20} color={theme.colors.secondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Search stocks, news, analysis..."
              placeholderTextColor={theme.colors.secondary}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {searchFilters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  selectedFilter === filter.id && { backgroundColor: filter.color },
                  selectedFilter !== filter.id && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                {filter.icon}
                <Text style={[
                  styles.filterText,
                  { color: selectedFilter === filter.id ? '#FFFFFF' : theme.colors.text },
                ]}>
                  {filter.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {searchQuery.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Search Results ({searchResults.length})
              </Text>
            </View>
            
            {searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Search size={48} color={theme.colors.secondary} />
                <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No results found</Text>
                <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>Try different keywords or filters</Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Searches */}
        {!searchQuery.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 8 }]}>Quick Searches</Text>
            </View>
            
            <View style={styles.quickSearches}>
              {quickSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickSearchChip, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleSearch(search)}
                >
                  <Text style={[styles.quickSearchText, { color: theme.colors.text }]}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search History */}
        {!searchQuery.trim() && searchHistory.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <History size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 8 }]}>Recent Searches</Text>
              <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
                <Text style={[styles.clearText, { color: theme.colors.primary }]}>Clear</Text>
              </TouchableOpacity>
            </View>
            
            {searchHistory.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}
                onPress={() => handleSearch(search)}
              >
                <Clock size={16} color={theme.colors.secondary} />
                <Text style={[styles.historyText, { color: theme.colors.text }]}>{search}</Text>
                <ArrowRight size={16} color={theme.colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Popular Categories */}
        {!searchQuery.trim() && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Star size={20} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 8 }]}>Popular Categories</Text>
            </View>
            
            <View style={styles.categoriesGrid}>
              {[
                { name: 'Banking Stocks', icon: <Building2 size={24} color="#10B981" />, color: '#10B981' },
                { name: 'Market News', icon: <Newspaper size={24} color="#F59E0B" />, color: '#F59E0B' },
                { name: 'Technical Analysis', icon: <BarChart3 size={24} color="#8B5CF6" />, color: '#8B5CF6' },
                { name: 'Investment Tools', icon: <Target size={24} color="#06B6D4" />, color: '#06B6D4' },
              ].map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => handleSearch(category.name)}
                >
                  <LinearGradient
                    colors={[category.color, `${category.color}80`]}
                    style={styles.categoryIcon}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {category.icon}
                  </LinearGradient>
                  <Text style={[styles.categoryName, { color: theme.colors.text }]}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultIcon: {
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  typeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  resultSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  resultTags: {
    flexDirection: 'row',
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  quickSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickSearchChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickSearchText: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  historyText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (screenWidth - 48) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
});