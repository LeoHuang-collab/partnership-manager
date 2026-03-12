import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { status, partnerId, search } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (partnerId) {
      where.partnerId = partnerId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } }
      ];
    }
    
    const projects = await prisma.project.findMany({
      where,
      include: {
        partner: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        partner: true,
        reports: {
          orderBy: { reportDate: 'desc' },
          take: 10
        },
        todos: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: '项目不存在' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '请填写项目名称' });
    }
    
    const project = await prisma.project.create({
      data: {
        name,
        location,
        partnerId,
        equityRatio: equityRatio || 50,
        totalInvestment: totalInvestment || 0,
        status: status || '筹备中',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: req.user.id
      },
      include: {
        partner: true
      }
    });
    
    res.json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, partnerId, equityRatio, totalInvestment, status, startDate, endDate } = req.body;
    
    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        location,
        partnerId,
        equityRatio,
        totalInvestment,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        partner: true
      }
    });
    
    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.project.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
