import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BookOpen,
  GraduationCap,
  Play,
  Clock,
  Star,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Users,
  Calendar,
  Download,
  Share,
  Eye,
  ThumbsUp,
  MessageCircle,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { enhancedStockData } from '@/assets/data/enhancedMockData';

const { width: screenWidth } = Dimensions.get('window');

interface EducationContent {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; // in minutes
  type: 'article' | 'video' | 'quiz' | 'tutorial';
  tags: string[];
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  rating: number;
  views: number;
  likes: number;
  isBookmarked?: boolean;
  progress?: number; // 0-100
  author: string;
  publishedDate: string;
  difficulty: number; // 1-5
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  count: number;
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'All',
    icon: <BookOpen size={20} color="#FFFFFF" />,
    color: '#6366F1',
    count: 0,
  },
  {
    id: 'basics',
    name: 'Stock Basics',
    icon: <GraduationCap size={20} color="#FFFFFF" />,
    color: '#10B981',
    count: 8,
  },
  {
    id: 'analysis',
    name: 'Technical Analysis',
    icon: <BarChart3 size={20} color="#FFFFFF" />,
    color: '#8B5CF6',
    count: 6,
  },
  {
    id: 'portfolio',
    name: 'Portfolio Management',
    icon: <PieChart size={20} color="#FFFFFF" />,
    color: '#F59E0B',
    count: 5,
  },
  {
    id: 'trading',
    name: 'Trading Strategies',
    icon: <TrendingUp size={20} color="#FFFFFF" />,
    color: '#EF4444',
    count: 7,
  },
  {
    id: 'investment',
    name: 'Investment Tips',
    icon: <Target size={20} color="#FFFFFF" />,
    color: '#06B6D4',
    count: 4,
  },
];

const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const contentTypes = ['All', 'Article', 'Video', 'Quiz', 'Tutorial'];

export default function EducationModule() {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [bookmarkedContent, setBookmarkedContent] = useState<Set<string>>(new Set());
  const [selectedContent, setSelectedContent] = useState<EducationContent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Transform enhanced mock data to education content
  const educationContent: EducationContent[] = (enhancedStockData as any[]).map((item, index) => ({
    ...item,
    duration: Math.floor(Math.random() * 15) + 5,
    type: ['article', 'video', 'quiz', 'tutorial'][Math.floor(Math.random() * 4)] as any,
    rating: 4 + Math.random(),
    views: Math.floor(Math.random() * 5000) + 100,
    likes: Math.floor(Math.random() * 500) + 10,
    isBookmarked: false,
    progress: Math.floor(Math.random() * 100),
    author: ['Dr. Sarah Johnson', 'Michael Chen', 'Priya Sharma', 'David Wilson'][Math.floor(Math.random() * 4)],
    publishedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: Math.floor(Math.random() * 5) + 1,
    content: `This is a comprehensive guide about ${item.title.toLowerCase()}. ${item.description} 

In this ${item.type || 'article'}, you'll learn:
• Key concepts and fundamentals
• Practical applications
• Real-world examples
• Best practices and tips

Whether you're a beginner or looking to advance your knowledge, this content will provide valuable insights into ${item.category.toLowerCase()}.`,
  }));

  const filteredContent = educationContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category.toLowerCase().includes(selectedCategory);
    const matchesLevel = selectedLevel === 'All' || item.level === selectedLevel;
    const matchesType = selectedType === 'All' || item.type === selectedType.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesLevel && matchesType && matchesSearch;
  });

  const toggleBookmark = (contentId: string) => {
    setBookmarkedContent(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play size={16} color="#FFFFFF" />;
      case 'quiz': return <CheckCircle size={16} color="#FFFFFF" />;
      case 'tutorial': return <Lightbulb size={16} color="#FFFFFF" />;
      default: return <BookOpen size={16} color="#FFFFFF" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#EF4444';
      case 'quiz': return '#8B5CF6';
      case 'tutorial': return '#F59E0B';
      default: return '#6366F1';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const renderContentItem = ({ item }: { item: EducationContent }) => (
    <TouchableOpacity
      style={[styles.contentCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => setSelectedContent(item)}
    >
      {/* Content Header */}
      <View style={styles.contentHeader}>
        <View style={[styles.typeChip, { backgroundColor: getTypeColor(item.type) }]}>
          {getTypeIcon(item.type)}
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
        
        <TouchableOpacity onPress={() => toggleBookmark(item.id)}>
          {bookmarkedContent.has(item.id) ? (
            <BookmarkCheck size={20} color={theme.colors.primary} />
          ) : (
            <Bookmark size={20} color={theme.colors.secondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content Image */}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.contentImage} />
      )}

      {/* Content Info */}
      <View style={styles.contentInfo}>
        <Text style={[styles.contentTitle, { color: theme.colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={[styles.contentDescription, { color: theme.colors.secondary }]} numberOfLines={3}>
          {item.description}
        </Text>

        {/* Metadata */}
        <View style={styles.contentMetadata}>
          <View style={styles.metadataRow}>
            <View style={[styles.levelChip, { backgroundColor: getLevelColor(item.level) }]}>
              <Text style={styles.levelText}>{item.level}</Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Clock size={14} color={theme.colors.secondary} />
              <Text style={[styles.metadataText, { color: theme.colors.secondary }]}>
                {formatDuration(item.duration)}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Star size={14} color="#F59E0B" />
              <Text style={[styles.metadataText, { color: theme.colors.secondary }]}>
                {item.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Eye size={14} color={theme.colors.secondary} />
              <Text style={[styles.metadataText, { color: theme.colors.secondary }]}>
                {item.views.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <ThumbsUp size={14} color={theme.colors.secondary} />
              <Text style={[styles.metadataText, { color: theme.colors.secondary }]}>
                {item.likes}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Bar */}
        {item.progress && item.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View 
                style={[styles.progressFill, { 
                  backgroundColor: theme.colors.primary,
                  width: `${item.progress}%`
                }]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.secondary }]}>
              {item.progress}% complete
            </Text>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContentDetail = () => {
    if (!selectedContent) return null;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.detailHeader, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={() => setSelectedContent(null)}>
            <ArrowRight size={24} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={[styles.detailHeaderTitle, { color: theme.colors.text }]}>Learning Content</Text>
          <View style={styles.detailActions}>
            <TouchableOpacity onPress={() => toggleBookmark(selectedContent.id)}>
              {bookmarkedContent.has(selectedContent.id) ? (
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
          {/* Content Header */}
          <LinearGradient
            colors={[getTypeColor(selectedContent.type), `${getTypeColor(selectedContent.type)}80`]}
            style={styles.detailBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIcon}>
                {getTypeIcon(selectedContent.type)}
              </View>
              <View style={styles.bannerText}>
                <Text style={styles.bannerType}>{selectedContent.type.toUpperCase()}</Text>
                <Text style={styles.bannerTitle}>{selectedContent.title}</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.detailBody}>
            {/* Metadata */}
            <View style={styles.detailMetadata}>
              <View style={styles.authorInfo}>
                <Users size={16} color={theme.colors.primary} />
                <Text style={[styles.authorName, { color: theme.colors.text }]}>{selectedContent.author}</Text>
              </View>
              
              <View style={styles.publishInfo}>
                <Calendar size={16} color={theme.colors.secondary} />
                <Text style={[styles.publishDate, { color: theme.colors.secondary }]}>
                  {formatTimeAgo(selectedContent.publishedDate)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Clock size={16} color={theme.colors.primary} />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {formatDuration(selectedContent.duration)}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Star size={16} color="#F59E0B" />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {selectedContent.rating.toFixed(1)} Rating
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Eye size={16} color={theme.colors.secondary} />
                <Text style={[styles.statText, { color: theme.colors.text }]}>
                  {selectedContent.views.toLocaleString()} Views
                </Text>
              </View>
            </View>

            {/* Level and Difficulty */}
            <View style={styles.levelContainer}>
              <View style={[styles.levelChip, { backgroundColor: getLevelColor(selectedContent.level) }]}>
                <Text style={styles.levelText}>{selectedContent.level}</Text>
              </View>
              
              <View style={styles.difficultyContainer}>
                <Text style={[styles.difficultyLabel, { color: theme.colors.secondary }]}>Difficulty:</Text>
                <View style={styles.difficultyStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      color={star <= selectedContent.difficulty ? '#F59E0B' : theme.colors.border}
                      fill={star <= selectedContent.difficulty ? '#F59E0B' : 'none'}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.detailDescription, { color: theme.colors.secondary }]}>
              {selectedContent.description}
            </Text>

            {/* Content */}
            <View style={[styles.contentSection, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.contentSectionTitle, { color: theme.colors.text }]}>Content</Text>
              <Text style={[styles.contentText, { color: theme.colors.text }]}>
                {selectedContent.content}
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsSection}>
              <Text style={[styles.tagsSectionTitle, { color: theme.colors.text }]}>Tags</Text>
              <View style={styles.tagsGrid}>
                {selectedContent.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, { backgroundColor: theme.colors.background }]}>
                    <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}>
                <Play size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Start Learning</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.colors.border }]}>
                <Download size={20} color={theme.colors.text} />
                <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };

  if (selectedContent) {
    return renderContentDetail();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, `${theme.colors.primary}CC`]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <GraduationCap size={28} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Learn & Grow</Text>
            <Text style={styles.headerSubtitle}>Master the stock market</Text>
          </View>
          
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Filter size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={[styles.categoriesContainer, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { backgroundColor: category.color },
                selectedCategory !== category.id && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
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
              {category.count > 0 && (
                <View style={[styles.countBadge, { backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.3)' : theme.colors.primary }]}>
                  <Text style={[styles.countText, { color: selectedCategory === category.id ? '#FFFFFF' : '#FFFFFF' }]}>
                    {category.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={[styles.filtersContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Level:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterChip,
                    selectedLevel === level && { backgroundColor: theme.colors.primary },
                    selectedLevel !== level && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setSelectedLevel(level)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: selectedLevel === level ? '#FFFFFF' : theme.colors.text },
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterChip,
                    selectedType === type && { backgroundColor: theme.colors.primary },
                    selectedType !== type && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: selectedType === type ? '#FFFFFF' : theme.colors.text },
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Content List */}
      <FlatList
        data={filteredContent}
        renderItem={renderContentItem}
        keyExtractor={(item) => item.id}
        style={styles.contentList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BookOpen size={48} color={theme.colors.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No content found</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  categoriesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 60,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentCard: {
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  contentImage: {
    width: '100%',
    height: 160,
    marginBottom: 12,
  },
  contentInfo: {
    padding: 16,
    paddingTop: 0,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  contentMetadata: {
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
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
  detailBanner: {
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 26,
  },
  detailBody: {
    padding: 16,
  },
  detailMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  publishInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishDate: {
    fontSize: 14,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  levelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  difficultyStars: {
    flexDirection: 'row',
  },
  detailDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  contentSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contentSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});