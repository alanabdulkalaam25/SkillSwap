import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, RegisterPayload } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillswap_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verify session on mount / token change
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('skillswap_token');
      if (!storedToken) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error('Failed to verify authentication session:', err);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem('skillswap_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Login failed. Please check your credentials.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to SkillSwap server',
      };
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        localStorage.setItem('skillswap_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Registration failed. Please check your details.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to SkillSwap server',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
