import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, CircleAlert as AlertCircle, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { signUp, loading } = useAuth();
  const router = useRouter();
  
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      isValid = false;
    }
    
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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleRegister = async () => {
    if (validateForm()) {
      try {
        await signUp(email, password, fullName);
        // give it as a UrlObject, so TS doesn’t complain
        router.replace({
          pathname: 'auth/verify-otp' as const as any
        } as const);
      } catch (error) {
        console.error('Registration error:', error);
        // Handle registration error
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
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#0F3460" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join NepseTrader to start investing</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName ? styles.inputError : null]}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
              />
              {errors.fullName ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#E94560" />
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                </View>
              ) : null}
            </View>
            
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
                  placeholder="Create a password"
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
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordVisibilityButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#0F3460" />
                  ) : (
                    <Eye size={20} color="#0F3460" />
                  )}
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color="#E94560" />
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                </View>
              ) : null}
            </View>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
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
  registerButton: {
    backgroundColor: '#0F3460',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#E94560',
  },
});