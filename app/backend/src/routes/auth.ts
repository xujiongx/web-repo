import { Router, Request, Response, NextFunction } from "express";
import { createError } from "../middleware/errorHandler";
import { generateToken, authenticateToken } from "../middleware/auth";
import type { Router as ExpressRouter } from "express";

const router: ExpressRouter = Router();

// 模拟用户数据（实际项目中应该从数据库获取）
interface User {
  id: number;
  name: string;
  email: string;
  password: string; // 实际项目中应该是加密后的密码
}

const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123", // 实际项目中应该使用bcrypt加密
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password456",
  },
];

// 用户登录
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createError("Email and password are required", 400));
  }

  // 查找用户
  const user = users.find((u) => u.email === email);
  if (!user) {
    return next(createError("Invalid credentials", 401));
  }

  // 验证密码（实际项目中应该使用bcrypt.compare）
  if (user.password !== password) {
    return next(createError("Invalid credentials", 401));
  }

  // 生成JWT token
  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name
  });

  res.json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// 用户注册
router.post("/register", (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(createError("Name, email and password are required", 400));
  }

  // 检查用户是否已存在
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return next(createError("User already exists", 409));
  }

  // 创建新用户
  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    password, // 实际项目中应该使用bcrypt加密
  };

  users.push(newUser);

  // 生成JWT token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name
  });

  res.status(201).json({
    message: "Registration successful",
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  });
});

// 获取当前用户信息（需要认证）
router.get("/profile", authenticateToken, (req: Request, res: Response) => {
  res.json({
    data: req.user
  });
});

// 登出（可选实现，主要在前端清除token）
router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: "Logout successful"
  });
});

export default router;