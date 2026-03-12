import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId, period } = req.query;
    
    const where = {};
    
    if (projectId) {
      where.projectId = projectId;
    }
    
    if (period) {
      where.period = period;
    }
    
    const reports = await prisma.report.findMany({
      where,
      include: {
        project: {
          include: {
            partner: true
          }
        }
      },
      orderBy: { reportDate: 'desc' }
    });
    
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            partner: true
          }
        }
      }
    });
    
    if (!report) {
      return res.status(404).json({ error: '汇报不存在' });
    }
    
    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, reportDate, period, progress, difficulties, matters, overallStatus } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: '请选择项目' });
    }
    
    const report = await prisma.report.create({
      data: {
        projectId,
        reportDate: reportDate ? new Date(reportDate) : new Date(),
        period: period || 'week',
        progress,
        difficulties,
        matters,
        overallStatus: overallStatus || '正常',
        createdBy: req.user.id
      },
      include: {
        project: {
          include: {
            partner: true
          }
        }
      }
    });
    
    res.json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.report.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
