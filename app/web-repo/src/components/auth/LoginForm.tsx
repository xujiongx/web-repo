import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';
import './AuthForm.module.less';

export function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { login, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // 如果已经登录，重定向到应用
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  // 清除错误当组件挂载时
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData);
      // 登录成功会通过useEffect重定向
    } catch (err) {
      // 错误已经在store中处理
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>登录</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="请输入邮箱"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="请输入密码"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button 
                type="button" 
                onClick={clearError}
                className="error-close"
              >
                ×
              </button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <p className="auth-link">
          还没有账号？ <a href="/register">立即注册</a>
        </p>
      </div>
    </div>
  );
}