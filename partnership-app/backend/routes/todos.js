import { Router } from 'express';

const router = Router();

// GET all todos (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    let query = 'SELECT * FROM todos';
    const params = [];

    const conditions = [];
    if (projectId) {
      conditions.push('projectId = ?');
      params.push(projectId);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY updatedAt DESC, createdAt DESC';

    const stmt = params.length > 0 
      ? req.db.prepare(query)
      : req.db.prepare(query);
    const todos = params.length > 0 ? stmt.all(...params) : stmt.all();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single todo
router.get('/:id', async (req, res) => {
  try {
    const todo = req.db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE todo
router.post('/', async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `INSERT INTO todos (id, task, projectId, status, priority, planCompleteDate, actualCompleteDate, blocker, responsiblePerson, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id || crypto.randomUUID(),
        data.task,
        data.projectId || null,
        data.status || '进行中',
        data.priority || '一般',
        data.planCompleteDate || null,
        data.actualCompleteDate || null,
        data.blocker || null,
        data.responsiblePerson || null,
        now,
        now
      ]
    );

    const newTodo = { id, ...data, createdAt: now, updatedAt: now };
    res.status(201).json(newTodo);

    // 广播新待办事项
    req.io.emit('todo:created', newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { task, projectId, status, priority, planCompleteDate, actualCompleteDate, blocker, responsiblePerson } = req.body;
    const now = new Date().toISOString();

    req.db.run(
      `UPDATE todos SET
        task = COALESCE(?, task),
        projectId = COALESCE(?, projectId),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        planCompleteDate = COALESCE(?, planCompleteDate),
        actualCompleteDate = COALESCE(?, actualCompleteDate),
        blocker = COALESCE(?, blocker),
        responsiblePerson = COALESCE(?, responsiblePerson),
        updatedAt = ?
       WHERE id = ?`,
      [task, projectId, status, priority, planCompleteDate, actualCompleteDate, blocker, responsiblePerson, now, id]
    );

    const updated = req.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
    if (!updated) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json(updated);

    // 广播更新
    req.io.emit('todo:updated', updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE todo
router.delete('/:id', async (req, res) => {
  try {
    const info = req.db.run('DELETE FROM todos WHERE id = ?', [req.params.id]);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ success: true });

    // 广播删除
    req.io.emit('todo:deleted', req.params.id);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
