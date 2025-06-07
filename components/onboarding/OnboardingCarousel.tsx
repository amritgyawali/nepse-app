import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  TrendingUp, 
  PieChart, 
  Bell, 
  Brain, 
  Shield, 
  Smartphone,
  ArrowRight,
  ArrowLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string[];
  features: string[];
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to NEPSE Trader',
    subtitle: 'Your Gateway to Nepal Stock Market',
    description: 'Experience the most advanced stock trading platform designed specifically for the Nepal Stock Exchange (NEPSE).',
    icon: <TrendingUp size={80} color="#FFFFFF" />,
    gradient: ['#667eea', '#764ba2'],
    features: [
      'Real-time market data',
      'Advanced charting tools',
      'Professional trading interface'
    ]
  },
  {
    id: '2',
    title: 'AI-Powered Insights',
    subtitle: 'Smart Investment Decisions',
    description: 'Leverage artificial intelligence to get personalized stock recommendations, market sentiment analysis, and predictive insights.',
    icon: <Brain size={80} color="#FFFFFF" />,
    gradient: ['#f093fb', '#f5576c'],
    features: [
      'AI stock analysis',
      'Sentiment tracking',
      'Predictive analytics',
      'Smart recommendations'
    ]
  },
  {
    id: '3',
    title: 'Portfolio Management',
    subtitle: 'Track Your Investments',
    description: 'Monitor your portfolio performance with detailed analytics, risk assessment, and sector allocation insights.',
    icon: <PieChart size={80} color="#FFFFFF" />,
    gradient: ['#4facfe', '#00f2fe'],
    features: [
      'Portfolio analytics',
      'Risk assessment',
      'Performance tracking',
      'Sector allocation'
    ]
  },
  {
    id: '4',
    title: 'Smart Notifications',
    subtitle: 'Never Miss an Opportunity',
    description: 'Get instant alerts for price movements, news updates, and market events that matter to your investments.',
    icon: <Bell size={80} color="#FFFFFF" />,
    gradient: ['#fa709a', '#fee140'],
    features: [
      'Price alerts',
      'News notifications',
      'Market updates',
      'Custom triggers'
    ]
  },
  {
    id: '5',
    title: 'Secure & Reliable',
    subtitle: 'Bank-Grade Security',
    description: 'Your data and investments are protected with enterprise-level security, biometric authentication, and encrypted transactions.',
    icon: <Shield size={80} color="#FFFFFF" />,
    gradient: ['#a8edea', '#fed6e3'],
    features: [
      'Biometric login',
      'End-to-end encryption',
      'Secure transactions',
      'Data protection'
    ]
  },
  {
    id: '6',
    title: 'Ready to Start?',
    subtitle: 'Begin Your Trading Journey',
    description: 'Join thousands of investors who trust NEPSE Trader for their stock market investments. Start building your wealth today.',
    icon: <Smartphone size={80} color="#FFFFFF" />,
    gradient: ['#d299c2', '#fef9d7'],
    features: [
      'Easy account setup',
      'Instant market access',
      'Expert support',
      'Educational resources'
    ]
  }
];

export default function OnboardingCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > 50 && currentIndex > 0) {
        // Swipe right - go to previous slide
        setCurrentIndex(currentIndex - 1);
      } else if (gestureState.dx < -50 && currentIndex < onboardingSlides.length - 1) {
        // Swipe left - go to next slide
        setCurrentIndex(currentIndex + 1);
      }
    },
  });

  const nextSlide = () => {
    if (currentIndex < onboardingSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Navigate to login/register
      router.replace('/auth/login');
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const skipOnboarding = () => {
    router.replace('/auth/login');
  };

  const currentSlide = onboardingSlides[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={currentSlide.gradient as unknown as readonly [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={skipOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content} {...panResponder.panHandlers}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              {currentSlide.icon}
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentSlide.title}</Text>
            <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
            <Text style={styles.description}>{currentSlide.description}</Text>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              {currentSlide.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomContainer}>
          {/* Page Indicators */}
          <View style={styles.indicatorContainer}>
            {onboardingSlides.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === currentIndex ? styles.activeIndicator : styles.inactiveIndicator
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationContainer}>
            {currentIndex > 0 && (
              <TouchableOpacity onPress={prevSlide} style={styles.navButton}>
                <ArrowLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            
            <View style={styles.navSpacer} />
            
            <TouchableOpacity onPress={nextSlide} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                {currentIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    maxWidth: 300,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  bottomContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  inactiveIndicator: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navSpacer: {
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});