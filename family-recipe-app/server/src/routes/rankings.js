import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// 厨师排名（按其菜品的平均评分）
router.get('/chefs', (req, res) => {
  const { family_id } = req.query;
  let where = '';
  let params = [];
  if (family_id) {
    where = 'WHERE r.family_id = ?';
    params = [family_id];
  }

  const chefs = db.prepare(`
    SELECT u.id, u.nickname, u.avatar,
      COUNT(DISTINCT r.id) AS recipe_count,
      AVG(rt.score) AS avg_score,
      COUNT(rt.id) AS rating_count
    FROM users u
    JOIN recipes r ON r.author_id = u.id
    LEFT JOIN ratings rt ON rt.recipe_id = r.id AND rt.visible = 1
    ${where}
    GROUP BY u.id
    HAVING recipe_count > 0
    ORDER BY avg_score DESC NULLS LAST, recipe_count DESC
  `).all(...params);

  res.json({ chefs });
});

// 菜品排名
router.get('/recipes', (req, res) => {
  const { family_id } = req.query;
  let where = '';
  let params = [];
  if (family_id) {
    where = 'WHERE r.family_id = ?';
    params = [family_id];
  }

  const recipes = db.prepare(`
    SELECT r.id, r.title, r.category, r.total_cost, r.total_time,
      u.nickname AS author_name,
      AVG(rt.score) AS avg_score,
      COUNT(rt.id) AS rating_count,
      (SELECT image_path FROM recipe_images WHERE recipe_id = r.id ORDER BY sort LIMIT 1) AS cover
    FROM recipes r
    JOIN users u ON u.id = r.author_id
    LEFT JOIN ratings rt ON rt.recipe_id = r.id AND rt.visible = 1
    ${where}
    GROUP BY r.id
    ORDER BY avg_score DESC NULLS LAST, rating_count DESC
  `).all(...params);

  res.json({ recipes });
});

export default router;
