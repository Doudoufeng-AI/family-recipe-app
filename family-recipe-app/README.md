# 家庭电子菜谱 App

一个专为家庭设计的电子菜谱 App。支持菜谱上传（成品照片/食材调料照片/做法视频/用量成本/耗时/做法介绍）、多家庭单位、成员点餐、评分评价、厨师与菜品排名。

## 一、项目结构

```
family-recipe-app/
├── server/          # 后端：Express + SQLite（一体化服务）
│   ├── src/
│   │   ├── app.js               # 服务入口
│   │   ├── db/index.js          # SQLite 初始化
│   │   ├── middleware/          # JWT 鉴权、文件上传
│   │   └── routes/              # 用户/家庭/菜谱/点餐/评价/排名 API
│   ├── uploads/                 # 上传的图片/视频
│   ├── web-dist/                # 前端 H5 构建产物
│   └── package.json
│
├── web/             # 前端：Vue3 + Vite（移动端 H5 页面）
│   ├── src/pages/   # 登录注册/首页/搜索/菜谱/家庭/点餐/排名/我的
│   └── package.json
│
└── README.md
```

## 二、本地启动（5 分钟跑起来）

### 前置要求
- Node.js 18+（本机已安装 v22）
- 同一局域网内的手机/微信可直接访问

### 1. 安装后端依赖
```bash
cd server
npm install
```

### 2. 启动后端服务
```bash
npm run dev
# 服务启动在 http://localhost:3000
```

### 3. 安装并启动前端开发（可选，用于修改页面）
```bash
cd ../web
npm install
npm run dev
# 默认打开 http://localhost:5173
```

### 4. 生产模式（推荐本地体验）
如果已经编译好了前端（`web-dist` 已存在），直接访问：
```bash
cd server
npm run dev
```
然后打开浏览器：http://localhost:3000

## 三、H5 重新编译

如果修改了前端代码，需要重新编译：
```bash
cd web
npm install          # 首次
npm run build        # 生成 dist 目录
cp -r dist ../server/web-dist   # 覆盖后端静态资源
```

然后重启后端即可。

## 四、手机/家人如何访问

### 同一 WiFi 下（最简单）
1. 查看本机 IP，例如 `192.168.1.100`
2. 家人手机浏览器打开：`http://192.168.1.100:3000`
3. 或把链接发到微信，微信内直接打开

### 部署到公网（长期可用）
见下方 Render 部署说明。

## 五、核心功能

| 功能 | 说明 |
|------|------|
| 用户注册/登录 | 用户名+密码，JWT 30天有效 |
| 家庭单位 | 创建家庭自动生成邀请码，成员输入邀请码加入 |
| 主厨 | 家庭创建者默认是主厨，可转让给其他成员 |
| 上传菜谱 | 菜名、分类、成品照片（最多9张）、食材合照、调料合照、做法视频、食材/调料明细（用量+单价+成本）、做法步骤（图文+耗时） |
| 成本/耗时 | 自动汇总食材+调料成本，自动汇总步骤耗时 |
| 搜索 | 按菜名或食材关键词搜索，按分类筛选 |
| 点餐 | 主厨设置后，家庭成员可点菜，主厨确认/拒绝/制作/完成 |
| 评分评价 | 1-5星+文字，主厨可隐藏/展示评价 |
| 排名 | 厨师排名（按上传菜品平均分）、菜品排名 |

## 六、API 速查

所有接口前缀 `/api`。

- `POST /api/auth/register` 注册
- `POST /api/auth/login` 登录
- `GET  /api/auth/me` 当前用户
- `POST /api/families` 创建家庭
- `POST /api/families/join` 加入家庭
- `GET  /api/families/mine` 我的家庭
- `GET  /api/families/:id/members` 成员列表
- `PUT  /api/families/:id` 设置主厨
- `GET  /api/recipes` 菜谱列表（参数：keyword/category/family_id）
- `GET  /api/recipes/:id` 菜谱详情
- `POST /api/recipes` 创建菜谱（multipart/form-data）
- `PUT  /api/recipes/:id` 更新菜谱
- `DELETE /api/recipes/:id` 删除菜谱
- `GET  /api/orders` 点餐列表
- `POST /api/orders` 发起点餐
- `PUT  /api/orders/:id` 更新状态
- `GET  /api/ratings?recipe_id=` 评价列表
- `POST /api/ratings` 提交评价
- `PUT  /api/ratings/:id` 主厨切换可见性
- `GET  /api/rankings/chefs` 厨师排名
- `GET  /api/rankings/recipes` 菜品排名

## 七、部署到 Render（免费 + 公网可访问）

### 方案 A：最快部署（推荐）

1. 把本代码推送到 GitHub 仓库
2. 打开 [Render](https://render.com) 注册账号（可用 GitHub 直接登录）
3. 新建 **Web Service**
4. 选择你的 GitHub 仓库
5. 配置：
   - Name: `family-recipe-app`
   - Environment: `Node`
   - Build Command: `cd server && npm install && cd ../web && npm install && npm run build && cp -r dist ../server/web-dist`
   - Start Command: `cd server && npm start`
   - Plan: Free
6. 点击 Create Web Service，等待部署完成
7. 部署完成后 Render 会提供一个类似 `https://family-recipe-app.onrender.com` 的链接
8. 家人直接打开该链接即可使用

> ⚠️ Render 免费套餐 15 分钟无访问会休眠，首次打开可能需要 30 秒唤醒。家庭日常使用可在饭点前后访问，影响不大。

### 方案 B：前后端分离（可选）
- 后端部署到 Render
- 前端 H5 部署到 Vercel
- 修改 `web/src/utils/request.js` 中的 `BASE` 为 Render 后端地址
- 重新编译后部署到 Vercel

## 八、数据说明

- 数据库文件：`server/data/recipe.db`（SQLite 单文件）
- 上传文件：`server/uploads/` 目录
- 建议定期备份这两个目录，或接入云存储（OSS/S3）
- 视频建议压缩到 50MB 以内，免费平台磁盘空间有限

## 九、后续升级建议

1. **微信小程序版**：代码结构已按 uni-app 风格设计，可迁移到 uni-app 框架，重新编译为微信小程序。但正式上线需企业认证。
2. **云存储**：图片视频量大后，迁移到阿里云 OSS / 腾讯云 COS / AWS S3。
3. **数据库迁移**：SQLite 数据量变大后，迁移到 PostgreSQL / MySQL。
4. **消息通知**：接入微信服务号或短信通知，提醒主厨有点餐/新评价。

## 十、常见问题

**Q1：为什么顶部显示"选择家庭"？**  
A：首次注册后需要创建或加入一个家庭，去"家庭"页操作即可。

**Q2：上传视频失败？**  
A：检查视频大小是否超过 50MB，或网络是否稳定。免费平台上传大文件可能超时。

**Q3：如何邀请家人？**  
A：进入"家庭"→家庭详情，把"邀请码"发给家人，对方在"家庭"页输入邀请码即可加入。

## 十一、技术栈

- 后端：Node.js + Express + better-sqlite3 + JWT + multer
- 前端：Vue 3 + Vue Router + Pinia + Vite
- 部署：Render（免费）/ Railway（免费）/ 自建服务器

---

祝你和家人用得开心！🍳
