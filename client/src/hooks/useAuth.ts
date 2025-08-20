import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and user data
    const token = localStorage.getItem('elisa_token');
    const userData = localStorage.getItem('elisa_user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('elisa_token');
        localStorage.removeItem('elisa_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('elisa_token');
    localStorage.removeItem('elisa_user');
    setUser(null);
    window.location.href = '/access';
  };

  const hasRole = (role: string) => {
    return user?.role === role || user?.role === 'super_admin';
  };

  const isELISAOwner = user?.email === 'ervin210@icloud.com';

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('elisa_token', data.token);
        localStorage.setItem('elisa_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    hasRole,
    isELISAOwner,
    token: localStorage.getItem('elisa_token'),
    login
  };
}