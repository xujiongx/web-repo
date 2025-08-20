import { Router, Request, Response, NextFunction } from "express";
import { createError } from "../middleware/errorHandler";
import { authenticateToken } from "../middleware/auth";
import type { Router as ExpressRouter } from "express";

const router: ExpressRouter = Router();

// 模拟用户数据
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const users: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    createdAt: new Date().toISOString(),
  },
];

// 获取所有用户 - 添加认证中间件
router.get("/", authenticateToken, (req: Request, res: Response) => {
  res.json({
    data: users,
    total: users.length,
    requestedBy: req.user // 返回请求用户信息
  });
});

// 获取单个用户 - 添加认证中间件
router.get("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  const id = Number.parseInt(req.params.id);
  const user = users.find((u) => u.id === id);

  if (!user) {
    return next(createError("User not found", 404));
  }

  res.json({ 
    data: user,
    requestedBy: req.user
  });
});

// 创建用户 - 添加认证中间件
router.post("/", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(createError("Name and email are required", 400));
  }

  const newUser: User = {
    id: users.length + 1,
    name,
    email,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ 
    data: newUser,
    createdBy: req.user
  });
});

// 更新用户 - 添加认证中间件
router.put("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  const id = Number.parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return next(createError("User not found", 404));
  }

  const { name, email } = req.body;
  users[userIndex] = { ...users[userIndex], name, email };

  res.json({ 
    data: users[userIndex],
    updatedBy: req.user
  });
});

// 删除用户 - 添加认证中间件
router.delete("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  const id = Number.parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return next(createError("User not found", 404));
  }

  const deletedUser = users[userIndex];
  users.splice(userIndex, 1);
  
  res.json({
    message: "User deleted successfully",
    deletedUser,
    deletedBy: req.user
  });
});

export default router;
