# 展会管理系统 (Exhibition Management System)

基于 **Node.js + Express + Vue 3 + Element Plus** 的全栈展会管理系统，支持展会管理、客户管理、活动管理和报名管理等功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 (Composition API) + Element Plus + Pinia + Vue Router + Axios |
| 后端 | Node.js + Express + Sequelize ORM |
| 数据库 | SQLite (开发) / MySQL (生产) |
| 认证 | JWT (JSON Web Token) |
| 构建 | Vite |

## 功能模块

### 🏢 展会管理
- 展会信息的增删改查
- 展会状态管理（筹备中 / 进行中 / 已结束 / 已取消）
- 推荐展会标识
- 关联活动与客户查看

### 👥 客户管理
- 客户信息 CRUD
- 客户等级管理（VIP / 重要 / 普通）
- 客户状态跟踪（活跃 / 非活跃 / 已流失）
- 支持多维度筛选和搜索

### 📅 活动管理
- 活动信息管理（论坛 / 工作坊 / 演讲 / 对接会）
- 活动发布与状态管理
- 报名人数限制与实时统计

### 📋 报名管理
- 报名记录查看
- 报名状态审核（待确认 / 已确认 / 已取消）
- 按活动筛选报名信息

### 📊 工作台
- 关键数据概览（展会、客户、活动、报名统计）
- 近期展会和活动预览
- 最新报名记录

## 快速开始

### 1. 安装依赖

```bash
# 安装根目录依赖（concurrently 用于同时启动前后端）
npm install

# 安装前后端依赖
npm run install:all
```

### 2. 初始化数据库

```bash
# 创建数据库表并插入测试数据
npm run seed
```

### 3. 启动项目

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server   # 后端 http://localhost:3000
npm run dev:client   # 前端 http://localhost:5173
```

### 4. 访问系统

打开浏览器访问：**http://localhost:5173**

默认登录账号：
- 用户名：`admin`
- 密码：`admin123`

## 项目结构

```
nodeExpress/
├── server/                     # 后端服务
│   ├── uploads/                # 上传文件存储目录
│   ├── src/
│   │   ├── app.js             # 服务入口
│   │   ├── seed.js            # 数据初始化脚本
│   │   ├── config/
│   │   │   └── database.js    # 数据库配置
│   │   ├── models/
│   │   │   └── index.js       # 数据模型定义
│   │   ├── controllers/       # 控制器
│   │   │   ├── authController.js
│   │   │   ├── exhibitionController.js
│   │   │   ├── customerController.js
│   │   │   ├── eventController.js
│   │   │   └── dashboardController.js
│   │   ├── routes/            # 路由定义
│   │   │   ├── index.js
│   │   │   ├── upload.js      # 图片上传路由
│   │   │   └── ...
│   │   └── middleware/
│   │       └── auth.js        # JWT 认证中间件
│   ├── .env                   # 环境变量
│   └── package.json
├── client/                     # 前端应用
│   ├── src/
│   │   ├── main.js            # 入口
│   │   ├── App.vue
│   │   ├── api/index.js       # API 封装
│   │   ├── router/index.js    # 路由配置
│   │   ├── stores/user.js     # 状态管理
│   │   ├── tools/             # 通用组件
│   │   │   └── ImageUpload.vue # 图片上传组件
│   │   ├── layouts/
│   │   │   └── MainLayout.vue # 主布局
│   │   └── views/             # 页面组件
│   │       ├── Login.vue
│   │       ├── Dashboard.vue
│   │       ├── exhibitions/
│   │       ├── customers/
│   │       └── events/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json                # 根配置
└── README.md
```

## API 接口

### 认证
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/register` | 用户注册 |
| GET | `/api/auth/me` | 获取当前用户 |
| PUT | `/api/auth/change-password` | 修改密码 |

### 展会
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/exhibitions` | 展会列表（分页） |
| GET | `/api/exhibitions/all` | 全部展会 |
| GET | `/api/exhibitions/:id` | 展会详情 |
| POST | `/api/exhibitions` | 创建展会 |
| PUT | `/api/exhibitions/:id` | 更新展会 |
| DELETE | `/api/exhibitions/:id` | 删除展会 |

### 客户
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/customers` | 客户列表（分页） |
| GET | `/api/customers/:id` | 客户详情 |
| POST | `/api/customers` | 创建客户 |
| PUT | `/api/customers/:id` | 更新客户 |
| DELETE | `/api/customers/:id` | 删除客户 |

### 活动
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/events` | 活动列表（分页） |
| GET | `/api/events/:id` | 活动详情 |
| POST | `/api/events` | 创建活动 |
| PUT | `/api/events/:id` | 更新活动 |
| DELETE | `/api/events/:id` | 删除活动 |
| POST | `/api/events/:id/register` | 活动报名（公开） |

### 报名
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/events/registrations` | 报名列表 |
| PUT | `/api/events/registrations/:regId` | 更新报名状态 |

### 文件上传
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/upload` | 上传图片（form-data，字段名 `file`） |
| DELETE | `/api/upload/:filename` | 删除已上传的文件 |

## 切换 MySQL 数据库

编辑 `server/.env` 文件：

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=exhibition_db
DB_USER=root
DB_PASSWORD=your_password
```

确保 MySQL 中已创建对应数据库，然后重新运行 `npm run seed` 初始化表结构。

## 前端页面报名接口

活动报名接口 `/api/events/:id/register` 为公开接口，无需登录即可调用，适用于前台的官网或活动报名系统调用。
