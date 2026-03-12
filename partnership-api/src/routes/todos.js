import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, status, priority } = req.query;
    
    const where = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (priority) {
      where.priority = priority;
    }
    
    const todos = await prisma.todo.findMany({
      where,
      include: {
        project: true
      },
      orderBy: [
        { status: 'asc' },
        { planCompleteDate: 'asc' }
      ]
    });
    
    res.json(todos);
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        project: true
      }
    });
    
    if (!todo) {
      return res.status(404).json({ error: '待办事项不存在' });
    }
    
    res.json(todo);
  } catch (error) {
    console.error('Get todo error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, task, blocker, responsiblePerson, planCompleteDate, actualCompleteDate, priority, status } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: '请选择项目' });
    }
    
    if (!task) {
      return res.status(400).json({ error: '请填写事项' });
    }
    
    const todo = await prisma.todo.create({
      data: {
        projectId,
        task,
        blocker,
        responsiblePerson,
        planCompleteDate: planCompleteDate ? new Date(planCompleteDate) : null,
        actualCompleteDate: actualCompleteDate ? new Date(actualCompleteDate) : null,
        priority,
        status: status || '进行中',
        createdBy: req.user.id
      },
      include: {
        project: true
      }
    });
    
    res.json(todo);
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { task, blocker, responsiblePerson, planCompleteDate, actualCompleteDate, priority, status } = req.body;
    
    const todo = await prisma.todo.update({
      where: { id },
      data: {
        task,
        blocker,
        responsiblePerson,
        planCompleteDate: planCompleteDate ? new Date(planCompleteDate) : null,
        actualCompleteDate: actualCompleteDate ? new Date(actualCompleteDate) : null,
        priority,
        status
      },
      include: {
        project: true
      }
    });
    
    res.json(todo);
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.todo.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
