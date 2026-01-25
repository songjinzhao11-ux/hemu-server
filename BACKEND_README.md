# HEMU 后端项目文档

## 📋 项目概述

HEMU 后端是一个基于 **Node.js + Express + SQLite** 构建的 RESTful API 服务，为前端应用提供数据管理和认证支持。支持完整的 CRUD 操作、文件上传、图片处理和身份验证。

### 核心特性
- 🚀 Express.js 高性能 Web 框架
- 💾 SQLite 轻量级数据库
- 🔐 JWT 身份验证和授权
- 📤 Multer 文件上传处理
- 🖼️ Sharp 图片处理和优化
- 🔒 bcryptjs 密码加密
- 🌐 CORS 跨域资源共享
- 📁 完整的文件存储系统
- ⚡ TypeScript 类型安全

---

## 📁 项目结构

```
hemu-server/
├── src/
│   ├── config/
│   │   └── database.ts              # SQLite 数据库连接配置
│   ├── middleware/
│   │   ├── auth.ts                  # JWT 认证中间件
│   │   └── upload.ts                # 文件上传处理中间件
│   ├── models/
│   │   ├── admin.ts                 # 管理员数据模型
│   │   ├── hero.ts                  # 英雄部分数据模型
│   │   ├── about.ts                 # 关于部分数据模型
│   │   ├── services.ts              # 服务数据模型
│   │   ├── process.ts               # 流程步骤数据模型
│   │   └── cases.ts                 # 案例研究数据模型
│   ├── controllers/
│   │   ├── hero.ts                  # 英雄部分控制器
│   │   └── about.ts                 # 关于部分控制器
│   ├── routes/
│   │   ├── index.ts                 # 路由聚合入口
│   │   ├── auth.ts                  # 认证路由
│   │   ├── hero.ts                  # 英雄部分路由
│   │   ├── about.ts                 # 关于部分路由
│   │   ├── services.ts              # 服务路由
│   │   ├── process.ts               # 流程路由
│   │   └── cases.ts                 # 案例路由
│   ├── utils/
│   │   └── initDb.ts                # 数据库初始化脚本
│   └── index.ts                     # 服务器入口 (39 行)
├── storage/
│   ├── database/
│   │   └── hemu.db                  # SQLite 数据库文件
│   └── uploads/                     # 用户上传文件存储
├── assets/
│   └── images/                      # 默认图片资源
├── dist/                            # 编译输出
├── package.json                     # 项目依赖配置
├── tsconfig.json                    # TypeScript 配置
├── Dockerfile                       # Docker 容器化配置
├── .dockerignore                    # Docker 构建忽略文件
├── .env                             # 环境变量模板
├── .gitignore                       # Git 忽略规则
└── README.md                        # 原项目说明
```

---

## 🚀 快速开始

### 环境要求
- **Node.js**: ≥ 18.0.0
- **npm**: ≥ 9.0.0
- **SQLite3**: 自动通过 npm 安装

### 安装依赖

```bash
cd hemu-server
npm install
```

### 初始化数据库

```bash
npm run init-db
```

此命令会在 `storage/database/` 目录创建 SQLite 数据库并初始化表结构。

### 本地开发

```bash
npm run dev
```

服务器将在 `http://localhost:3001` 启动，支持热重载。

### 构建生产版本

```bash
npm run build
```

编译 TypeScript 到 `dist/` 目录。

### 启动生产服务

```bash
npm start
```

---

## 📦 依赖管理

### 生产依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `express` | ^4.18.2 | Web 框架 |
| `cors` | ^2.8.5 | 跨域资源共享 |
| `dotenv` | ^16.3.1 | 环境变量管理 |
| `sqlite3` | ^5.1.6 | 数据库驱动 |
| `multer` | ^1.4.5-lts.1 | 文件上传处理 |
| `jsonwebtoken` | ^9.0.2 | JWT 认证 |
| `bcryptjs` | ^2.4.3 | 密码加密 |
| `sharp` | ^0.33.1 | 图片处理和优化 |

### 开发依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| `tsx` | ^4.7.0 | TypeScript 执行器 + 热重载 |
| `typescript` | ^5.3.3 | TypeScript 编译器 |
| `@types/express` | 最新 | Express 类型定义 |
| `@types/node` | 最新 | Node.js 类型定义 |
| `@types/multer` | 最新 | Multer 类型定义 |

---

## ⚙️ 环境配置

### `.env` 文件模板

```env
# 服务器配置
PORT=3001
NODE_ENV=development

# 数据库配置
DATABASE_PATH=./storage/database/hemu.db

# 文件上传配置
UPLOAD_PATH=./storage/uploads
MAX_FILE_SIZE=5242880  # 5MB

# JWT 配置
JWT_SECRET=hemu-secret-key-change-in-production-12345

# CORS 配置（可选）
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

### 环境变量说明

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3001 | 服务器端口 |
| `NODE_ENV` | development | 运行环境 |
| `DATABASE_PATH` | ./storage/database/hemu.db | 数据库文件路径 |
| `UPLOAD_PATH` | ./storage/uploads | 文件上传目录 |
| `MAX_FILE_SIZE` | 5242880 | 最大文件大小（字节） |
| `JWT_SECRET` | 必须设置 | JWT 签名密钥 |

---

## 🛠️ 核心模块说明

### 1. 数据库连接 (`src/config/database.ts`)

```typescript
import Database from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.dirname(process.env.DATABASE_PATH || './storage/database/hemu.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database.Database(
  process.env.DATABASE_PATH || './storage/database/hemu.db'
);
```

- 自动创建数据库目录
- 支持自定义数据库路径
- 连接池管理

### 2. 认证中间件 (`src/middleware/auth.ts`)

```typescript
// JWT 验证
router.use(authMiddleware);  // 保护路由

// 验证流程
// 1. 从请求头提取 token: Authorization: Bearer <token>
// 2. 验证 token 签名和有效期
// 3. 提取用户信息到 req.user
// 4. 无效 token 返回 401
```

**使用示例：**
```typescript
router.put('/hero', authMiddleware, updateHero);  // 只有认证用户可访问
```

### 3. 文件上传 (`src/middleware/upload.ts`)

```typescript
const upload = multer({
  dest: process.env.UPLOAD_PATH || './storage/uploads',
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880')
  },
  fileFilter: (req, file, cb) => {
    // 仅允许图片文件
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});
```

**使用示例：**
```typescript
router.post('/upload', upload.single('file'), handleUpload);
```

### 4. 数据模型 (`src/models/`)

每个数据模型提供 CRUD 操作接口：

#### 英雄部分 Model (hero.ts)

```typescript
interface Hero {
  id: number;
  background_image: string;
  title_cn: string;
  title_en: string;
  subtitle_cn: string;
  subtitle_en: string;
  cta_text_cn: string;
  cta_text_en: string;
  updated_at: string;
}

// 主要方法
getHero(): Promise<Hero>
updateHero(data: Partial<Hero>): Promise<void>
```

#### 关于部分 Model (about.ts)

```typescript
interface About {
  id: number;
  image: string;
  title_cn: string;
  subtitle_cn: string;
  description_cn: string;
  description2_cn: string;
  projects_count: number;
  partners_count: number;
  updated_at: string;
}

// 主要方法
getAbout(): Promise<About>
updateAbout(data: Partial<About>): Promise<void>
```

#### 服务 Model (services.ts)

```typescript
interface Service {
  id: number;
  title_cn: string;
  title_en: string;
  description: string;
  icon_name: string;
  order_index: number;
  updated_at: string;
}

// 主要方法
getServices(): Promise<Service[]>
createService(data: Omit<Service, 'id' | 'updated_at'>): Promise<Service>
updateService(id: number, data: Partial<Service>): Promise<void>
deleteService(id: number): Promise<void>
reorderServices(items: Array<{id: number, order: number}>): Promise<void>
```

#### 流程 Model (process.ts)

```typescript
interface ProcessStep {
  id: number;
  number: number;
  title: string;
  description: string;
  order_index: number;
  updated_at: string;
}

// 主要方法
getProcessSteps(): Promise<ProcessStep[]>
createProcessStep(data: Omit<ProcessStep, 'id' | 'updated_at'>): Promise<ProcessStep>
updateProcessStep(id: number, data: Partial<ProcessStep>): Promise<void>
deleteProcessStep(id: number): Promise<void>
reorderProcess(items: Array<{id: number, order: number}>): Promise<void>
```

#### 案例 Model (cases.ts)

```typescript
interface CaseStudy {
  id: number;
  title: string;
  category: string;
  image: string;
  location: string;
  year: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// 主要方法
getCases(): Promise<CaseStudy[]>
createCase(data: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy>
updateCase(id: number, data: Partial<CaseStudy>): Promise<void>
deleteCase(id: number): Promise<void>
reorderCases(items: Array<{id: number, order: number}>): Promise<void>
```

---

## 🗄️ 数据库架构

### 表结构

#### heroes 表
```sql
CREATE TABLE IF NOT EXISTS heroes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  background_image TEXT,
  title_cn TEXT,
  title_en TEXT,
  subtitle_cn TEXT,
  subtitle_en TEXT,
  cta_text_cn TEXT,
  cta_text_en TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### about 表
```sql
CREATE TABLE IF NOT EXISTS about (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  image TEXT,
  title_cn TEXT,
  subtitle_cn TEXT,
  description_cn TEXT,
  description2_cn TEXT,
  projects_count INTEGER DEFAULT 0,
  partners_count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### services 表
```sql
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_cn TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### process_steps 表
```sql
CREATE TABLE IF NOT EXISTS process_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER,
  title TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### case_studies 表
```sql
CREATE TABLE IF NOT EXISTS case_studies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT,
  image TEXT,
  location TEXT,
  year INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### admins 表
```sql
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 认证和授权

### JWT 流程

```
1. 用户登录 (POST /api/auth/login)
   ↓
2. 验证邮箱和密码
   ↓
3. 签发 JWT token
   ↓
4. 客户端保存 token
   ↓
5. 后续请求在 Authorization 头中附加 token
   ↓
6. 服务器验证 token 的有效性
```

### 登录示例

**请求：**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com"
  }
}
```

### 授权示例

**请求受保护资源：**
```bash
PUT /api/hero
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title_cn": "新标题"
}
```

---

## 📡 API 路由结构

### 认证路由 (`/api/auth`)
```
POST   /api/auth/login         - 管理员登录
POST   /api/auth/register      - 注册新管理员
```

### 英雄部分路由 (`/api/hero`)
```
GET    /api/hero               - 获取英雄部分
PUT    /api/hero               - 更新英雄部分（需认证）
```

### 关于部分路由 (`/api/about`)
```
GET    /api/about              - 获取关于部分
PUT    /api/about              - 更新关于部分（需认证）
```

### 服务路由 (`/api/services`)
```
GET    /api/services           - 获取所有服务
POST   /api/services           - 创建服务（需认证）
PUT    /api/services/:id       - 更新服务（需认证）
DELETE /api/services/:id       - 删除服务（需认证）
POST   /api/services/reorder   - 重新排序（需认证）
```

### 流程路由 (`/api/process`)
```
GET    /api/process            - 获取流程步骤
POST   /api/process            - 创建流程（需认证）
PUT    /api/process/:id        - 更新流程（需认证）
DELETE /api/process/:id        - 删除流程（需认证）
POST   /api/process/reorder    - 重新排序（需认证）
```

### 案例路由 (`/api/cases`)
```
GET    /api/cases              - 获取案例列表
POST   /api/cases              - 创建案例（需认证）
PUT    /api/cases/:id          - 更新案例（需认证）
DELETE /api/cases/:id          - 删除案例（需认证）
POST   /api/cases/reorder      - 重新排序（需认证）
```

### 健康检查
```
GET    /health                 - 服务器健康状态
```

---

## 📤 文件上传

### 配置

```typescript
const upload = multer({
  dest: './storage/uploads',
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  }
});
```

### 使用示例

**更新英雄部分（包含图片）：**
```bash
PUT /api/hero
Authorization: Bearer <token>
Content-Type: multipart/form-data

form data:
  title_cn: "新标题"
  subtitle_cn: "新副标题"
  file: <image file>
```

### 图片处理

上传后使用 Sharp 进行优化：

```typescript
const image = await sharp(filePath)
  .resize(1920, 1080, {
    fit: 'cover',
    position: 'center'
  })
  .webp({ quality: 80 })
  .toFile(optimizedPath);
```

---

## 🐳 Docker 部署

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY storage ./storage

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### 构建镜像

```bash
docker build -t hemu-server:latest .
```

### 运行容器

```bash
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e JWT_SECRET=your-secret-key \
  -v hemu-data:/app/storage \
  hemu-server:latest
```

---

## 🚀 部署建议

### 生产环境 `.env`

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=your-very-secure-secret-key-min-32-chars
DATABASE_PATH=/data/hemu.db
UPLOAD_PATH=/data/uploads
MAX_FILE_SIZE=5242880
CORS_ORIGIN=https://yourdomain.com
```

### 性能优化建议

1. **数据库**
   - 定期备份 SQLite 数据库
   - 添加索引优化查询性能
   - 考虑升级到 PostgreSQL 以支持并发

2. **文件存储**
   - 使用 CDN 加速静态资源
   - 实现图片压缩和缓存策略
   - 定期清理过期文件

3. **安全性**
   - 定期更新依赖包
   - 使用强密钥用于 JWT_SECRET
   - 启用 HTTPS
   - 实施请求速率限制

4. **监控**
   - 记录 API 调用日志
   - 监控数据库性能
   - 设置错误告警

---

## 🔍 日志和调试

### 启用调试日志

```bash
DEBUG=hemu:* npm run dev
```

### 常见日志位置

```
logs/
├── error.log       # 错误日志
├── access.log      # 访问日志
└── debug.log       # 调试日志
```

---

## 🧪 测试

### API 测试工具

推荐使用 Postman、Insomnia 或 curl：

```bash
# 获取服务列表
curl http://localhost:3001/api/services

# 登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# 创建服务
curl -X POST http://localhost:3001/api/services \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title_cn":"服务名","description":"描述"}'
```

---

## 🐛 常见问题

### Q: 数据库初始化失败
**A:** 确保 `storage/database/` 目录存在且有写入权限：
```bash
mkdir -p storage/database
npm run init-db
```

### Q: JWT token 过期
**A:** Token 过期需要重新登录。可以在 `auth.ts` 中调整过期时间（默认24小时）。

### Q: 文件上传失败
**A:** 检查：
1. `storage/uploads/` 目录是否存在
2. 权限是否正确
3. 文件大小是否超过 `MAX_FILE_SIZE`

### Q: CORS 错误
**A:** 在 `index.ts` 中配置 CORS：
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(','),
  credentials: true
}));
```

### Q: 如何重置数据库？
**A:** 删除数据库文件并重新初始化：
```bash
rm storage/database/hemu.db
npm run init-db
```

---

## 📚 相关文档

- [前端文档](../hemu/FRONTEND_README.md)
- [API 文档](./API_DOCUMENTATION.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)
- [项目架构](./ARCHITECTURE.md)

---

## 👥 开发规范

### 文件命名
- 模型文件：snake_case (e.g., `user_model.ts`)
- 路由文件：kebab-case (e.g., `api-routes.ts`)
- 工具函数：camelCase (e.g., `validateEmail.ts`)

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 Express 中间件模式
- 使用 async/await 处理异步操作
- 合理的错误处理和验证

### 提交规范
- feat: 新功能
- fix: bug 修复
- docs: 文档更新
- refactor: 代码重构
- perf: 性能优化

---

## 📝 更新日志

### v1.0.0
- 初始版本发布
- 完整的 RESTful API 实现
- SQLite 数据库集成
- JWT 认证和授权
- 文件上传和处理

---

## 📞 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。

---

**最后更新：** 2025年1月24日
