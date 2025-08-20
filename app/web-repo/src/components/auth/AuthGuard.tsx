import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from '@tanstack/react-router';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 检查认证状态
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      navigate({ to: '/login' });
    } else if (!requireAuth && isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, requireAuth, navigate]);

  // 如果需要认证但未认证，不渲染内容
  if (requireAuth && !isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>正在验证身份...</div>
      </div>
    );
  }

  return <>{children}</>;
}