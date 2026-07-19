import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// 提交评价
router.post('/', (req, res) => {
  const { recipe_id, score, comment } = req.body;
  if (!recipe_id || !score) return res.status(400).json({ error: '请选择菜品并评分' });
  if (score < 1 || score > 5) return res.status(400).json({ error: '评分1-5分' });

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipe_id);
  if (!recipe) return res.status(404).json({ error: '菜品不存在' });

  // 同一菜品同一用户只能评一次（覆盖更新）
  const existing = db.prepare('SELECT id FROM ratings WHERE recipe_id = ? AND user_id = ?').get(recipe_id, req.user.id);
  if (existing) {
    db.prepare('UPDATE ratings SET score = ?, comment = ?, visible = 1 WHERE id = ?').run(score, comment || '', existing.id);
  } else {
    db.prepare('INSERT INTO ratings (recipe_id, user_id, score, comment) VALUES (?, ?, ?, ?)').run(recipe_id, req.user.id, score, comment || '');
  }
  res.json({ success: true });
});

// 菜品评价列表
router.get('/', (req, res) => {
  const { recipe_id } = req.query;
  if (!recipe_id) return res.json({ ratings: [] });

  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipe_id);
  if (!recipe) return res.status(404).json({ error: '菜品不存在' });

  // 主厨看全部，非主厨只看 visible=1
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(recipe.family_id);
  const fm = db.prepare('SELECT role FROM family_members WHERE family_id = ? AND user_id = ?').get(recipe.family_id, req.user.id);
  const isChef = fm && fm.role === 'chef';

  let where = 'recipe_id = ?';
  if (!isChef) where += ' AND visible = 1';

  const ratings = db.prepare(`
    SELECT r.*, u.nickname, u.avatar
    FROM ratings r
    JOIN users u ON u.id = r.user_id
    WHERE ${where}
    ORDER BY r.created_at DESC
  `).all(recipe_id);

  res.json({ ratings, is_chef: isChef });
});

// 主厨切换评价可见性
router.put('/:id', (req, res) => {
  const rating = db.prepare(`
    SELECT r.*, rec.family_id FROM ratings r
    JOIN recipes rec ON rec.id = r.recipe_id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!rating) return res.status(404).json({ error: '评价不存在' });

  const fm = db.prepare('SELECT role FROM family_members WHERE family_id = ? AND user_id = ?').get(rating.family_id, req.user.id);
  if (!fm || fm.role !== 'chef') return res.status(403).json({ error: '只有主厨可以管理评价' });

  db.prepare('UPDATE ratings SET visible = ? WHERE id = ?').run(req.body.visible ? 1 : 0, req.params.id);
  res.json({ success: true });
});

export default router;
