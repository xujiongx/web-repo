import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  apiService,
  User,
  LoginRequest,
  RegisterRequest,
} from "../services/api";

// 认证状态接口
interface AuthState {
  // 状态
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // 动作
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => void;
}

// 创建zustand store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // 登录
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });

          const response = await apiService.login(credentials);

          // 保存token到localStorage
          localStorage.setItem("auth_token", response.token);

          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.error?.message || error.message || "登录失败",
            isAuthenticated: false,
          });
          throw error;
        }
      },

      // 注册
      register: async (userData: RegisterRequest) => {
        try {
          set({ isLoading: true, error: null });

          await apiService.register(userData);

          // 注册成功后自动登录
          await get().login({
            email: userData.email,
            password: userData.password,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.error?.message || error.message || "注册失败",
          });
          throw error;
        }
      },

      // 登出
      logout: () => {
        localStorage.removeItem("auth_token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 设置加载状态
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // 检查认证状态
      checkAuth: () => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          set({
            token,
            isAuthenticated: true,
            // 这里可以调用API验证token有效性
            // 暂时简单处理
          });
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // 只持久化这些字段
    },
  ),
);
