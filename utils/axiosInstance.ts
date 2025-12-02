// @/utils/axiosInstance.ts
import axios from 'axios';

export interface ApiRes<T = any> {
  code: number;
  message: string;
  data: T;
  accessToken?: string;
  tokenExpires?: number;
}

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  withCredentials: true, // 保持开启（核心）
});

// 新增：是否正在刷新token的标记（避免并发刷新）
let isRefreshing = false;
// 新增：存储等待刷新token的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 新增：刷新token的方法
const refreshToken = async () => {
  try {
    // 调用后端刷新token接口（依赖Cookie中的refreshToken）
    const res = await axios.post<ApiRes>(
      `${instance.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true } // 必须携带Cookie
    );
    const newToken = res.data.data.accessToken;
    // 存储新token到localStorage
    localStorage.setItem('auth_token', newToken);
    return newToken;
  } catch (error) {
    // 刷新失败，清除token并跳转登录
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    throw new Error('登录态已过期，请重新登录');
  }
};

// 请求拦截器优化
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器优化（新增token自动刷新逻辑）
instance.interceptors.response.use(
  (res) => {
    const data = res.data;
    // 登录/注册成功时，存储accessToken到localStorage
    if ((res.config.url === '/auth/login' || res.config.url === '/auth/email-register') && data.accessToken) {
      localStorage.setItem('auth_token', data.accessToken);
    }
    if (typeof data.code === 'number') {
      if (data.code !== 0 && data.code !== 200 && data.code !== 201) {
        return Promise.reject({
          message: data.message || '操作失败',
          code: data.code,
          response: res,
        });
      }
      return data;
    } else {
      return {
        code: 200,
        message: '操作成功',
        data: data,
        accessToken: data.accessToken,
        tokenExpires: data.tokenExpires,
      } as ApiRes;
    }
  },
  async (err) => {
    const originalRequest = err.config;
    // 只有401错误且不是刷新token的请求，才触发token刷新
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 标记已重试，避免循环

      if (!isRefreshing) {
        isRefreshing = true;
        // 刷新token
        const newToken = await refreshToken();
        isRefreshing = false;
        // 执行队列中的请求
        refreshSubscribers.forEach((callback) => callback(newToken));
        refreshSubscribers = [];
        // 重新发起原请求
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      } else {
        // 等待token刷新完成
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(instance(originalRequest));
          });
        });
      }
    }

    const errorMsg = err.response 
      ? err.response.data?.message || `请求失败（${err.response.status}）`
      : '网络异常，请检查连接';
    
    return Promise.reject({
      message: errorMsg,
      code: err.response?.status || 500,
      error: err,
    });
  }
);

export default instance;