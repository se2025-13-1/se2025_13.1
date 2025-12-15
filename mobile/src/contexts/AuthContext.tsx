import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getTokens,
  getUser,
  clearTokens,
  isAuthenticated as checkIsAuthenticated,
} from '../services/tokenService';
import {AuthApi} from '../modules/auth/services/authApi';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  // State
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if user is authenticated
        const authenticated = await checkIsAuthenticated();

        if (authenticated) {
          // Get user data from storage
          const storedUser = await getUser();
          setUser(storedUser);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // This is a placeholder - actual login is handled in LoginScreen
      // The screen will call setUser and setIsAuthenticated after token save
      console.log('Login initiated for:', email);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      // This is a placeholder - actual signup is handled in SignUpScreen
      // The screen will call setUser and setIsAuthenticated after token save
      console.log('Signup initiated for:', email);
    } catch (err: any) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setIsLoading(true);

      // Clear tokens and user data
      await clearTokens();

      setIsAuthenticated(false);
      setUser(null);
      setError(null);

      console.log('✅ Logged out successfully');
    } catch (err: any) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      // Try to fetch fresh profile from backend
      const response = await AuthApi.getProfile();

      if (response && response.user) {
        const updatedUser = {
          id: response.user.id,
          email: response.user.email,
          fullName: response.user.full_name || response.user.fullName,
          avatarUrl: response.user.avatar_url || response.user.avatarUrl,
        };
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to fetch profile from backend:', err);
      // Fallback to stored user data
      try {
        const storedUser = await getUser();
        setUser(storedUser);
      } catch (storageErr) {
        console.error('Failed to get stored user:', storageErr);
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    signup,
    logout,
    clearError,
    setUser,
    setIsAuthenticated,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
