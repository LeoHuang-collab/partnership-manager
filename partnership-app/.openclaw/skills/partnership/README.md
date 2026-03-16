# Partnership Skill

合作伙伴管理系统一键部署和管理 Skill。

## 安装

这个 Skill 位于项目目录 `.openclaw/skills/partnership/`，OpenClaw 会自动发现并加载。

## 使用方法

### 启动系统

```
启动合作伙伴管理
```

系统会：
1. 检查 Node.js 环境
2. 安装前端+后端依赖
3. 安装 PM2 进程守护
4. 启动后端 (3001) 和前端 (5175)
5. 配置并启动 Cloudflare Tunnel（首次需人工登录）
6. 返回公网访问地址

### 停止系统

```
停止合作伙伴管理
```

### 查看状态

```
合作伙伴系统状态
```

### 重启系统

```
重启合作伙伴管理
```

---

## 访问地址

启动成功后，你将看到：

```
🏠 本机访问: http://localhost:5175
🌐 公网访问: https://partnership-xxx.trycloudflare.com
```

**团队成员访问：** 使用公网地址即可，无需安装任何软件。

---

## 技术栈

- **前端:** React 19 + Vite + Tailwind
- **后端:** Node.js + Express + Socket.IO + better-sqlite3
- **进程管理:** PM2
- **内网穿透:** Cloudflare Tunnel (免费)
- **实时同步:** WebSocket

---

## 注意事项

⚠️ 电脑必须开机并联网
⚠️ 首次启动需要登录 Cloudflare（免费账号）
⚠️ 数据存储在 `backend/partnership.db`

---

## 手动配置 Cloudflare Tunnel（如果自动失败）

如果自动登录失败，请按以下步骤手动配置：

### 1. 手动登录

```bash
cd F:\Projects\Partnership\partnership-app\cloudflared
cloudflared.exe tunnel login
```

浏览器会打开，扫码登录 Cloudflare（免费注册 https://dash.cloudflare.com）。

成功后，会在当前目录生成 `credentials.json`。

### 2. 创建隧道

在浏览器访问：https://one.dash.cloudflare.com/

点击 "Create a tunnel" → 命名: `partnership-app` → 选择 "Automatic" 或 "Manual"

如果选 Manual，配置：
- **Hostname**: partnership-anything.trycloudflare.com (或自定义)
- **Service type**: HTTP
- **URL**: localhost:5175

然后点击 "Save tunnel" → "Continue"

### 3. 下载配置

在隧道页面，点击 "Configure" → 选择 "Windows" → 复制生成的 YAML 配置

创建文件 `cloudflared/config.yml`，粘贴内容，确保最后一行是：
```
  - service: http_status:404
```

完整示例：
```yaml
tunnel: xxxxxxxxxxxxxxxx
credentials-file: credentials.json

ingress:
  - hostname: partnership-abc123.trycloudflare.com
    service: http://localhost:5175
  - service: http_status:404
```

### 4. 重新启动

```bash
启动合作伙伴管理
```

---

## 只启动本地服务（无需内网穿透）

如果你暂时不需要外网访问，可以：

1. 编辑 `vite.config.js`，设置 `host: '0.0.0.0'`（已配置）
2. 启动后，使用局域网 IP 访问：`http://你的IP:5175`
3. 或者在命令行直接启动：`cd backend && node server.js` 和 `npm run dev`

---

## 停止和重启

```bash
# 停止
停止合作伙伴管理

# 重启
重启合作伙伴管理

# 查看状态
合作伙伴系统状态

# 查看所有进程
pm2 list

# 查看日志
pm2 logs        # 所有日志
pm2 logs partnership-backend  # 后端日志
pm2 logs partnership-frontend # 前端日志
pm2 logs cloudflared-tunnel    # 隧道日志
```

---

## 卸载

```bash
# 停止服务
停止合作伙伴管理

# 删除 PM2 配置
pm2 delete all

# 删除数据库（可选）
del backend\partnership.db

# 删除隧道配置（可选）
rmdir /s cloudflared
```

---

## 故障排查

### Cloudflare Tunnel 失败

```bash
# 手动清理 PM2
pm2 delete all
# 删除隧道配置
rm -rf cloudflared/
# 重启
启动合作伙伴管理
```

### 端口冲突

修改 `vite.config.js` 的 `port` 和 `F:\Projects\Partnership\partnership-app\.openclaw\skills\partnership\index.js` 中的 `CONFIG.FRONTEND_PORT` 和 `BACKEND_PORT`。

---

## 开发调试

```bash
# 查看后端日志
pm2 logs partnership-backend

# 查看前端日志
pm2 logs partnership-frontend

# 查看隧道日志
pm2 logs cloudflared-tunnel
```

---

**版本:** 1.0.0
**作者:** 小强 🪳
