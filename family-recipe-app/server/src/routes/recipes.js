import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(auth);

// 列表 / 搜索
router.get('/', (req, res) => {
  const { keyword, category, family_id, scope } = req.query;
  let where = ['1=1'];
  let params = [];

  if (family_id) {
    where.push('r.family_id = ?');
    params.push(family_id);
  } else {
    // 默认只看我的家庭
    const myFamilies = db.prepare('SELECT family_id FROM family_members WHERE user_id = ?').all(req.user.id).map(m => m.family_id);
    if (myFamilies.length === 0) return res.json({ recipes: [] });
    where.push(`r.family_id IN (${myFamilies.map(() => '?').join(',')})`);
    params.push(...myFamilies);
  }

  if (keyword) {
    where.push('(r.title LIKE ? OR EXISTS (SELECT 1 FROM ingredients i WHERE i.recipe_id = r.id AND i.name LIKE ?))');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }
  if (category && category !== '全部') {
    where.push('r.category = ?');
    params.push(category);
  }

  const recipes = db.prepare(`
    SELECT r.*, u.nickname AS author_name,
      (SELECT AVG(score) FROM ratings WHERE recipe_id = r.id AND visible = 1) AS avg_score,
      (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id AND visible = 1) AS rating_count,
      (SELECT image_path FROM recipe_images WHERE recipe_id = r.id ORDER BY sort LIMIT 1) AS cover
    FROM recipes r
    JOIN users u ON u.id = r.author_id
    WHERE ${where.join(' AND ')}
    ORDER BY r.created_at DESC
  `).all(...params);

  res.json({ recipes });
});

// 详情
router.get('/:id', (req, res) => {
  const recipe = db.prepare(`
    SELECT r.*, u.nickname AS author_name, u.avatar AS author_avatar,
      (SELECT AVG(score) FROM ratings WHERE recipe_id = r.id AND visible = 1) AS avg_score,
      (SELECT COUNT(*) FROM ratings WHERE recipe_id = r.id AND visible = 1) AS rating_count
    FROM recipes r
    JOIN users u ON u.id = r.author_id
    WHERE r.id = ?
  `).get(req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });

  const images = db.prepare('SELECT * FROM recipe_images WHERE recipe_id = ? ORDER BY sort').all(req.params.id);
  const ingredients = db.prepare('SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort').all(req.params.id);
  const steps = db.prepare('SELECT * FROM recipe_steps WHERE recipe_id = ? ORDER BY sort').all(req.params.id);

  res.json({ recipe, images, ingredients, steps });
});

// 创建菜谱 - 支持多文件上传
router.post('/', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'ingredient_image', maxCount: 1 },
  { name: 'seasoning_image', maxCount: 1 },
  { name: 'step_images', maxCount: 20 }
]), (req, res) => {
  const { family_id, title, category, description, ingredients, steps } = req.body;
  if (!family_id || !title) return res.status(400).json({ error: '家庭和菜名不能为空' });

  const member = db.prepare('SELECT id FROM family_members WHERE family_id = ? AND user_id = ?').get(family_id, req.user.id);
  if (!member) return res.status(403).json({ error: '你不属于该家庭' });

  let parsedIngredients = [];
  try { parsedIngredients = JSON.parse(ingredients || '[]'); } catch {}
  let parsedSteps = [];
  try { parsedSteps = JSON.parse(steps || '[]'); } catch {}

  // 计算总成本和总耗时
  const totalCost = parsedIngredients.reduce((s, i) => s + (parseFloat(i.cost) || 0), 0);
  const totalTime = parsedSteps.reduce((s, st) => s + (parseInt(st.duration) || 0), 0);

  const videoPath = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

  const info = db.prepare(`
    INSERT INTO recipes (family_id, author_id, title, category, description, total_cost, total_time, video_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(family_id, req.user.id, title, category || '其他', description || '', totalCost, totalTime, videoPath);
  const rid = info.lastInsertRowid;

  // 成品照片
  if (req.files['images']) {
    req.files['images'].forEach((f, i) => {
      db.prepare('INSERT INTO recipe_images (recipe_id, image_path, sort) VALUES (?, ?, ?)').run(rid, `/uploads/${f.filename}`, i);
    });
  }

  // 食材调料
  parsedIngredients.forEach((ing, i) => {
    let groupImg = null;
    if (ing.type === 'ingredient' && req.files['ingredient_image']) {
      groupImg = `/uploads/${req.files['ingredient_image'][0].filename}`;
    } else if (ing.type === 'seasoning' && req.files['seasoning_image']) {
      groupImg = `/uploads/${req.files['seasoning_image'][0].filename}`;
    }
    db.prepare('INSERT INTO ingredients (recipe_id, type, name, amount, unit, price, cost, group_image_path, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(rid, ing.type, ing.name, ing.amount || '', ing.unit || '', parseFloat(ing.price) || 0, parseFloat(ing.cost) || 0, groupImg, i);
  });

  // 步骤
  parsedSteps.forEach((st, i) => {
    let stepImg = null;
    if (req.files['step_images'] && req.files['step_images'][i]) {
      stepImg = `/uploads/${req.files['step_images'][i].filename}`;
    }
    db.prepare('INSERT INTO recipe_steps (recipe_id, sort, description, image_path, duration) VALUES (?, ?, ?, ?, ?)')
      .run(rid, i, st.description, stepImg, parseInt(st.duration) || 0);
  });

  res.json({ id: rid, success: true });
});

// 更新菜谱（简化：删除重建子表）
router.put('/:id', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'ingredient_image', maxCount: 1 },
  { name: 'seasoning_image', maxCount: 1 },
  { name: 'step_images', maxCount: 20 }
]), (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  if (recipe.author_id !== req.user.id) return res.status(403).json({ error: '只有作者可以编辑' });

  const { title, category, description, ingredients, steps, keep_old_images } = req.body;
  let parsedIngredients = [];
  try { parsedIngredients = JSON.parse(ingredients || '[]'); } catch {}
  let parsedSteps = [];
  try { parsedSteps = JSON.parse(steps || '[]'); } catch {}

  const totalCost = parsedIngredients.reduce((s, i) => s + (parseFloat(i.cost) || 0), 0);
  const totalTime = parsedSteps.reduce((s, st) => s + (parseInt(st.duration) || 0), 0);

  const videoPath = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : recipe.video_path;

  db.prepare('UPDATE recipes SET title=?, category=?, description=?, total_cost=?, total_time=?, video_path=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(title || recipe.title, category || recipe.category, description ?? recipe.description, totalCost, totalTime, videoPath, req.params.id);

  // 清理旧子表
  db.prepare('DELETE FROM recipe_images WHERE recipe_id = ?').run(req.params.id);
  db.prepare('DELETE FROM ingredients WHERE recipe_id = ?').run(req.params.id);
  db.prepare('DELETE FROM recipe_steps WHERE recipe_id = ?').run(req.params.id);

  if (req.files['images']) {
    req.files['images'].forEach((f, i) => {
      db.prepare('INSERT INTO recipe_images (recipe_id, image_path, sort) VALUES (?, ?, ?)').run(req.params.id, `/uploads/${f.filename}`, i);
    });
  }

  parsedIngredients.forEach((ing, i) => {
    let groupImg = ing.group_image_path || null;
    if (ing.type === 'ingredient' && req.files['ingredient_image']) groupImg = `/uploads/${req.files['ingredient_image'][0].filename}`;
    if (ing.type === 'seasoning' && req.files['seasoning_image']) groupImg = `/uploads/${req.files['seasoning_image'][0].filename}`;
    db.prepare('INSERT INTO ingredients (recipe_id, type, name, amount, unit, price, cost, group_image_path, sort) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(req.params.id, ing.type, ing.name, ing.amount || '', ing.unit || '', parseFloat(ing.price) || 0, parseFloat(ing.cost) || 0, groupImg, i);
  });

  parsedSteps.forEach((st, i) => {
    let stepImg = st.image_path || null;
    if (req.files['step_images'] && req.files['step_images'][i]) stepImg = `/uploads/${req.files['step_images'][i].filename}`;
    db.prepare('INSERT INTO recipe_steps (recipe_id, sort, description, image_path, duration) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, i, st.description, stepImg, parseInt(st.duration) || 0);
  });

  res.json({ success: true });
});

// 删除菜谱
router.delete('/:id', (req, res) => {
  const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  if (recipe.author_id !== req.user.id) return res.status(403).json({ error: '只有作者可以删除' });
  db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
