import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import familyRoutes from './routes/families.js';
import recipeRoutes from './routes/recipes.js';
import orderRoutes from './routes/orders.js';
import ratingRoutes from './routes/ratings.js';
import rankingRoutes from './routes/rankings.js';
import './db/index.js'; // 初始化数据库

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件：上传的图片视频
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/rankings', rankingRoutes);

// 健康检查
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// 托管前端 H5 构建产物（如果存在）
const h5Dir = path.join(__dirname, '..', 'web-dist');
if (fs.existsSync(h5Dir)) {
  app.use(express.static(h5Dir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(h5Dir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`家庭菜谱服务已启动: http://localhost:${PORT}`);
  if (fs.existsSync(h5Dir)) {
    console.log(`前端 H5 已挂载，直接访问 http://localhost:${PORT}`);
  } else {
    console.log(`提示: 未发现 web-dist 目录，仅 API 可用`);
  }
});
