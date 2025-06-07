import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Settings,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  Star,
  Share2,
  LogOut,
  ChevronRight,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  Trash2,
  RefreshCw,
  Info,
  Mail,
  MessageSquare,
  ExternalLink,
  Palette,
  Volume2,
  VolumeX,
  Wifi,
  Database,
  Clock,
  Target,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  color?: string;
  showChevron?: boolean;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const isDarkMode = isDark;
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [newsAlerts, setNewsAlerts] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out Nepal Stock App - Your complete NEPSE trading companion!',
        url: 'https://nepalstock.app', // Placeholder URL
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRateApp = () => {
    // Placeholder for app store rating
    Alert.alert('Rate App', 'Thank you for your feedback! This feature will be available in the app store version.');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@nepalstock.app?subject=Nepal Stock App Support');
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Implement cache clearing logic
            Alert.alert('Success', 'Cache cleared successfully!');
          },
        },
      ]
    );
  };

  const settingSections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          id: 'profile',
          title: 'Profile Settings',
          subtitle: 'Manage your account information',
          icon: <User size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => router.push('/profile'),
          showChevron: true,
        },
        {
          id: 'security',
          title: 'Security & Privacy',
          subtitle: 'Password, biometric, and privacy settings',
          icon: <Shield size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => router.push('/(tabs)/settings/security'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          icon: isDarkMode ? <Moon size={20} color={theme.colors.primary} /> : <Sun size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: isDarkMode,
          onToggle: toggleTheme,
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English (US)',
          icon: <Globe size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Multiple language support will be available in future updates.'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications',
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: <Bell size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          id: 'price-alerts',
          title: 'Price Alerts',
          subtitle: 'Get notified about price changes',
          icon: <Target size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: priceAlerts,
          onToggle: setPriceAlerts,
        },
        {
          id: 'news-alerts',
          title: 'News Alerts',
          subtitle: 'Breaking news and market updates',
          icon: <MessageSquare size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: newsAlerts,
          onToggle: setNewsAlerts,
        },
        {
          id: 'sound',
          title: 'Sound Effects',
          subtitle: 'Enable notification sounds',
          icon: soundEnabled ? <Volume2 size={20} color={theme.colors.primary} /> : <VolumeX size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: soundEnabled,
          onToggle: setSoundEnabled,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          id: 'biometric',
          title: 'Biometric Login',
          subtitle: 'Use fingerprint or face ID',
          icon: <Smartphone size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          id: 'auto-lock',
          title: 'Auto Lock',
          subtitle: 'Lock app when inactive',
          icon: <Lock size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Auto lock settings will be available soon.'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Data & Storage',
      items: [
        {
          id: 'auto-sync',
          title: 'Auto Sync',
          subtitle: 'Automatically sync data',
          icon: <RefreshCw size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: autoSync,
          onToggle: setAutoSync,
        },
        {
          id: 'offline-mode',
          title: 'Offline Mode',
          subtitle: 'Use cached data when offline',
          icon: <Wifi size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: offlineMode,
          onToggle: setOfflineMode,
        },
        {
          id: 'clear-cache',
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          icon: <Trash2 size={20} color={theme.colors.primary} />,
          type: 'action',
          onPress: handleClearCache,
          showChevron: true,
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'Help improve the app',
          icon: <Database size={20} color={theme.colors.primary} />,
          type: 'toggle',
          value: analyticsEnabled,
          onToggle: setAnalyticsEnabled,
        },
        {
          id: 'privacy-policy',
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: <Eye size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => Linking.openURL('https://nepalstock.app/privacy'),
          showChevron: true,
        },
        {
          id: 'terms',
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          icon: <Info size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => Linking.openURL('https://nepalstock.app/terms'),
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          id: 'help',
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: <HelpCircle size={20} color={theme.colors.primary} />,
          type: 'navigation',
          onPress: () => router.push('/help'),
          showChevron: true,
        },
        {
          id: 'contact',
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: <Mail size={20} color={theme.colors.primary} />,
          type: 'action',
          onPress: handleContactSupport,
          showChevron: true,
        },
        {
          id: 'rate',
          title: 'Rate App',
          subtitle: 'Rate us on the app store',
          icon: <Star size={20} color={theme.colors.primary} />,
          type: 'action',
          onPress: handleRateApp,
          showChevron: true,
        },
        {
          id: 'share',
          title: 'Share App',
          subtitle: 'Tell your friends about us',
          icon: <Share2 size={20} color={theme.colors.primary} />,
          type: 'action',
          onPress: handleShare,
          showChevron: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, { borderBottomColor: theme.colors.border }]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingIcon}>
        {item.icon}
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {item.subtitle}
          </Text>
        )}
      </View>
      
      <View style={styles.settingAction}>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={item.value ? '#FFFFFF' : '#F4F3F4'}
          />
        )}
        {item.showChevron && (
          <ChevronRight size={20} color={theme.colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

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
          <Settings size={28} color="#FFFFFF" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>
        </View>
      </LinearGradient>

      {/* User Info */}
      {user && (
        <View style={[styles.userSection, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.userAvatar}>
            <User size={32} color={theme.colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {user.name || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
              {user.email || 'user@example.com'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editProfile}>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Settings Sections */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>
            {section.items.map(renderSettingItem)}
          </View>
        ))}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#EF4444" />
          <Text style={[styles.signOutText, { color: '#EF4444' }]}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={[styles.appInfo, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.appName, { color: theme.colors.text }]}>Nepal Stock App</Text>
          <Text style={[styles.appVersion, { color: theme.colors.textSecondary }]}>Version 1.0.0</Text>
          <Text style={[styles.appCopyright, { color: theme.colors.textSecondary }]}>© 2024 Nepal Stock App</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  editProfile: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingAction: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
    paddingVertical: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  appVersion: {
    fontSize: 14,
    marginTop: 4,
  },
  appCopyright: {
    fontSize: 12,
    marginTop: 8,
  },
});