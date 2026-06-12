import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const clientsRouter = Router();
clientsRouter.use(requireAuth);

const createClientSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  company: z.string().trim().max(100).optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable()
});

clientsRouter.get('/', async (req, res) => {
  const clients = await prisma.client.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ clients });
});

clientsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = createClientSchema.parse(req.body);
    const client = await prisma.client.create({
      data: {
        userId: req.user.id,
        name: parsed.name,
        email: parsed.email,
        company: parsed.company || null,
        phone: parsed.phone || null
      }
    });
    res.status(201).json({ client });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    // Prisma unique constraint
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Client email already exists' });
    next(e);
  }
});

clientsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const parsed = createClientSchema.partial().parse(req.body);

    const client = await prisma.client.update({
      where: { id, userId: req.user.id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.email !== undefined ? { email: parsed.email } : {}),
        ...(parsed.company !== undefined ? { company: parsed.company || null } : {}),
        ...(parsed.phone !== undefined ? { phone: parsed.phone || null } : {})
      }
    });

    res.json({ client });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    if (e?.code === 'P2002') return res.status(409).json({ error: 'Client email already exists' });
    next(e);
  }
});

clientsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    await prisma.client.delete({ where: { id, userId: req.user.id } });
    res.json({ ok: true });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});
