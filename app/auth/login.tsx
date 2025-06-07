import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, CircleAlert as AlertCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const { signIn, loading } = useAuth();
  const router = useRouter();
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: '', password: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleLogin = async () => {
    if (validateForm()) {
      try {
        await signIn(email, password);
        router.replace('/(tabs)');
      } catch (error) {
        console.error('Login error:', error);
        // Handle login error
      }
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2' }}
              style={styles.logoBackground}
            />
            <Text style={styles.logoText}>NepseTrader</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#E94560" />
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
              ) : null}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordVisibilityButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#0F3460" />
                  ) : (
                    <Eye size={20} color="#0F3460" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.password ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#E94560" />
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
              ) : null}
            </View>
            
            {/* <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link> */}
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  logoText: {
    marginTop: 10,
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0F3460',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#F9FAFB',
  },
  inputError: {
    borderColor: '#E94560',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#E94560',
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  passwordVisibilityButton: {
    padding: 10,
  },
  forgotPassword: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0F3460',
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#0F3460',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#E94560',
  },
});