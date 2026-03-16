import { Router } from 'express';

const router = Router();

// GET all partners
router.get('/', async (req, res) => {
  try {
    const partners = req.db.prepare('SELECT * FROM partners ORDER BY createdAt DESC').all();
    // Parse contacts JSON
    const parsed = partners.map(p => ({
      ...p,
      contacts: p.contacts ? JSON.parse(p.contacts) : []
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single partner
router.get('/:id', async (req, res) => {
  try {
    const partner = req.db.prepare('SELECT * FROM partners WHERE id = ?').get(req.params.id);
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json({ ...partner, contacts: partner.contacts ? JSON.parse(partner.contacts) : [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE partner
router.post('/', async (req, res) => {
  try {
    const { id, contacts, ...data } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `INSERT INTO partners (id, name, type, contacts, createdAt) VALUES (?, ?, ?, ?, ?)`,
      [
        id || crypto.randomUUID(),
        data.name,
        data.type || null,
        JSON.stringify(contacts || []),
        now
      ]
    );

    const newPartner = { id, ...data, contacts: contacts || [], createdAt: now };
    res.status(201).json(newPartner);

    // 广播新合作伙伴
    req.io.emit('partner:created', newPartner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE partner
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, contacts } = req.body;

    req.db.run(
      `UPDATE partners SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        contacts = COALESCE(?, contacts)
       WHERE id = ?`,
      [name, type, contacts ? JSON.stringify(contacts) : null, id]
    );

    const updated = req.db.prepare('SELECT * FROM partners WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    const result = { ...updated, contacts: updated.contacts ? JSON.parse(updated.contacts) : [] };
    res.json(result);

    // 广播更新
    req.io.emit('partner:updated', result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE partner
router.delete('/:id', async (req, res) => {
  try {
    const info = req.db.run('DELETE FROM partners WHERE id = ?', [req.params.id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    res.json({ success: true });

    // 广播删除
    req.io.emit('partner:deleted', req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
