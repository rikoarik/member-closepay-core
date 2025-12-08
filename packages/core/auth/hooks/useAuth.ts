/**
 * useAuth Hook
 * Hook untuk mengakses auth state dan actions
 */
import { useAuthStore } from '../stores/authStore';
import type { User, Company } from '../types';

interface UseAuthReturn {
  // State
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  loginWithNonce: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  setToken: (token: string) => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    company,
    token,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    error,
    login,
    loginWithNonce,
    logout,
    setUser,
    setCompany,
    clearError,
    initializeAuth,
  } = useAuthStore();

  return {
    // State
    user,
    company,
    token,
    isAuthenticated,
    isLoading,
    isLoggingIn,
    error,

    // Actions
    login,
    loginWithNonce,
    logout,
    setUser,
    setCompany,
    clearError,
    initializeAuth,
  };
};

