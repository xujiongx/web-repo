import { get, post } from './http';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  ApiResponse
} from '../types/api';

// 登录
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return post<LoginResponse>('/auth/login', credentials);
};

// 注册
export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  return post<RegisterResponse>('/auth/register', userData);
};

// 获取用户信息
export const getUserProfile = async (): Promise<User> => {
  const response = await get<ApiResponse<User>>('/auth/profile');
  return response.data;
};

// 刷新token
export const refreshToken = async (): Promise<{ token: string }> => {
  return post<{ token: string }>('/auth/refresh');
};

// 修改密码
export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  return post<{ message: string }>('/auth/change-password', data);
};

// 登出
export const logout = async (): Promise<{ message: string }> => {
  return post<{ message: string }>('/auth/logout');
};