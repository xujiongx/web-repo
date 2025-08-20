import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API基础配置
const API_BASE_URL = 'http://localhost:3001/api';

// 用户类型定义
export interface User {
  id: number;
  name: string;
  email: string;
}

// 登录请求类型
export interface LoginRequest {
  email: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// 注册请求类型
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// 注册响应类型
export interface RegisterResponse {
  message: string;
  user: User;
}

// 创建axios实例
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 请求拦截器 - 添加token
    this.api.interceptors.request.use(
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
    this.api.interceptors.response.use(
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
  }

  // 登录
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  // 注册
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await this.api.post<RegisterResponse>('/auth/register', userData);
    return response.data;
  }

  // 获取用户信息
  async getUserProfile(): Promise<User> {
    const response = await this.api.get<{ data: User }>('/auth/profile');
    return response.data.data;
  }

  // 获取用户列表
  async getUsers(): Promise<User[]> {
    const response = await this.api.get<{ data: User[] }>('/users');
    return response.data.data;
  }
}

// 重新导出所有API函数
export * from './authApi';
export * from './userApi';
export * from './http';
export * from '../types/api';

// 为了保持向后兼容，创建一个包含所有API方法的对象
import * as authApi from './authApi';
import * as userApi from './userApi';

// 兼容性API服务对象
export const apiService = {
  // 认证相关
  login: authApi.login,
  register: authApi.register,
  getUserProfile: authApi.getUserProfile,
  refreshToken: authApi.refreshToken,
  changePassword: authApi.changePassword,
  logout: authApi.logout,
  
  // 用户管理
  getUsers: userApi.getUsers,
  getUserById: userApi.getUserById,
  createUser: userApi.createUser,
  updateUser: userApi.updateUser,
  deleteUser: userApi.deleteUser,
};