import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// 发起点餐
router.post('/', (req, res) => {
  const { family_id, recipe_id, meal_date, note } = req.body;
  if (!family_id || !recipe_id) return res.status(400).json({ error: '请选择家庭和菜品' });

  const member = db.prepare('SELECT id FROM family_members WHERE family_id = ? AND user_id = ?').get(family_id, req.user.id);
  if (!member) return res.status(403).json({ error: '你不属于该家庭' });

  const info = db.prepare('INSERT INTO orders (family_id, user_id, recipe_id, meal_date, note) VALUES (?, ?, ?, ?, ?)')
    .run(family_id, req.user.id, recipe_id, meal_date || null, note || '');
  res.json({ id: info.lastInsertRowid, success: true });
});

// 点餐列表
router.get('/', (req, res) => {
  const { family_id, status } = req.query;
  if (!family_id) return res.json({ orders: [] });

  let where = 'o.family_id = ?';
  let params = [family_id];
  if (status) {
    where += ' AND o.status = ?';
    params.push(status);
  }

  const orders = db.prepare(`
    SELECT o.*, r.title AS recipe_title, r.category,
      (SELECT image_path FROM recipe_images WHERE recipe_id = r.id ORDER BY sort LIMIT 1) AS cover,
      u.nickname AS orderer_name
    FROM orders o
    JOIN recipes r ON r.id = o.recipe_id
    JOIN users u ON u.id = o.user_id
    WHERE ${where}
    ORDER BY o.created_at DESC
  `).all(...params);

  res.json({ orders });
});

// 更新点餐状态
router.put('/:id', (req, res) => {
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'cooking', 'done', 'rejected'];
  if (!valid.includes(status)) return res.status(400).json({ error: '无效状态' });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: '点餐不存在' });

  // 只有家庭主厨或点餐人可以操作
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(order.family_id);
  const fm = db.prepare('SELECT role FROM family_members WHERE family_id = ? AND user_id = ?').get(order.family_id, req.user.id);
  if (!fm) return res.status(403).json({ error: '无权操作' });
  if (fm.role !== 'chef' && order.user_id !== req.user.id) return res.status(403).json({ error: '只有主厨或点餐人可以操作' });

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

export default router;
