import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SettingsSchema = z.object({
  address: z.string().max(500).optional(),
  paymentTerms: z.number().int().min(0).max(365).optional()
});

// GET /api/settings
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: req.user.id,
          address: '',
          paymentTerms: 30
        }
      });
    }

    res.json({ settings });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings
router.put('/', requireAuth, async (req, res, next) => {
  try {
    const data = SettingsSchema.parse(req.body);

    let settings = await prisma.settings.findUnique({
      where: { userId: req.user.id }
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: req.user.id,
          ...data
        }
      });
    } else {
      settings = await prisma.settings.update({
        where: { userId: req.user.id },
        data
      });
    }

    res.json({ settings });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    next(err);
  }
});

export const settingsRouter = router;
