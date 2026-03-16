import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Database from 'better-sqlite3';
import projectsRouter from './routes/projects.js';
import partnersRouter from './routes/partners.js';
import todosRouter from './routes/todos.js';
import reportsRouter from './routes/reports.js';
import authMiddleware from './middleware/auth.js';
import setupSockets from './sockets/index.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5175', 'http://127.0.0.1:5175'],
    credentials: true
  }
});

// 数据库初始化（better-sqlite3 使用同步 API）
let db;
function initDatabase() {
  db = new Database('./partnership.db');

  // 启用外键约束
  db.pragma('foreign_keys = ON');

  // 创建表
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      partnerId TEXT,
      equityRatio INTEGER,
      totalInvestment REAL,
      status TEXT,
      startDate TEXT,
      endDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT,
      contacts TEXT,
      createdAt TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      task TEXT NOT NULL,
      projectId TEXT,
      status TEXT DEFAULT '进行中',
      priority TEXT DEFAULT '一般',
      planCompleteDate TEXT,
      actualCompleteDate TEXT,
      blocker TEXT,
      responsiblePerson TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      period TEXT NOT NULL,
      reportDate TEXT NOT NULL,
      progress TEXT,
      nextPlan TEXT,
      risk TEXT,
      needSupport TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT
    )
  `);

  console.log('✅ Database initialized');
}

// 中间件：注入 db 和 io 到请求对象
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  req.io = io;
  next();
});

// API 路由（所有路由需要认证）
app.use('/api/projects', authMiddleware, projectsRouter);
app.use('/api/partners', authMiddleware, partnersRouter);
app.use('/api/todos', authMiddleware, todosRouter);
app.use('/api/reports', authMiddleware, reportsRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket 设置
setupSockets(io, db);

// 启动服务器
const PORT = process.env.PORT || 3001;

try {
  initDatabase();
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:5175`);
    console.log(`🔌 WebSocket ready`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
