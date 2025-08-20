import { get, post, put, del } from './http';
import { User, ApiResponse } from '../types/api';

// 获取用户列表
export const getUsers = async (): Promise<User[]> => {
  const response = await get<ApiResponse<User[]>>('/users');
  return response.data;
};

// 根据ID获取用户
export const getUserById = async (id: number): Promise<User> => {
  const response = await get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
};

// 创建用户
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  const response = await post<ApiResponse<User>>('/users', userData);
  return response.data;
};

// 更新用户
export const updateUser = async (id: number, userData: Partial<User>): Promise<User> => {
  const response = await put<ApiResponse<User>>(`/users/${id}`, userData);
  return response.data;
};

// 删除用户
export const deleteUser = async (id: number): Promise<void> => {
  await del<void>(`/users/${id}`);
};