// @/utils/axiosInstance.ts（你的 axiosInstance 文件）
import axios from 'axios';

export interface ApiRes<T = any> {
  code: number;
  message: string;
  data: T;
  accessToken?: string;
  tokenExpires?: number;
}

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001', // 无 /api 前缀
  timeout: 10000,
  withCredentials: true,
});
//请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 1. 从 localStorage 取出登录时存储的 Token（关键！）
    // 注意：这里的 'auth_token' 要和你登录时存储 Token 的 key 一致
    const token = localStorage.getItem('auth_token'); 
    
    // 2. 如果有 Token，添加到请求头（后端 JWT 守卫需要的格式：Bearer + 空格 + Token）
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);
// 响应拦截器（保持不变）
instance.interceptors.response.use(
  (res) => {
    const data = res.data;
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
  (err) => {
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