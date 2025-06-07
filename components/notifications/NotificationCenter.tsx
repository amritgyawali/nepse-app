import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  BellRing,
  BellOff,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Settings,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  Plus,
  Target,
  BarChart3,
  Newspaper,
  User,
  Shield,
  Zap,
  Star,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Eye,
  Volume2,
  VolumeX,
  Smartphone,
  Mail,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { enhancedStockData } from '@/assets/data/enhancedMockData';

const { width: screenWidth } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'price_alert' | 'news' | 'order' | 'portfolio' | 'market' | 'ai_insight' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable: boolean;
  data?: any;
  icon?: React.ReactNode;
  color?: string;
}

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  priceAlerts: boolean;
  newsAlerts: boolean;
  orderAlerts: boolean;
  portfolioAlerts: boolean;
  marketAlerts: boolean;
  aiInsights: boolean;
  systemAlerts: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
  frequency: 'instant' | 'hourly' | 'daily';
}

const notificationTypes = [
  { id: 'all', name: 'All', icon: <Bell size={20} color="#FFFFFF" />, color: '#6366F1' },
  { id: 'price_alert', name: 'Price Alerts', icon: <TrendingUp size={20} color="#FFFFFF" />, color: '#10B981' },
  { id: 'news', name: 'News', icon: <Newspaper size={20} color="#FFFFFF" />, color: '#8B5CF6' },
  { id: 'order', name: 'Orders', icon: <Target size={20} color="#FFFFFF" />, color: '#F59E0B' },
  { id: 'portfolio', name: 'Portfolio', icon: <BarChart3 size={20} color="#FFFFFF" />, color: '#06B6D4' },
  { id: 'ai_insight', name: 'AI Insights', icon: <Zap size={20} color="#FFFFFF" />, color: '#EC4899' },
  { id: 'system', name: 'System', icon: <Settings size={20} color="#FFFFFF" />, color: '#6B7280' },
];

const priorityColors = {
  low: '#6B7280',
  medium: '#F59E0B',
  high: '#EF4444',
  urgent: '#DC2626',
};

const priorityIcons = {
  low: <Info size={16} color="#6B7280" />,
  medium: <AlertTriangle size={16} color="#F59E0B" />,
  high: <AlertTriangle size={16} color="#EF4444" />,
  urgent: <AlertTriangle size={16} color="#DC2626" />,
};

export default function NotificationCenter() {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    priceAlerts: true,
    newsAlerts: true,
    orderAlerts: true,
    portfolioAlerts: true,
    marketAlerts: true,
    aiInsights: true,
    systemAlerts: false,
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    frequency: 'instant',
  });

  // Generate mock notifications
  useEffect(() => {
    const generateNotifications = () => {
      const mockNotifications: Notification[] = [];
      
      // Price alerts
      enhancedStockData.slice(0, 3).forEach((stock: { symbol: any; name: any; change: number; price: number; }, index: any) => {
        mockNotifications.push({
          id: `price_${index}`,
          type: 'price_alert',
          title: `${stock.symbol} Price Alert`,
          message: `${stock.name} has ${stock.change > 0 ? 'reached' : 'dropped to'} Rs. ${stock.price.toFixed(2)} (${stock.change > 0 ? '+' : ''}${stock.change.toFixed(2)}%)`,
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          isRead: Math.random() > 0.5,
          priority: stock.change > 5 ? 'high' : stock.change > 2 ? 'medium' : 'low',
          actionable: true,
          data: { symbol: stock.symbol, price: stock.price, change: stock.change },
          icon: stock.change > 0 ? <TrendingUp size={20} color="#10B981" /> : <TrendingDown size={20} color="#EF4444" />,
          color: stock.change > 0 ? '#10B981' : '#EF4444',
        });
      });
      
      // News alerts
      enhancedStockData.slice(0, 4).forEach((stock: { symbol: string; name: string; price: number; change: number; }, index: number) => {
        mockNotifications.push({
          id: `news_${index}`,
          type: 'news',
          title: 'Breaking News',
          message: `Market update: ${stock.name} reports strong quarterly earnings`,
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          isRead: Math.random() > 0.3,
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
          actionable: true,
          data: { newsId: `news_${index}`, category: 'market_update' },
          icon: <Newspaper size={20} color="#8B5CF6" />,
          color: '#8B5CF6',
        });
      });
      
      // Order notifications
      ['NABIL', 'NICA', 'CHCL'].forEach((symbol, index) => {
        mockNotifications.push({
          id: `order_${index}`,
          type: 'order',
          title: 'Order Executed',
          message: `Your ${Math.random() > 0.5 ? 'buy' : 'sell'} order for ${symbol} has been executed at Rs. ${(Math.random() * 1000 + 500).toFixed(2)}`,
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          isRead: Math.random() > 0.7,
          priority: 'medium',
          actionable: true,
          data: { symbol, orderType: Math.random() > 0.5 ? 'buy' : 'sell' },
          icon: <Target size={20} color="#F59E0B" />,
          color: '#F59E0B',
        });
      });
      
      // Portfolio alerts
      mockNotifications.push(
        {
          id: 'portfolio_1',
          type: 'portfolio',
          title: 'Portfolio Milestone',
          message: 'Congratulations! Your portfolio has crossed Rs. 5,00,000 mark',
          timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          isRead: false,
          priority: 'medium',
          actionable: true,
          data: { milestone: 500000 },
          icon: <Star size={20} color="#06B6D4" />,
          color: '#06B6D4',
        },
        {
          id: 'portfolio_2',
          type: 'portfolio',
          title: 'Rebalancing Suggestion',
          message: 'Your portfolio allocation has shifted. Consider rebalancing your investments.',
          timestamp: new Date(Date.now() - Math.random() * 7200000).toISOString(),
          isRead: true,
          priority: 'low',
          actionable: true,
          data: { action: 'rebalance' },
          icon: <BarChart3 size={20} color="#06B6D4" />,
          color: '#06B6D4',
        }
      );
      
      // AI insights
      mockNotifications.push(
        {
          id: 'ai_1',
          type: 'ai_insight',
          title: 'AI Market Insight',
          message: 'Based on technical analysis, NABIL shows strong bullish signals for the next week.',
          timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString(),
          isRead: false,
          priority: 'medium',
          actionable: true,
          data: { symbol: 'NABIL', sentiment: 'bullish' },
          icon: <Zap size={20} color="#EC4899" />,
          color: '#EC4899',
        },
        {
          id: 'ai_2',
          type: 'ai_insight',
          title: 'Risk Alert',
          message: 'Your portfolio risk has increased due to recent market volatility. Consider diversification.',
          timestamp: new Date(Date.now() - Math.random() * 5400000).toISOString(),
          isRead: true,
          priority: 'high',
          actionable: true,
          data: { riskLevel: 'high' },
          icon: <Shield size={20} color="#EC4899" />,
          color: '#EC4899',
        }
      );
      
      // System notifications
      mockNotifications.push(
        {
          id: 'system_1',
          type: 'system',
          title: 'App Update Available',
          message: 'A new version of the app is available with improved features and bug fixes.',
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          isRead: false,
          priority: 'low',
          actionable: true,
          data: { version: '2.1.0' },
          icon: <RefreshCw size={20} color="#6B7280" />,
          color: '#6B7280',
        }
      );
      
      return mockNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };
    
    setNotifications(generateNotifications());
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesType = selectedType === 'all' || notification.type === selectedType;
      const matchesSearch = searchQuery === '' || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [notifications, selectedType, searchQuery]);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => setNotifications([]) },
      ]
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionable) {
      // Handle different notification actions
      switch (notification.type) {
        case 'price_alert':
          // Navigate to stock detail
          Alert.alert('Price Alert', `View ${notification.data?.symbol} details?`);
          break;
        case 'news':
          // Navigate to news detail
          Alert.alert('News', 'Open news article?');
          break;
        case 'order':
          // Navigate to order history
          Alert.alert('Order', 'View order details?');
          break;
        case 'portfolio':
          // Navigate to portfolio
          Alert.alert('Portfolio', 'View portfolio analytics?');
          break;
        case 'ai_insight':
          // Navigate to AI analysis
          Alert.alert('AI Insight', 'View detailed analysis?');
          break;
        default:
          break;
      }
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: theme.colors.surface },
        !item.isRead && { borderLeftWidth: 4, borderLeftColor: item.color || theme.colors.primary },
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          {item.icon || <Bell size={20} color={theme.colors.primary} />}
        </View>
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={[styles.notificationTitle, { color: theme.colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.notificationMeta}>
              {priorityIcons[item.priority]}
              <Text style={[styles.notificationTime, { color: theme.colors.secondary }]}>
                {formatTimeAgo(item.timestamp)}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.notificationMessage, { color: theme.colors.secondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          
          <View style={styles.notificationFooter}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[item.priority] }]}>
              <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
            </View>
            
            {!item.isRead && (
              <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.notificationActions}
          onPress={() => {
            Alert.alert(
              'Notification Actions',
              'Choose an action',
              [
                { text: 'Mark as Read', onPress: () => markAsRead(item.id) },
                { text: 'Delete', style: 'destructive', onPress: () => deleteNotification(item.id) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <MoreVertical size={16} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderSettings = () => (
    <View style={[styles.settingsContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.settingsHeader}>
        <Text style={[styles.settingsTitle, { color: theme.colors.text }]}>Notification Settings</Text>
        <TouchableOpacity onPress={() => setShowSettings(false)}>
          <XCircle size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.settingsContent} showsVerticalScrollIndicator={false}>
        {/* General Settings */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>General</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Smartphone size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Push Notifications</Text>
            </View>
            <Switch
              value={settings.pushEnabled}
              onValueChange={(value) => updateSetting('pushEnabled', value)}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
              thumbColor={settings.pushEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Mail size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Email Notifications</Text>
            </View>
            <Switch
              value={settings.emailEnabled}
              onValueChange={(value) => updateSetting('emailEnabled', value)}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
              thumbColor={settings.emailEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Volume2 size={20} color={theme.colors.primary} />
              <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Sound</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSetting('soundEnabled', value)}
              trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
              thumbColor={settings.soundEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Notification Types */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notification Types</Text>
          
          {[
            { key: 'priceAlerts', label: 'Price Alerts', icon: <TrendingUp size={20} color={theme.colors.primary} /> },
            { key: 'newsAlerts', label: 'News Alerts', icon: <Newspaper size={20} color={theme.colors.primary} /> },
            { key: 'orderAlerts', label: 'Order Alerts', icon: <Target size={20} color={theme.colors.primary} /> },
            { key: 'portfolioAlerts', label: 'Portfolio Alerts', icon: <BarChart3 size={20} color={theme.colors.primary} /> },
            { key: 'marketAlerts', label: 'Market Alerts', icon: <DollarSign size={20} color={theme.colors.primary} /> },
            { key: 'aiInsights', label: 'AI Insights', icon: <Zap size={20} color={theme.colors.primary} /> },
            { key: 'systemAlerts', label: 'System Alerts', icon: <Settings size={20} color={theme.colors.primary} /> },
          ].map((item) => (
            <View key={item.key} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                {item.icon}
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{item.label}</Text>
              </View>
              <Switch
                value={settings[item.key as keyof NotificationSettings] as boolean}
                onValueChange={(value) => updateSetting(item.key as keyof NotificationSettings, value)}
                trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}80` }}
                thumbColor={settings[item.key as keyof NotificationSettings] ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          ))}
        </View>
        
        {/* Frequency */}
        <View style={styles.settingsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Frequency</Text>
          
          {['instant', 'hourly', 'daily'].map((frequency) => (
            <TouchableOpacity
              key={frequency}
              style={styles.frequencyItem}
              onPress={() => updateSetting('frequency', frequency)}
            >
              <View style={styles.frequencyInfo}>
                <Clock size={20} color={theme.colors.primary} />
                <Text style={[styles.frequencyLabel, { color: theme.colors.text }]}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                { borderColor: theme.colors.border },
                settings.frequency === frequency && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
              ]}>
                {settings.frequency === frequency && (
                  <CheckCircle size={16} color="#FFFFFF" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  if (showSettings) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderSettings()}
      </SafeAreaView>
    );
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
          <View style={styles.headerLeft}>
            <BellRing size={28} color="#FFFFFF" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <Text style={styles.headerSubtitle}>
                {unreadCount} unread{urgentCount > 0 && `, ${urgentCount} urgent`}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
              <Filter size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSettings(true)} style={{ marginLeft: 16 }}>
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={[styles.quickActions, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity style={styles.quickAction} onPress={markAllAsRead}>
          <CheckCircle size={20} color={theme.colors.primary} />
          <Text style={[styles.quickActionText, { color: theme.colors.primary }]}>Mark All Read</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction} onPress={clearAllNotifications}>
          <Trash2 size={20} color="#EF4444" />
          <Text style={[styles.quickActionText, { color: '#EF4444' }]}>Clear All</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <RefreshCw size={20} color={theme.colors.secondary} />
          <Text style={[styles.quickActionText, { color: theme.colors.secondary }]}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filter */}
      <View style={[styles.typeFilter, { backgroundColor: theme.colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {notificationTypes.map((type) => {
            const count = notifications.filter(n => type.id === 'all' || n.type === type.id).length;
            return (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType === type.id && { backgroundColor: type.color },
                  selectedType !== type.id && { backgroundColor: theme.colors.background, borderColor: theme.colors.border, borderWidth: 1 },
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                {type.icon}
                <Text style={[
                  styles.typeText,
                  { color: selectedType === type.id ? '#FFFFFF' : theme.colors.text },
                ]}>
                  {type.name}
                </Text>
                {count > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: selectedType === type.id ? 'rgba(255,255,255,0.3)' : theme.colors.primary }]}>
                    <Text style={[styles.countText, { color: '#FFFFFF' }]}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <BellOff size={48} color={theme.colors.secondary} />
            <Text style={[styles.emptyText, { color: theme.colors.secondary }]}>No notifications</Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.secondary }]}>You're all caught up!</Text>
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
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  typeFilter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  typeText: {
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
  notificationsList: {
    flex: 1,
  },
  notificationItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTime: {
    fontSize: 12,
    marginLeft: 4,
  },
  notificationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationActions: {
    padding: 4,
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
  // Settings Styles
  settingsContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsContent: {
    flex: 1,
  },
  settingsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  frequencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  frequencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  frequencyLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});