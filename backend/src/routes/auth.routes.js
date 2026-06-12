import { Router } from 'express';
import { hash, verify } from 'argon2';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { 
  signAccessToken, signRefreshToken, 
  setAccessCookie, setRefreshCookie, 
  clearAccessCookie, clearRefreshCookie,
  verifyRefreshToken, getRefreshCookie
} from '../lib/jwt.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const SignupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  businessName: z.string().max(100).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/auth/signup
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, businessName } = SignupSchema.parse(req.body);

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password with Argon2
    const passwordHash = await hash(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        businessName: businessName || name,
        passwordHash
      }
    });

    // Create default settings
    await prisma.settings.create({
      data: {
        userId: user.id,
        address: '',
        paymentTerms: 30
      }
    });

    // Issue tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', issues: err.issues });
    }
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password with Argon2
    let valid = false;
    try {
      valid = await verify(user.passwordHash, password);
    } catch (e) {
      // Invalid hash format
      valid = false;
    }

    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Issue tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName
      }
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input' });
    }
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAccessCookie(res);
  clearRefreshCookie(res);
  res.json({ ok: true });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = getRefreshCookie(req);
    if (!refreshToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const accessToken = signAccessToken(user);
    setAccessCookie(res, accessToken);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { settings: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        businessName: user.businessName,
        createdAt: user.createdAt
      },
      settings: user.settings || {}
    });
  } catch (err) {
    next(err);
  }
});

export const authRouter = router;
