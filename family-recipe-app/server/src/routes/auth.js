import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { signToken, auth } from '../middleware/auth.js';

const router = Router();

// 注册
router.post('/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password || !nickname) {
    return res.status(400).json({ error: '用户名、密码、昵称不能为空' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.status(400).json({ error: '用户名已存在' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash, nickname) VALUES (?, ?, ?)').run(username, hash, nickname);
  const user = db.prepare('SELECT id, username, nickname, avatar FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.json({ token: signToken(user), user });
});

// 登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' });

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!row) return res.status(400).json({ error: '用户名或密码错误' });

  if (!bcrypt.compareSync(password, row.password_hash)) {
    return res.status(400).json({ error: '用户名或密码错误' });
  }
  const user = { id: row.id, username: row.username, nickname: row.nickname, avatar: row.avatar };
  res.json({ token: signToken(user), user });
});

// 获取当前用户
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
