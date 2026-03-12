# 房地产股权合作项目管理系统 - MVP

## 技术架构
- **前端**: React + Vite + Tailwind CSS
- **移动端适配**: 响应式设计，微信内嵌友好
- **数据存储**: LocalStorage（可升级为后端API）

## 数据模型

### 1. 项目 (Project)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 项目名称 |
| location | string | 项目位置 |
| partnerId | string | 合作方ID |
| equityRatio | number | 我方股权比例(%) |
| totalInvestment | number | 总投资额(万元) |
| status | string | 状态：筹备中/建设中/已售罄/已结算 |
| startDate | string | 开工日期 |
| endDate | string | 计划结束日期 |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

### 2. 合作方 (Partner)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 合作方名称 |
| type | string | 类型：机构/个人 |
| contactPerson | string | 联系人 |
| contactPhone | string | 联系电话 |
| email | string | 邮箱 |
| createdAt | string | 创建时间 |

### 3. 进展汇报 (ProgressReport)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| projectId | string | 项目ID |
| reportDate | string | 汇报日期 |
| period | string | 周期：周报/月报 |
| progress | string | 项目进展 |
| difficulties | string | 难点问题 |
| matters | string | 需要协调事项 |
| overallStatus | string | 总体状态：正常/关注/预警 |
| createdAt | string | 创建时间 |

### 4. 收益记录 (Revenue)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| projectId | string | 项目ID |
| type | string | 类型：利润分配/管理费 |
| amount | number | 金额(万元) |
| recordDate | string | 记录日期 |
| description | string | 说明 |
| status | string | 状态：待确认/已确认/已支付 |
| createdAt | string | 创建时间 |

## 功能模块

### 1. 数据看板 (Dashboard)
- 项目总数、进行中项目、已完成项目
- 收益汇总（待确认/已确认/已支付）
- 近期需要汇报的项目提醒
- 关键指标卡片

### 2. 项目管理
- 项目列表（支持搜索、筛选）
- 项目详情
- 新增/编辑/删除项目

### 3. 合作方管理
- 合作方列表
- 新增/编辑/删除合作方

### 4. 进展汇报
- 汇报列表（按项目筛选）
- 新增汇报（收集进展、难点、协调事项）
- 一键生成汇报（格式化输出）
- 汇报历史记录

### 5. 收益管理
- 收益记录列表
- 新增收益记录（利润分配/管理费）
- 收益状态跟踪

## 页面结构

```
/                   - 数据看板
/projects           - 项目管理
/projects/:id       - 项目详情
/partners           - 合作方管理
/reports            - 进展汇报
/reports/new        - 新增汇报
/revenues           - 收益管理
/revenues/new       - 新增收益
```

## MVP发布优先级

1. **P0 - 核心功能**
   - 项目管理CRUD
   - 合作方管理CRUD
   - 进展汇报CRUD + 汇报生成
   
2. **P1 - 重要功能**
   - 收益记录CRUD
   - 数据看板
   
3. **P2 - 增强功能**
   - 搜索筛选
   - 数据导出
   - 提醒通知
