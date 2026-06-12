import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const settingsRouter = Router();
settingsRouter.use(requireAuth);

const updateSettingsSchema = z.object({
  address: z.string().trim().max(300).optional().nullable(),
  paymentTerms: z.number().int().min(1).max(365).optional()
});

settingsRouter.get('/', async (req, res) => {
  const settings = await prisma.settings.findUnique({ where: { userId: req.user.id } });
  res.json({ settings });
});

settingsRouter.put('/', async (req, res, next) => {
  try {
    const parsed = updateSettingsSchema.parse(req.body);

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        address: parsed.address || '',
        paymentTerms: parsed.paymentTerms ?? 30
      },
      update: {
        ...(parsed.address !== undefined ? { address: parsed.address || '' } : {}),
        ...(parsed.paymentTerms !== undefined ? { paymentTerms: parsed.paymentTerms } : {})
      }
    });

    res.json({ settings });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    next(e);
  }
});
