// src/utils/axios-types.d.ts
import type { ApiRes } from './axiosInstance';

declare module 'axios' {
  interface AxiosResponse<T = any> extends ApiRes<T> {}
}
