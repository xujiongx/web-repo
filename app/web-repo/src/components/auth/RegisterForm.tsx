import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';
import './AuthForm.module.less';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState('');
  
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
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
    // 清除验证错误
    if (validationError) {
      setValidationError('');
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('密码确认不匹配');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('密码长度至少6位');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // 注册成功会自动登录并通过useEffect重定向
    } catch (err) {
      // 错误已经在store中处理
      console.error('Register failed:', err);
    }
  };

  const displayError = validationError || error;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>注册</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">姓名</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="请输入姓名"
              disabled={isLoading}
            />
          </div>
          
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
              placeholder="请输入密码（至少6位）"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">确认密码</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="请再次输入密码"
              disabled={isLoading}
            />
          </div>

          {displayError && (
            <div className="error-message">
              {displayError}
              <button 
                type="button" 
                onClick={() => {
                  setValidationError('');
                  clearError();
                }}
                className="error-close"
              >
                ×
              </button>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <p className="auth-link">
          已有账号？ <a href="/login">立即登录</a>
        </p>
      </div>
    </div>
  );
}