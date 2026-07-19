import { Router } from 'express';
import db from '../db/index.js';
import { auth } from '../middleware/auth.js';

const router = Router();
router.use(auth);

// 生成邀请码
function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// 创建家庭
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: '家庭名称不能为空' });

  let code, tries = 0;
  do {
    code = genCode();
    tries++;
  } while (db.prepare('SELECT id FROM families WHERE invite_code = ?').get(code) && tries < 10);

  const info = db.prepare('INSERT INTO families (name, invite_code, creator_id) VALUES (?, ?, ?)').run(name, code, req.user.id);
  const fid = info.lastInsertRowid;
  db.prepare('INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)').run(fid, req.user.id, 'chef');
  db.prepare('UPDATE families SET head_chef_id = ? WHERE id = ?').run(req.user.id, fid);

  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(fid);
  res.json({ family });
});

// 加入家庭
router.post('/join', (req, res) => {
  const { invite_code } = req.body;
  if (!invite_code) return res.status(400).json({ error: '请输入邀请码' });

  const family = db.prepare('SELECT * FROM families WHERE invite_code = ?').get(invite_code.toUpperCase());
  if (!family) return res.status(404).json({ error: '邀请码无效' });

  const existing = db.prepare('SELECT id FROM family_members WHERE family_id = ? AND user_id = ?').get(family.id, req.user.id);
  if (existing) return res.status(400).json({ error: '你已经是该家庭成员' });

  db.prepare('INSERT INTO family_members (family_id, user_id, role) VALUES (?, ?, ?)').run(family.id, req.user.id, 'member');
  res.json({ family });
});

// 我的家庭列表
router.get('/mine', (req, res) => {
  const families = db.prepare(`
    SELECT f.*, fm.role FROM families f
    JOIN family_members fm ON fm.family_id = f.id
    WHERE fm.user_id = ?
    ORDER BY f.created_at DESC
  `).all(req.user.id);
  res.json({ families });
});

// 家庭详情
router.get('/:id', (req, res) => {
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(req.params.id);
  if (!family) return res.status(404).json({ error: '家庭不存在' });

  const member = db.prepare('SELECT id FROM family_members WHERE family_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!member) return res.status(403).json({ error: '你不属于该家庭' });

  res.json({ family });
});

// 家庭成员列表
router.get('/:id/members', (req, res) => {
  const members = db.prepare(`
    SELECT u.id, u.username, u.nickname, u.avatar, fm.role, fm.joined_at
    FROM family_members fm
    JOIN users u ON u.id = fm.user_id
    WHERE fm.family_id = ?
    ORDER BY fm.joined_at ASC
  `).all(req.params.id);
  res.json({ members });
});

// 更新家庭（改名、设置主厨）
router.put('/:id', (req, res) => {
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(req.params.id);
  if (!family) return res.status(404).json({ error: '家庭不存在' });
  if (family.creator_id !== req.user.id) return res.status(403).json({ error: '只有创建者可以修改' });

  const { name, head_chef_id } = req.body;
  if (name) {
    db.prepare('UPDATE families SET name = ? WHERE id = ?').run(name, req.params.id);
  }
  if (head_chef_id) {
    const m = db.prepare('SELECT id FROM family_members WHERE family_id = ? AND user_id = ?').get(req.params.id, head_chef_id);
    if (!m) return res.status(400).json({ error: '该用户不是家庭成员' });
    db.prepare('UPDATE family_members SET role = "member" WHERE family_id = ?').run(req.params.id);
    db.prepare('UPDATE family_members SET role = "chef" WHERE family_id = ? AND user_id = ?').run(req.params.id, head_chef_id);
    db.prepare('UPDATE families SET head_chef_id = ? WHERE id = ?').run(head_chef_id, req.params.id);
  }
  const updated = db.prepare('SELECT * FROM families WHERE id = ?').get(req.params.id);
  res.json({ family: updated });
});

// 移除成员
router.delete('/:id/members/:uid', (req, res) => {
  const family = db.prepare('SELECT * FROM families WHERE id = ?').get(req.params.id);
  if (!family) return res.status(404).json({ error: '家庭不存在' });
  if (family.creator_id !== req.user.id) return res.status(403).json({ error: '只有创建者可以移除成员' });
  if (req.params.uid == family.creator_id) return res.status(400).json({ error: '不能移除创建者' });

  db.prepare('DELETE FROM family_members WHERE family_id = ? AND user_id = ?').run(req.params.id, req.params.uid);
  res.json({ success: true });
});

export default router;
