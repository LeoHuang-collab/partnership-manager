import { Router } from 'express';

const router = Router();

// GET all reports
router.get('/', async (req, res) => {
  try {
    const { projectId, period } = req.query;
    let query = 'SELECT * FROM reports';
    const params = [];

    const conditions = [];
    if (projectId) {
      conditions.push('projectId = ?');
      params.push(projectId);
    }
    if (period) {
      conditions.push('period = ?');
      params.push(period);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY reportDate DESC, createdAt DESC';

    const stmt = params.length > 0
      ? req.db.prepare(query)
      : req.db.prepare(query);
    const reports = params.length > 0 ? stmt.all(...params) : stmt.all();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single report
router.get('/:id', async (req, res) => {
  try {
    const report = req.db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE report
router.post('/', async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `INSERT INTO reports (id, projectId, period, reportDate, progress, nextPlan, risk, needSupport, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id || crypto.randomUUID(),
        data.projectId,
        data.period,
        data.reportDate,
        data.progress || null,
        data.nextPlan || null,
        data.risk || null,
        data.needSupport || null,
        now,
        now
      ]
    );

    const newReport = { id, ...data, createdAt: now, updatedAt: now };
    res.status(201).json(newReport);

    // 广播新汇报
    req.io.emit('report:created', newReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE report
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, period, reportDate, progress, nextPlan, risk, needSupport } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `UPDATE reports SET
        projectId = COALESCE(?, projectId),
        period = COALESCE(?, period),
        reportDate = COALESCE(?, reportDate),
        progress = COALESCE(?, progress),
        nextPlan = COALESCE(?, nextPlan),
        risk = COALESCE(?, risk),
        needSupport = COALESCE(?, needSupport),
        updatedAt = ?
       WHERE id = ?`,
      [projectId, period, reportDate, progress, nextPlan, risk, needSupport, now, id]
    );

    const updated = req.db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json(updated);

    // 广播更新
    req.io.emit('report:updated', updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE report
router.delete('/:id', async (req, res) => {
  try {
    const info = req.db.run('DELETE FROM reports WHERE id = ?', [req.params.id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true });

    // 广播删除
    req.io.emit('report:deleted', req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
