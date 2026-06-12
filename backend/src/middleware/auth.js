import jwt from 'jsonwebtoken';
import { getAccessCookie, getRefreshCookie, verifyAccessToken, verifyRefreshToken, setAccessCookie } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  try {
    let token = getAccessCookie(req);
    
    // If access token expired, try refresh
    if (!token) {
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
      
      // Issue new access token
      const newAccessToken = jwt.sign(
        { sub: user.id, email: user.email, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
      setAccessCookie(res, newAccessToken);
      token = newAccessToken;
    }

    const payload = verifyAccessToken(token);
    if (!payload?.sub) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = { id: user.id, email: user.email, name: user.name, businessName: user.businessName };
    next();
  } catch (e) {
    console.error('Auth error:', e);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function optionalAuth(req, res, next) {
  try {
    const token = getAccessCookie(req);
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload?.sub) {
        req.userId = payload.sub;
      }
    }
  } catch (e) {
    // Optional auth, continue anyway
  }
  next();
}
