import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const SECRET = process.env.JWT_SECRET || 'family-recipe-secret-2025';

export function signToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '30d' });
}

export function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET);
    const user = db.prepare('SELECT id, username, nickname, avatar FROM users WHERE id = ?').get(payload.id);
    if (!user) return res.status(401).json({ error: '用户不存在' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}
