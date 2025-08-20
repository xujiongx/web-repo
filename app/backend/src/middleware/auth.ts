import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createError } from "./errorHandler";

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
      };
    }
  }
}

// JWT密钥（实际项目中应该从环境变量获取）
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 认证中间件
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return next(createError("Access token is required", 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError("Token has expired", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError("Invalid token", 401));
    }
    return next(createError("Token verification failed", 401));
  }
};

// 可选的认证中间件（token可选）
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(); // 没有token也继续执行
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error: any) {
    // 忽略token错误，继续执行
    console.warn("Optional auth token verification failed:", error.message);
  }

  next();
};

// 生成JWT token的辅助函数
export const generateToken = (user: {
  id: number;
  email: string;
  name: string;
}): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: "24h", // token 24小时后过期
    },
  );
};

// 验证token的辅助函数
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};
