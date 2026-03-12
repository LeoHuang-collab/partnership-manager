# 股权合作项目管理系统 - Web版架构设计

## 技术栈

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MySQL 8.0
- **ORM**: Prisma
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs

### 前端
- 现有React系统不变
- 新增登录页面
- API调用改为后端接口

## 数据库设计

### 用户表 (users)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password | VARCHAR(255) | 加密后的密码 |
| name | VARCHAR(100) | 真实姓名 |
| role | ENUM | 角色：admin/user |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

### 项目表 (projects)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(200) | 项目名称 |
| location | VARCHAR(200) | 项目位置 |
| partnerId | UUID | 合作方ID |
| equityRatio | DECIMAL | 我方股权比例 |
| totalInvestment | DECIMAL | 总投资额(万元) |
| status | ENUM | 状态 |
| startDate | DATE | 开工日期 |
| endDate | DATE | 计划结束日期 |
| createdBy | UUID | 创建人ID |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

### 合作方表 (partners)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| name | VARCHAR(200) | 合作方名称 |
| type | ENUM | 类型：机构/个人 |
| contacts | JSON | 对接人列表 |
| createdBy | UUID | 创建人ID |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

### 汇报表 (reports)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| projectId | UUID | 项目ID |
| reportDate | DATE | 汇报日期 |
| period | ENUM | 周报/月报/季报 |
| progress | TEXT | 项目进展 |
| difficulties | TEXT | 难点问题 |
| matters | TEXT | 需要协调事项 |
| overallStatus | ENUM | 总体状态 |
| createdBy | UUID | 创建人ID |
| createdAt | DATETIME | 创建时间 |

### 待办事项表 (todos)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| projectId | UUID | 项目ID |
| task | VARCHAR(500) | 事项 |
| blocker | TEXT | 卡点/难点 |
| responsiblePerson | VARCHAR(100) | 责任人 |
| planCompleteDate | DATE | 计划完成时间 |
| actualCompleteDate | DATE | 实际完成时间 |
| priority | ENUM | 优先级 |
| status | ENUM | 状态 |
| createdBy | UUID | 创建人ID |
| createdAt | DATETIME | 创建时间 |
| updatedAt | DATETIME | 更新时间 |

## API设计

### 认证
- POST /api/auth/login - 登录
- POST /api/auth/register - 注册（仅管理员）
- GET /api/auth/me - 获取当前用户

### 项目
- GET /api/projects - 获取项目列表
- GET /api/projects/:id - 获取项目详情
- POST /api/projects - 创建项目
- PUT /api/projects/:id - 更新项目
- DELETE /api/projects/:id - 删除项目

### 合作方
- GET /api/partners - 获取合作方列表
- GET /api/partners/:id - 获取合作方详情
- POST /api/partners - 创建合作方
- PUT /api/partners/:id - 更新合作方
- DELETE /api/partners/:id - 删除合作方

### 汇报
- GET /api/reports - 获取汇报列表
- GET /api/reports/:id - 获取汇报详情
- POST /api/reports - 创建汇报
- DELETE /api/reports/:id - 删除汇报

### 待办事项
- GET /api/todos - 获取待办列表
- POST /api/todos - 创建待办
- PUT /api/todos/:id - 更新待办
- DELETE /api/todos/:id - 删除待办

## 部署架构

```
用户浏览器
    │
    ▼
Nginx (反向代理 + 静态文件)
    │
    ├──▶ Node.js API (端口3000)
    │
    └──▶ MySQL 数据库
```

## 安全考虑

1. JWT Token有效期24小时
2. 密码bcrypt加密
3. CORS配置限制域名
4. 请求频率限制（可选）
5. SQL注入防护（Prisma ORM）
