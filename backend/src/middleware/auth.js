import { getSessionToken, verifySession } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function requireAuth(req, res, next) {
  try {
    const token = getSessionToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const payload = verifySession(token);
    const userId = payload?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    req.user = { id: user.id, email: user.email, name: user.name };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}
