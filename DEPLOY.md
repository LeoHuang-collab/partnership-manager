# Partnership 项目部署配置

## 1. 数据库准备（Supabase）

✅ 已完成：
- 项目地址: https://jzlfxjvtlgaoiplqwnxt.supabase.co
- 连接字符串: `postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres`

### 同步数据库 Schema

在项目目录运行：

```bash
cd F:\Projects\Partnership\partnership-api
npx prisma db push --skip-generate
```

这会同步 Prisma schema 到 Supabase 数据库，创建以下表：
- User (用户)
- Project (项目)
- Partner (合作方)
- Report (汇报)
- Todo (待办)

---

## 2. 创建管理员用户

运行种子脚本：

```bash
npx prisma db seed
```

或者手动：

```bash
node seed.js
```

管理员账号：
- 用户名: `admin`
- 密码: `admin123`

---

## 3. Vercel 部署配置

### 环境变量（在Vercel项目设置中添加）

| 变量名 | 值 |
|--------|-----|
| `DATABASE_URL` | `postgresql://postgres:Pgf$7@UFqk!ArHy@db.jzlfxjvtlgaoiplqwnxt.supabase.co:5432/postgres` |
| `JWT_SECRET` | **随机字符串**（见下方生成方法） |
| `NODE_ENV` | `production` |

### 生成 JWT_SECRET

**方法1**（使用 Node.js）：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**方法2**（PowerShell）：
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

将生成的字符串复制为 `JWT_SECRET` 的值。

---

## 4. 部署步骤

### 方法A：Vercel CLI（推荐）

1. 登录 Vercel（如果首次）：
   ```bash
   vercel login
   ```

2. 在项目根目录部署：
   ```bash
   cd F:\Projects\Partnership
   vercel --prod
   ```

3. 按提示操作，选择：
   - Set up and deploy? **Y**
   - Which scope? **你的Vercel账户**
   - Link to existing project? **N**
   - Project name? **partnership**（或自定义）
   - In which directory is your code? **.**（当前目录）
   - Want to override? **N**

4. 部署完成后，Vercel 会提供访问链接

### 方法B：GitHub + Vercel（自动部署）

1. 将项目推送到 GitHub
2. 在 Vercel 控制台 Import Project，选择该仓库
3. 配置环境变量（如上）
4. Vercel 自动构建部署

---

## 5. 测试部署

1. 访问部署链接（如 `https://partnership.vercel.app`）
2. 登录页面输入：
   - 用户名: `admin`
   - 密码: `admin123`
3. 验证功能：
   - ✅ 新增项目
   - ✅ 新增合作方
   - ✅ 新增汇报
   - ✅ 新增待办
   - ✅ 实时更新（多浏览器打开测试）

---

## 6. 实时协作功能

当前已实现：
- 前端 Socket.io 连接
- 数据变更时前端自动更新

**需要在后端补充**（非常重要！）：

在 `partnership-api/src/index.js` 中添加 Socket.io 服务器广播：

```javascript
// 在 partnership-api/src/index.js 顶部添加
import { Server } from 'socket.io';
const http = require('http');

// 创建 HTTP server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // 生产环境改为具体域名
    methods: ['GET', 'POST']
  }
});

// 在静态文件服务之后添加 WebSocket 处理
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log('WebSocket client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('WebSocket client disconnected:', socket.id);
  });
});

// 在所有 API 路由后，启动 server
const PORT = process.env.PORT || 3000;

// 替换 app.listen 为 server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

然后在每个 CRUD 操作后广播事件，例如：

```javascript
// partnership-api/src/routes/projects.js
// 更新所有类似的位置，添加 io.emit

// 创建成功后
const project = await prisma.project.create(...);
io.emit('project:created', project);
res.json(project);

// 更新成功后
const project = await prisma.project.update(...);
io.emit('project:updated', project);
res.json(project);

// 删除成功后
await prisma.project.delete(...);
io.emit('project:deleted', id);
res.json({ message: '删除成功' });
```

---

## 7. 问题排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 数据库连接失败 | DATABASE_URL 错误 | 检查Supabase连接字符串 |
| JWT错误 | JWT_SECRET未设置 | 设置环境变量并重启 |
| 无法登录 | 用户不存在 | 运行 `npx prisma db seed` |
| 表格不存在 | 未运行 migrate | 运行 `npx prisma db push` |

---

## 8. 后续优化

- 设置 Vercel 自动 HTTPS
- 配置自定义域名
- 添加审计日志
- 用户权限管理（目前所有用户看到所有数据）
- 数据备份策略

---

祝部署顺利！如有问题，随时找我 🪳
