'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

// axios实例（适配后端地址）
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true,
});

/**
 * 校验JWT Token是否有效（核心：适配accessToken）
 * @param token 要校验的accessToken
 */
const isValidAccessToken = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    // 1. 校验JWT格式（必须是3段）
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // 2. 解码Payload，校验是否过期（JWT的exp是秒级，转毫秒）
    const payload = JSON.parse(atob(parts[1]));
    const expTime = payload.exp * 1000;
    const now = Date.now();
    // 预留30秒缓冲，避免Token刚过期
    return expTime - now > 30 * 1000;
  } catch (error) {
    console.error('accessToken解析失败：', error);
    return false;
  }
};

/**
 * 用refreshToken刷新accessToken（后端需提供刷新接口）
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    // 调用后端刷新Token接口（替换为你的实际接口路径）
    const res = await axiosInstance.post('/auth/refresh', {
      refreshToken,
    });

    const { code, data } = res.data;
    if (code === 200 && data?.accessToken) {
      // 刷新成功：更新localStorage中的accessToken
      localStorage.setItem('accessToken', data.accessToken);
      // 若后端返回新的refreshToken，也同步更新
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error('刷新Token失败：', error);
    // 刷新失败：清除无效Token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // 防重复点击

  /**
   * 处理「开始对话」点击逻辑（完整登录态校验+自动刷新）
   */
  const handleStartChat = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. 获取本地存储的Token
      let accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // 2. 第一步校验：accessToken是否有效
      if (isValidAccessToken(accessToken)) {
        // accessToken有效：直接跳聊天页
        router.push('/chat');
        return;
      }

      // 3. 第二步：accessToken无效，但有refreshToken → 尝试刷新
      if (refreshToken) {
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          // 刷新成功：跳聊天页
          router.push('/chat');
          return;
        }
      }

      // 4. 最终：无有效Token → 提示并跳登录页
      alert('登录状态已过期，请重新登录～');
      router.push('/login');
    } catch (error) {
      console.error('登录态校验异常：', error);
      alert('登录状态异常，请重新登录');
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理导航点击（登录/注册/个人中心）
   */
  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-teal-100/95 via-white to-cyan-100/95">
      <div className="w-full max-w-2xl 
        bg-white/60 backdrop-blur-xl 
        rounded-3xl shadow-xl shadow-teal-200/20 
        border border-teal-200/60 
        p-10 transition-all duration-300 
        hover:shadow-teal-300/30 hover:border-teal-300/70
        hover:translate-y-[-2px]
        inset-shadow-sm bg-gradient-to-br from-white/70 to-white/40">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight 
            bg-clip-text text-transparent bg-gradient-to-r from-teal-700 to-cyan-700">
            天游AI助手
          </h1>
          <p className="text-sm text-teal-600/80 mt-3 tracking-wide">
            盛天而游八方，气定而观四海
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto mt-4 opacity-70"></div>
        </div>

        {/* 开始对话按钮（带加载态） */}
        <button
          onClick={handleStartChat}
          disabled={isLoading}
          className="w-full py-4 
            bg-gradient-to-r from-teal-500 to-cyan-500 
            text-white rounded-xl font-semibold text-lg 
            hover:from-teal-600 hover:to-cyan-600 
            active:scale-95 transition-all duration-300
            shadow-lg shadow-teal-300/30 
            hover:shadow-xl hover:shadow-teal-400/40
            disabled:bg-teal-200 disabled:cursor-not-allowed disabled:shadow-none
            relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            {isLoading ? '跳转中...' : '开始对话'}
          </span>
          <span className="absolute top-0 left-[-100%] w-full h-full bg-white/10 
            transform skew-x-12 transition-all duration-500 
            hover:left-[100%]"></span>
        </button>

        {/* 导航链接（用button+router.push，无页面刷新） */}
        <div className="flex justify-center gap-12 text-base mt-10">
          {[
            { text: '登录', path: '/login' },
            { text: '注册', path: '/register' },
            { text: '个人中心', path: '/profile' }
          ].map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className="text-teal-700 hover:text-cyan-700 transition-colors duration-300
                relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                after:w-0 after:h-[1px] after:bg-gradient-to-r from-teal-500 to-cyan-500
                after:transition-all after:duration-300 hover:after:w-full
                bg-transparent border-none cursor-pointer"
            >
              {item.text}
            </button>
          ))}
        </div>

        <div className="text-center mt-10 text-xs text-teal-600/60 tracking-wider">
          © 2025 天游AI助手 · 所有权利保留
        </div>
      </div>
    </div>
  );
}