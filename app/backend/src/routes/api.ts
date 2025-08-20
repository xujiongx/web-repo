import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import userRoutes from './users';
import authRoutes from './auth';

const router: ExpressRouter = Router();

// 路由模块
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

// API信息
router.get('/', (req, res) => {
  res.json({
    message: 'API Server is running',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      health: '/health'
    }
  });
});

export default router;