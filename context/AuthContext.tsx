import React, { createContext, useState, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Simulate checking for existing session
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        // In a real app, this would check for an existing token or session
        // For now, we'll just simulate it with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data for development
        setUser({
          id: '1',
          email: 'user@example.com',
          fullName: 'John Doe',
        });
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);
  
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to authenticate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for demo purposes
      setUser({
        id: '1',
        email,
        fullName: 'John Doe',
      });
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to register
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data for demo purposes
      setUser({
        id: '1',
        email,
        fullName,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to log out
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      // In a real app, this would make an API call to reset password
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}