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

    // Load user on mount - use requestIdleCallback to not block initial render
    const loadUser = async () => {
      try {
        // Check localStorage first for faster initial load
        const session = localStorage.getItem('sb-' + (import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'default') + '-auth-token');
        if (!session) {
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }

        // Then load full user data asynchronously
        const currentUser = await authService.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Defer auth state listener setup to not block initial render
    const setupAuthListener = async () => {
      try {
        const s = await getSupabase();
        if (!s || !isMounted) return;

        const { data: { subscription } } = s.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted) return;
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            try {
              const currentUser = await authService.getCurrentUser();
              if (isMounted) {
                setUser(currentUser);
              }
            } catch (error) {
              console.error('Failed to get user after auth change:', error);
              if (isMounted) {
                setUser(null);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            if (isMounted) {
              setUser(null);
            }
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (error) {
        console.error('Failed to setup auth listener:', error);
      }
    };

    // Load user immediately but non-blocking
    loadUser();

    // Setup auth listener after a short delay to not block initial render
    const timeoutId = setTimeout(() => {
      setupAuthListener();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
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

