'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/utils/axiosInstance';

interface AuthContextType {
  user: any | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken'); 
      console.log('1. localStorage accessToken:', accessToken);
      console.log('1. localStorage refreshToken:', refreshToken);

      if (accessToken) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        try {
          const res = await axiosInstance.get('/user/profile');
          console.log('3. /user/profile 结果:', res.data);
          console.log('3. 原始 axios 结果:', res);
          
          // ✅ 修复：直接使用 res.data（不是 res.data.data）
          const userData = res.data;
          console.log('✅ 修正后用户数据:', userData);
          
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error: any) {
          if (error.response?.status === 401 && refreshToken) {
            try {
              const refreshRes = await axiosInstance.post('/auth/refresh', { refreshToken });
              const newAccessToken = refreshRes.data.accessToken;
              localStorage.setItem('accessToken', newAccessToken);
              axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

              // ✅ 修复：直接使用 retry.data
              const retry = await axiosInstance.get('/user/profile');
              const userData = retry.data;
              setUser(userData);
              setIsLoggedIn(true);
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));

    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setUser(userData);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axiosInstance.defaults.headers.common['Authorization'];
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}