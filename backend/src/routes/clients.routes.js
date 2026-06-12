import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const ClientSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  company: z.string().max(100).optional(),
  phone: z.string().max(20).optional()
});

// GET /api/clients
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ clients });
  } catch (err) {
    next(err);
  }
});

// POST /api/clients
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = ClientSchema.parse(req.body);
    
    // Check uniqueness
    const existing = await prisma.client.findUnique({
      where: { userId_email: { userId: req.user.id, email: data.email } }
    });
    
    if (existing) {
      return res.status(409).json({ error: 'Client email already exists' });
    }

    const client = await prisma.client.create({
      data: {
        ...data,
        userId: req.user.id
      }
    });

    res.status(201).json({ client });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', issues: err.issues });
    }
    next(err);
  }
});

// PUT /api/clients/:id
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const data = ClientSchema.parse(req.body);

    const client = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data
    });

    res.json({ client: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    next(err);
  }
});

// DELETE /api/clients/:id
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export const clientsRouter = router;
