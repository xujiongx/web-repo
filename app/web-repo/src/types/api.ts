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

// 通用API响应类型
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}