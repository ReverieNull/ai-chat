import axios from './axios'; // 引入你已封装的Axios实例
import { ApiResponse } from '@/app/api/types';

/**
 * 闭包实现请求缓存：外层函数创建缓存容器，内层函数使用并保存缓存
 */
function createRequestCache() {
  const cache = new Map<string, ApiResponse<any>>(); // 闭包保存的缓存（外部无法直接修改）

  // 内层函数：带缓存的请求逻辑（被外部导出使用）
  return async function requestWithCache<T>(
    url: string,
    params?: Record<string, any>,
    method: 'GET' | 'POST' = 'GET'
  ): Promise<ApiResponse<T>> {
    const cacheKey = `${method}-${url}-${JSON.stringify(params || {})}`;

    // 命中缓存：直接返回保存的变量
    if (cache.has(cacheKey)) {
      console.log(`[缓存命中] ${url}`);
      return cache.get(cacheKey) as ApiResponse<T>;
    }

    // 未命中：发起请求并缓存结果
    console.log(`[发起请求] ${url}`);
    const response = method === 'GET' 
      ? await axios.get<ApiResponse<T>>(url, { params })
      : await axios.post<ApiResponse<T>>(url, params);
    
    cache.set(cacheKey, response); // 保存到闭包的cache中
    return response;
  };
}

// 导出内层函数：外部调用时，闭包的cache不会被重置
export const requestWithCache = createRequestCache();

// 组件中使用示例
// import { requestWithCache } from '@/utils/requestCache';
// const getUserInfo = () => requestWithCache('/api/user/info', { userId: 1 });
// getUserInfo(); // 第一次：发起请求
// getUserInfo(); // 第二次：从缓存获取（无网络请求）