# Partnership Skill

**名称:** 合作伙伴管理系统  
**版本:** 1.0.0  
**作者:** 小强 🪳  
**描述:** 一键启动、部署和管理合作伙伴管理系统，支持本地开发、内网穿透（Cloudflare Tunnel）和线上多人协作  

---

## 触发词

当你说以下任意短语时，Skill 会自动启动：

- `启动合作伙伴管理`
- `启动 partnership`
- `打开合作伙伴系统`
- `启动协作系统`
- `打开 partners`
- `启动项目管理系统`

---

## 能力

### 🚀 start

**用意：** 启动整个系统（默认动作）  
**命令：** `启动合作伙伴管理`

**执行流程：**
1. ✅ 检查 Node.js 环境（自动安装缺失依赖）
2. ✅ 安装前端+后端 npm 依赖
3. ✅ 确保 PM2 进程守护已安装
4. ✅ 启动后端 (port: 3001)
5. ✅ 启动前端 (port: 5175)
6. ✅ 配置 Cloudflare Tunnel（首次需人工登录）
7. ✅ 返回所有访问地址

**成功输出示例：**
```
═══════════════════════════════════════════════════════════
  ✅ 系统启动成功！
═══════════════════════════════════════════════════════════

  访问方式:
    🏠 本机: http://localhost:5175
    🌐 公网: https://partnership-abc123.trycloudflare.com

  PM2 管理命令:
    pm2 list              # 查看所有进程
    pm2 logs              # 查看日志
    pm2 stop all          # 停止所有
═══════════════════════════════════════════════════════════
```

---

### 🛑 stop

**用意：** 停止所有服务  
**命令：** `停止合作伙伴管理`

**动作：**
- 停止 PM2 管理的后端、前端、隧道进程
- 清理临时状态

---

### 📊 status

**用意：** 查看运行状态  
**命令：** `合作伙伴系统状态`

**输出：**
- 后端、前端、隧道的运行状态 (active/stopped)
- 进程 PID
- 访问地址（公网+本机）

---

### 🔄 restart

**用意：** 重启系统  
**命令：** `重启合作伙伴管理`

**动作：** stop → start（保留配置）

---

## 配置

### 端口配置

编辑 `F:\Projects\Partnership\partnership-app\.openclaw\skills\partnership\index.js`：

```javascript
const CONFIG = {
  FRONTEND_PORT: 5175,  // 前端端口
  BACKEND_PORT: 3001,   // 后端端口
};
```

### Cloudflare Tunnel 手动配置

如果自动登录失败，参考 `README.md` 的手动配置章节。

---

## 架构

```
┌─────────────────────────────────────────────┐
│            Cloudflare Tunnel                │
│  (公网域名: xxx.trycloudflare.com)         │
└───────────────┬─────────────────────────────┘
                │ HTTPS/WSS
┌───────────────▼─────────────────────────────┐
│        你的电脑 (本机)                      │
│  ┌────────────┐   ┌────────────┐          │
│  │   Frontend │   │   Backend  │          │
│  │  :5175     │←→│  :3001     │          │
│  │  React +   │   │  Express   │          │
│  │  Socket.IO │   │  SQLite    │          │
│  └────────────┘   └────────────┘          │
│         ↓ 进程守护 (PM2)                    │
│  ┌─────────────────────────────────────┐  │
│  │      PM2 (自动崩溃恢复)             │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 前端 | React 19 + Vite + Tailwind CSS |
| 后端 | Node.js + Express + Socket.IO + better-sqlite3 |
| 进程管理 | PM2 |
| 内网穿透 | Cloudflare Tunnel (免费) |
| 实时同步 | WebSocket |

---

## 注意事项

⚠️ **电脑必须开机并联网**，否则无法访问。

⚠️ **首次启动需要人机交互**：Cloudflare 登录（扫码或浏览器登录，一次配置后永久记住）。

⚠️ **数据本地存储**：定期备份 `backend/partnership.db`。

⚠️ **防火墙**：确保 5175 和 3001 端口开放（Skill 已尝试自动添加规则，可能需要管理员权限）。

---

## 故障排查

### Cloudflare Tunnel 连接失败

```bash
# 查看隧道日志
pm2 logs cloudflared-tunnel

# 重启隧道
pm2 restart cloudflared-tunnel

# 完全重置
停止合作伙伴管理
rmdir /s cloudflared  # 删除隧道配置
启动合作伙伴管理  # 重新配置
```

### 端口冲突

修改 `vite.config.js` 和技能配置文件中的端口号，然后重启。

### 无法访问系统页面

1. 检查后端是否运行：`pm2 list | findstr partnership`
2. 检查端口：`netstat -ano | findstr :5175`
3. 查看日志：`pm2 logs partnership-frontend`

---

## 开发调试

```bash
# 所有进程列表
pm2 list

# 查看所有日志
pm2 logs

# 只查看后端日志
pm2 logs partnership-backend

# 查看前端日志
pm2 logs partnership-frontend

# 进入后端目录
cd F:\Projects\Partnership\partnership-app\backend
# 直接运行（不使用 PM2）
node server.js
```

---

## 数据备份

```bash
# 备份数据库
copy backend\partnership.db backend\partnership-backup-2024-03-13.db

# 恢复数据库（停止服务后）
copy backup.db backend\partnership.db
```

---

## 卸载 Skill

```bash
# 停止系统
停止合作伙伴管理

# 删除 PM2 配置
pm2 delete all

# 删除技能目录（可选）
rmdir /s /q .openclaw\skills\partnership
```

---

**Skill Version:** 1.0.0  
**Last Updated:** 2026-03-13  
**Compatible with:** OpenClaw v0.7+

```
┌─────────────────────────────────────────────┐
│            Cloudflare Tunnel                │
│  (公网域名: xxx.trycloudflare.com)         │
└───────────────┬─────────────────────────────┘
                │ HTTPS/WSS
┌───────────────▼─────────────────────────────┐
│        你的电脑 (本机)                      │
│  ┌────────────┐   ┌────────────┐          │
│  │   Frontend │   │   Backend  │          │
│  │  :5175     │←→│  :3001     │          │
│  │  React +   │   │  Express   │          │
│  │  Socket.IO │   │  SQLite    │          │
│  └────────────┘   └────────────┘          │
│         ↓ 进程守护 (PM2)                    │
│  ┌─────────────────────────────────────┐  │
│  │      PM2 (自动崩溃恢复)             │  │
│  └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 配置

首次使用时，Skill 会自动：

1. **检查并安装依赖**
   - 后端: `backend/package.json`
   - 前端: `package.json`

2. **配置 Cloudflare Tunnel**
   - 需要登录 Cloudflare 账号（免费）
   - 自动创建隧道
   - 生成子域名

3. **设置 PM2 进程守护**
   - 全局安装 PM2（如未安装）
   - 配置启动脚本

---

## 数据文件

| 文件 | 说明 |
|------|------|
| `backend/partnership.db` | SQLite 数据库 |
| `.openclaw/skills/partnership/state.json` | Skill 状态（是否已配置） |
| `~/.partnership-pm2/` | PM2 进程配置 |

---

## 使用场景

1. **本地开发测试**
   - 命令：`启动合作伙伴管理`
   - 访问：`http://localhost:5175`

2. **局域网协作**
   - 同一 WiFi 下访问：`http://你的IP:5175`

3. **远程/线上协作**
   - 任意设备访问：`https://你的隧道域名`
   - 无需公网 IP，无需路由器配置

---

## 注意事项

⚠️ **电脑必须开机且联网**，否则无法访问。

⚠️ **首次启动需要人工确认 Cloudflare 登录**（一次配置后自动记住）。

⚠️ **数据存储在本地**，定期备份 `backend/partnership.db`。

---

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| Cloudflare Tunnel 连接失败 | 检查网络，重新登录 |
| PM2 未安装 | Skill 会自动安装 |
| 端口冲突 | 修改 `vite.config.js` 和 `backend/server.js` 的端口 |
| 数据库错误 | 删除 `backend/partnership.db` 重启 |

---

## 后续扩展

- [ ] 支持 HTTPS 自签名证书（不依赖 Cloudflare）
- [ ] 自动数据库备份
- [ ] 多环境配置（开发/生产）
- [ ] Docker 容器化部署

---

**Skill 版本：** 1.0.0
**最后更新：** 2026-03-13
