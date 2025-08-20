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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    hasRole,
    isELISAOwner,
    token: localStorage.getItem('elisa_token'),
    login: () => {} // Placeholder for compatibility
  };
}