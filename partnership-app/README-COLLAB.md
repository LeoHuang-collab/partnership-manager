# Partnership App - 多人协作实时同步版

> 基于 React + Vite + Node.js + Socket.IO 的协作管理系统

---

## 🎯 功能特点

- ✅ **实时同步**：所有数据变更通过 WebSocket 实时推送到所有连接客户端
- ✅ **多用户协作**：不同用户通过不同电脑访问，填写内容后大家都能看到
- ✅ **自动更新**：无需刷新页面，数据变更立即反映
- ✅ **数据持久化**：SQLite 数据库，零配置，单文件存储
- ✅ **前后端分离**：前端 React，后端 Express，易于扩展

---

## 📦 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS + react-router-dom |
| 实时通信 | Socket.IO |
| 后端 | Node.js + Express + sqlite3 |
| 数据存储 | SQLite |

---

## 🚀 快速开始

### 1. 安装依赖

**前端依赖：**
```bash
cd F:\Projects\Partnership\partnership-app
npm install
```

**后端依赖：**
```bash
cd backend
npm install
```

### 2. 启动后端服务器

**方式一：使用启动脚本（推荐）**
双击 `start-backend.bat` 或在命令行中运行：
```bash
cd backend
node server.js
```

**方式二：手动启动**
```bash
cd backend
npm start
```

后端默认运行在 `http://localhost:3000`

### 3. 启动前端开发服务器

**新开一个终端窗口：**
```bash
cd F:\Projects\Partnership\partnership-app
npm run dev
```

前端默认运行在 `http://localhost:5175`

### 4. 访问应用

- 打开浏览器访问：`http://localhost:5175`
- 登录即可使用（当前版本无需真实账号，直接进入）

---

## 🌐 局域网多人协作

要让其他人在局域网内访问：

### 1. 确保后端监听所有 IP

编辑 `backend/server.js`，找到启动部分：
```javascript
httpServer.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

### 2. 确保前端 Vite 已监听所有 IP

`vite.config.js` 已配置：
```javascript
server: {
  host: '0.0.0.0',
  port: 5175,
  proxy: {
    '/api': 'http://localhost:3000',
    '/socket.io': { target: 'http://localhost:3000', ws: true }
  }
}
```

### 3. 获取你的局域网 IP

```bash
# Windows
ipconfig

# 查找 IPv4 地址，通常是 192.168.x.x
```

### 4. 其他用户访问

- 前端：`http://你的IP:5175`
- 后端：自动通过代理连接 `http://你的IP:5175/api` → `http://localhost:3000`

---

## 🔄 实时同步机制

### WebSocket 事件列表

| 事件名 | 触发时机 | 发送数据 |
|--------|----------|----------|
| `todo:created` | 新增待办事项 | 完整的待办对象 |
| `todo:updated` | 更新待办事项 | 更新后的待办对象 |
| `todo:deleted` | 删除待办事项 | 待办 ID |
| `project:created` | 新增项目 | 完整的项目对象 |
| `project:updated` | 更新项目 | 更新后的项目对象 |
| `project:deleted` | 删除项目 | 项目 ID |
| `partner:created` | 新增合作方 | 完整的合作方对象 |
| `partner:updated` | 更新合作方 | 更新后的合作方对象 |
| `partner:deleted` | 删除合作方 | 合作方 ID |
| `report:created` | 新增汇报 | 完整的汇报对象 |
| `report:updated` | 更新汇报 | 更新后的汇报对象 |
| `report:deleted` | 删除汇报 | 汇报 ID |

### 前端同步逻辑

所有数据页面（Todos、Projects、Partners、Reports）已经内置 WebSocket 监听：

```javascript
useEffect(() => {
  const handleTodoUpdated = (updatedTodo) => {
    setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t));
  };
  socketManager.on('todo:updated', handleTodoUpdated);
  return () => socketManager.off('todo:updated', handleTodoUpdated);
}, []);
```

---

## 📁 项目结构

```
partnership-app/
├── frontend/                (你的现有代码，位置在根目录)
│   ├── src/
│   │   ├── pages/          # 页面组件（已添加 WebSocket）
│   │   ├── utils/
│   │   │   ├── api.js      # 改为调用后端 REST API
│   │   │   └── socket.js   # WebSocket 管理器
│   │   └── App.jsx         # 根组件（自动连接 WebSocket）
│   └── vite.config.js      # Vite 配置（含代理）
├── backend/                 (新增)
│   ├── server.js           # 主服务器（Express + Socket.IO）
│   ├── routes/             # REST API 路由
│   │   ├── projects.js
│   │   ├── partners.js
│   │   ├── todos.js
│   │   └── reports.js
│   ├── middleware/
│   │   └── auth.js         # 简单认证（当前放行）
│   ├── sockets/
│   │   └── index.js        # WebSocket 事件绑定
│   └── package.json        # 后端依赖
├── partnership.db           # SQLite 数据库（首次启动自动创建）
├── start-backend.bat       # 一键启动后端脚本
└── README-COLLAB.md        # 本文档
```

---

## 🛠️ 开发说明

### 数据库表结构

| 表名 | 主要字段 |
|------|----------|
| projects | id, name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate, createdAt, updatedAt |
| partners | id, name, type, contacts (JSON), createdAt |
| todos | id, task, projectId, status, priority, planCompleteDate, actualCompleteDate, blocker, responsiblePerson, createdAt, updatedAt |
| reports | id, projectId, period, reportDate, progress, nextPlan, risk, needSupport, createdAt, updatedAt |

### API 端点

```
GET    /api/projects       - 获取所有项目
POST   /api/projects       - 创建项目
PUT    /api/projects/:id   - 更新项目
DELETE /api/projects/:id   - 删除项目

GET    /api/partners       - 获取所有合作方
POST   /api/partners       - 创建合作方
PUT    /api/partners/:id   - 更新合作方
DELETE /api/partners/:id   - 删除合作方

GET    /api/todos          - 获取待办（支持过滤: projectId, status, priority）
POST   /api/todos          - 创建待办
PUT    /api/todos/:id      - 更新待办
DELETE /api/todos/:id      - 删除待办

GET    /api/reports        - 获取汇报（支持过滤: projectId, period）
POST   /api/reports        - 创建汇报
PUT    /api/reports/:id    - 更新汇报
DELETE /api/reports/:id    - 删除汇报
```

---

## 📝 待优化建议

当前版本是 MVP 基础版，后续可以添加：

- [ ] **用户认证系统**：真实的登录/注册，区分不同用户
- [ ] **操作日志**：记录谁在什么时间做了什么
- [ ] **权限管理**：管理员、编辑者、只读等角色
- [ ] **冲突处理**：当多人同时编辑同一项时的合并策略
- [ ] **离线支持**：Service Worker + 本地缓存，网络恢复后同步
- [ ] **生产部署**：PM2 管理进程、Nginx 反向代理、SSL 证书
- [ ] **数据库备份**：定时备份 SQLite 文件或迁移到 PostgreSQL/MySQL

---

## ❓ 常见问题

### Q: 为什么看不到实时更新？

A: 请确认：
1. 后端已正常运行在 3000 端口
2. 前端已启动，且在浏览器控制台看到 `✅ WebSocket connected`
3. 两个浏览器窗口都访问了同一个前端地址

### Q: 可以跨域访问吗？

A: 当前 CORS 只允许 `localhost:5175` 和 `127.0.0.1:5175`。如需开放其他域名，修改 `server.js` 中的 Socket.IO CORS 配置。

### Q: SQLite 数据库文件在哪里？

A: `backend/partnership.db`（首次运行自动创建）

### Q: 如何重置数据库？

```bash
cd backend
del partnership.db
node server.js
```

---

## 🤝 贡献

如有问题或建议，欢迎反馈！

---

**祝协作愉快！ 🎉**
