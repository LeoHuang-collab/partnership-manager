import express from 'express';
import prisma from '../utils/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { search } = req.query;
    
    const where = {};
    
    if (search) {
      where.name = { contains: search };
    }
    
    const partners = await prisma.partner.findMany({
      where,
      include: {
        _count: {
          select: { projects: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const result = partners.map(p => ({
      ...p,
      contacts: JSON.parse(p.contacts || '[]')
    }));
    
    res.json(result);
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        projects: true
      }
    });
    
    if (!partner) {
      return res.status(404).json({ error: '合作方不存在' });
    }
    
    res.json({
      ...partner,
      contacts: JSON.parse(partner.contacts || '[]')
    });
  } catch (error) {
    console.error('Get partner error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, type, contacts } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: '请填写合作方名称' });
    }
    
    const partner = await prisma.partner.create({
      data: {
        name,
        type: type || '机构',
        contacts: JSON.stringify(contacts || []),
        createdBy: req.user.id
      }
    });
    
    res.json({
      ...partner,
      contacts: JSON.parse(partner.contacts || '[]')
    });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, contacts } = req.body;
    
    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name,
        type,
        contacts: contacts ? JSON.stringify(contacts) : undefined
      }
    });
    
    res.json({
      ...partner,
      contacts: JSON.parse(partner.contacts || '[]')
    });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.partner.delete({
      where: { id }
    });
    
    res.json({ message: '删除成功' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
