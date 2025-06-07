import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: '#F5F5F7' }
    }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="verify-otp" options={{ title: 'Verify OTP' }} />
    </Stack>
  );
}