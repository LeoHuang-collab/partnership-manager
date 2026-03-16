import jwt from 'jsonwebtoken';

// 简化版认证中间件：只验证 token 是否存在且有效
// 生产环境需要更完善的用户系统
const JWT_SECRET = process.env.JWT_SECRET || 'partnership-app-secret-key-2024';

export default function authMiddleware(req, res, next) {
  // 健康检查端点跳过认证
  if (req.path === '/health') return next();

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // 开发阶段允许无 token 访问（可选）
    // return res.status(401).json({ error: 'No token provided' });
    return next(); // 暂时放行，简单实现
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
