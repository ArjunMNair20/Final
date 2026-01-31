import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import authService from '../services/authService';
import { getSupabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Check localStorage first for faster initial load
        const hasSession = localStorage.getItem(`sb-auth-token`) || 
                          Object.keys(localStorage).some(k => k.includes('auth-token'));
        
        if (!hasSession) {
          if (isMounted) setIsLoading(false);
          return;
        }

        // Load user data
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }

      // Setup auth listener
      try {
        const s = await getSupabase();
        if (!s || !isMounted) return;

        const { data: { subscription } } = s.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            try {
              const currentUser = await authService.getCurrentUser();
              if (isMounted) setUser(currentUser);
            } catch (error) {
              console.error('Auth state change error:', error);
              if (isMounted) setUser(null);
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) setUser(null);
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        console.error('Auth listener setup error:', error);
      }
    };

    // Start auth initialization
    initializeAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const loggedInUser = await authService.login(credentials);
      setUser(loggedInUser);
    } catch (error) {
      throw error;
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    try {
      const { user: newUser, needsConfirmation } = await authService.signup(credentials);
      // Only set user if email is already confirmed
      if (!needsConfirmation) {
        setUser(newUser);
      }
      return { needsConfirmation };
    } catch (error) {
      throw error;
    }
  }, []);

  const resendConfirmationEmail = useCallback(async (email: string) => {
    try {
      await authService.resendConfirmationEmail(email);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signup,
      logout,
      resendConfirmationEmail,
    }),
    [user, isLoading, login, signup, logout, resendConfirmationEmail]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

