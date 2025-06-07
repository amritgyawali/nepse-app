import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/AuthContext';
import { MarketDataProvider } from '@/context/MarketDataContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Component, ErrorInfo, ReactNode } from 'react';

class ErrorBoundary extends Component<{
  children: ReactNode;
  FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
}> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <this.props.FallbackComponent 
        error={this.state.error} 
        resetErrorBoundary={this.resetErrorBoundary} 
      />;
    }

    return this.props.children;
  }
}
import { View, Text } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
        Something went wrong
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 20, textAlign: 'center', color: '#666' }}>
        {error.message}
      </Text>
      <Text 
        style={{ fontSize: 16, color: '#007AFF', textDecorationLine: 'underline' }}
        onPress={resetErrorBoundary}
      >
        Try again
      </Text>
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  
  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  
  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Return null to keep splash screen visible while fonts load
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <MarketDataProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="stock/[symbol]" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="news/[id]" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
              </Stack>
              <StatusBar style="auto" />
            </MarketDataProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}