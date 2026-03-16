import { Router } from 'express';

const router = Router();

// GET all projects
router.get('/', async (req, res) => {
  try {
    const projects = req.db.prepare('SELECT * FROM projects ORDER BY updatedAt DESC, createdAt DESC').all();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = req.db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE project
router.post('/', async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `INSERT INTO projects (id, name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id || crypto.randomUUID(),
        data.name,
        data.location || null,
        data.partnerId || null,
        data.equityRatio || null,
        data.totalInvestment || null,
        data.status || null,
        data.startDate || null,
        data.endDate || null,
        now,
        now
      ]
    );

    const newProject = { id, ...data, createdAt: now, updatedAt: now };
    res.status(201).json(newProject);

    // 广播新项目
    req.io.emit('project:created', newProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `UPDATE projects SET
        name = COALESCE(?, name),
        location = COALESCE(?, location),
        partnerId = COALESCE(?, partnerId),
        equityRatio = COALESCE(?, equityRatio),
        totalInvestment = COALESCE(?, totalInvestment),
        status = COALESCE(?, status),
        startDate = COALESCE(?, startDate),
        endDate = COALESCE(?, endDate),
        updatedAt = ?
       WHERE id = ?`,
      [name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate, now, id]
    );

    const updated = req.db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(updated);

    // 广播更新
    req.io.emit('project:updated', updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const info = req.db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ success: true });

    // 广播删除
    req.io.emit('project:deleted', req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
