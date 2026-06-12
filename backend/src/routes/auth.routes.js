import { Router } from 'express';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma.js';
import { clearSessionCookie, setSessionCookie, signSession } from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(200),
  businessName: z.string().trim().min(2).max(100).optional()
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(200)
});

authRouter.post('/signup', async (req, res, next) => {
  try {
    const parsed = signupSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await argon2.hash(parsed.password, { type: argon2.argon2id });

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        name: parsed.name,
        businessName: parsed.businessName || parsed.name,
        passwordHash,
        settings: {
          create: {
            paymentTerms: 30,
            address: ''
          }
        }
      },
      select: { id: true, email: true, name: true, businessName: true }
    });

    const token = signSession(user);
    setSessionCookie(res, token);

    res.status(201).json({ user });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    next(e);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await argon2.verify(user.passwordHash, parsed.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signSession({ id: user.id, email: user.email });
    setSessionCookie(res, token);

    res.json({ user: { id: user.id, email: user.email, name: user.name, businessName: user.businessName } });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    next(e);
  }
});

authRouter.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, businessName: true, createdAt: true }
  });
  res.json({ user });
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  businessName: z.string().trim().min(2).max(100).optional()
});

// Update profile (name/businessName)
authRouter.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const parsed = profileSchema.parse(req.body || {});

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.businessName !== undefined ? { businessName: parsed.businessName } : {})
      },
      select: { id: true, email: true, name: true, businessName: true }
    });

    res.json({ user });
  } catch (e) {
    if (e?.name === 'ZodError') return res.status(400).json({ error: 'Invalid input' });
    next(e);
  }
});
