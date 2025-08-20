import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API基础配置
export const API_BASE_URL = 'http://localhost:3001/api';

// 创建axios实例
const createAxiosInstance = (): AxiosInstance => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 添加token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 处理错误
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token过期，清除本地存储
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response?.data || error.message);
    }
  );

  return api;
};

// 创建全局axios实例
const httpInstance = createAxiosInstance();

// 基础请求方法
export const get = async <T>(url: string, params?: any): Promise<T> => {
  const response = await httpInstance.get<T>(url, { params });
  return response.data;
};

export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await httpInstance.post<T>(url, data);
  return response.data;
};

export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response = await httpInstance.put<T>(url, data);
  return response.data;
};

export const del = async <T>(url: string): Promise<T> => {
  const response = await httpInstance.delete<T>(url);
  return response.data;
};

export const patch = async <T>(url: string, data?: any): Promise<T> => {
  const response = await httpInstance.patch<T>(url, data);
  return response.data;
};

// 导出axios实例供高级用法
export const httpClient = httpInstance;