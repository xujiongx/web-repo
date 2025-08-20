# Backend API Server

基于 Express + TypeScript 的后端API服务器。

## 功能特性

- ✅ Express.js 框架
- ✅ TypeScript 支持
- ✅ CORS 跨域支持
- ✅ 安全头设置 (Helmet)
- ✅ 请求日志 (Morgan)
- ✅ 错误处理中间件
- ✅ RESTful API 设计
- ✅ 健康检查端点

## 快速开始

### 安装依赖
```bash
pnpm install
```

### 开发模式
```bash
pnpm dev
```

### 构建项目
```bash
pnpm build
```

### 生产模式
```bash
pnpm start
```

## API 端点

### 健康检查
- `GET /health` - 服务器健康状态

### 用户管理
- `GET /api/users` - 获取所有用户
- `GET /api/users/:id` - 获取单个用户
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户

### 认证
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

## 项目结构