import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChevronRight, CircleUser as UserCircle, Bell, Shield, CreditCard, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = React.useState(true);
  const [biometrics, setBiometrics] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>
        
        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || 'John Doe'}</Text>
            <Text style={styles.profileEmail}>{user?.email || 'john@example.com'}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <UserCircle size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Personal Information</Text>
              <Text style={styles.settingDescription}>Update your profile details</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <CreditCard size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Payment Methods</Text>
              <Text style={styles.settingDescription}>Manage your bank accounts</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security</Text>
              <Text style={styles.settingDescription}>Change password, 2FA settings</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Bell size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage alerts and reminders</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D5DB', true: 'rgba(15, 52, 96, 0.4)' }}
              thumbColor={notifications ? '#0F3460' : '#f4f3f4'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={() => setNotifications(!notifications)}
              value={notifications}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Shield size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Biometric Authentication</Text>
              <Text style={styles.settingDescription}>Use Face ID or fingerprint</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D5DB', true: 'rgba(15, 52, 96, 0.4)' }}
              thumbColor={biometrics ? '#0F3460' : '#f4f3f4'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={() => setBiometrics(!biometrics)}
              value={biometrics}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <UserCircle size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Dark Mode</Text>
              <Text style={styles.settingDescription}>Switch app appearance</Text>
            </View>
            <Switch
              trackColor={{ false: '#D1D5DB', true: 'rgba(15, 52, 96, 0.4)' }}
              thumbColor={darkMode ? '#0F3460' : '#f4f3f4'}
              ios_backgroundColor="#D1D5DB"
              onValueChange={() => setDarkMode(!darkMode)}
              value={darkMode}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help Center</Text>
              <Text style={styles.settingDescription}>FAQs and support resources</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Contact Support</Text>
              <Text style={styles.settingDescription}>Get help from our team</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <HelpCircle size={20} color="#0F3460" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>About Us</Text>
              <Text style={styles.settingDescription}>App version and legal info</Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={20} color="#E94560" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F3460',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#0F3460',
  },
  settingDescription: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#E94560',
    marginLeft: 8,
  },
});