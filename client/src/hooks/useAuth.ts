import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('elisa_token'),
    isLoading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    const token = localStorage.getItem('elisa_token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchCurrentUser = async (token: string) => {
    try {
      const user = await apiRequest('/api/auth/me');
      
      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true
      });
    } catch (error) {
      localStorage.removeItem('elisa_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      });

      localStorage.setItem('elisa_token', response.token);
      setAuthState({
        user: response.user,
        token: response.token,
        isLoading: false,
        isAuthenticated: true
      });

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Authentication failed' 
      };
    }
  };

  const logout = async () => {
    try {
      if (authState.token) {
        await apiRequest('/api/auth/logout', {
          method: 'POST'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('elisa_token');
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
    hasRole: (role: string) => authState.user?.role === role,
    isELISAOwner: () => {
      const allowedEmails = ['ervin210@icloud.com', 'radosavlevici.ervin@gmail.com'];
      return authState.user ? allowedEmails.includes(authState.user.email) : false;
    }
  };
}