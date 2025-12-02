'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance, { ApiRes } from '@/utils/axiosInstance';

// 完善用户信息类型定义
interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  username?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (accessToken: string, userData: UserInfo) => void;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<UserInfo>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 初始化登录态
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // 1. 读取本地存储
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        let parsedUser: UserInfo | null = null;
        
        if (storedUser) {
          try {
            parsedUser = JSON.parse(storedUser) as UserInfo;
          } catch (e) {
            localStorage.removeItem('user');
          }
        }

        console.log('🔍 初始化登录态：', {
          storedUser: storedUser ? '存在' : '不存在',
          accessToken: storedAccessToken ? '存在' : '不存在',
        });

        // 2. 无accessToken直接置为未登录
        if (!storedAccessToken) {
          setUser(null);
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        // 3. 设置axios默认头
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${storedAccessToken}`;

        // 4. 调用校验接口
        try {
          const res = await axiosInstance.get<ApiRes<UserInfo>>('/auth/verify');
          console.log('✅ /auth/verify 校验成功：', res);
          
          // ✅ 修复1：取res.data.data（ApiRes的data字段才是UserInfo）
          const userData = res.data.data || parsedUser;
          if (userData) {
            setUser(userData); // 现在是UserInfo类型，匹配setState参数
            setIsLoggedIn(true);
            localStorage.setItem('user', JSON.stringify(userData));
          } else {
            throw new Error('校验成功但无用户信息');
          }
        } catch (error: any) {
          console.log('❌ /auth/verify 校验失败：', error.message);
          
          // 401 Token过期 → 尝试刷新
          if (error.code === 401) {
            try {
              console.log('🔄 尝试刷新Token（依赖Cookie）');
              const refreshRes = await axiosInstance.post<ApiRes<{ accessToken: string }>>('/auth/refresh');
              
              if (refreshRes.code === 200 && refreshRes.data?.accessToken) {
                // 刷新成功 → 更新token
                const newAccessToken = refreshRes.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                
                // 重新校验
                const retryRes = await axiosInstance.get<ApiRes<UserInfo>>('/auth/verify');
                // ✅ 修复2：取retryRes.data.data（ApiRes的data字段）
                const retryUserData = retryRes.data.data;
                if (retryRes.code === 200 && retryUserData) {
                  setUser(retryUserData); // 类型匹配
                  setIsLoggedIn(true);
                  localStorage.setItem('user', JSON.stringify(retryUserData));
                } else {
                  throw new Error('刷新Token后仍无用户信息');
                }
              } else {
                throw new Error('刷新Token失败：未返回有效accessToken');
              }
              // ✅ 修复3：给refreshError加明确类型注解
            } catch (refreshError: any) {
              console.log('❌ 刷新Token失败：', refreshError.message);
              await clearAuthState();
            }
          } else {
            // 非401错误 → 清空状态
            await clearAuthState();
          }
        }
      } catch (unexpectedError) {
        console.log('💥 初始化登录态异常：', unexpectedError);
        await clearAuthState();
      } finally {
        setLoading(false);
      }
    };

    // 清空登录态的通用方法
    const clearAuthState = async () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      setUser(null);
      setIsLoggedIn(false);
    };

    initAuth();
  }, []);

  // 登录逻辑
  const login = (accessToken: string, userData: UserInfo) => {
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      setUser(userData);
      setIsLoggedIn(true);
      console.log('✅ 登录成功：', userData);
    } catch (error) {
      console.error('❌ 登录存储失败：', error);
      throw new Error('登录状态存储失败，请重试');
    }
  };

  // 登出逻辑
  const logout = async () => {
    try {
      await axiosInstance.post<ApiRes>('/auth/logout').catch(() => {
        console.warn('⚠️ 后端登出接口调用失败，仅清空前端状态');
      });
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      delete axiosInstance.defaults.headers.common['Authorization'];
      
      setUser(null);
      setIsLoggedIn(false);
      console.log('✅ 登出成功');
      
      router.push('/login');
    } catch (error) {
      console.error('❌ 登出失败：', error);
      throw new Error('登出失败，请重试');
    }
  };

  // 更新用户信息
  const updateUser = (userData: Partial<UserInfo>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('✅ 更新用户信息：', updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 自定义Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}