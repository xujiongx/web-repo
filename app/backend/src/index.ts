import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler";
import apiRoutes from "./routes/api";

// 加载环境变量
dotenv.config();

const app: express.Express = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(morgan("combined")); // 日志
app.use(express.json({ limit: "10mb" })); // JSON解析
app.use(express.urlencoded({ extended: true })); // URL编码解析

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API路由
app.use("/api", apiRoutes);

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

export default app;
