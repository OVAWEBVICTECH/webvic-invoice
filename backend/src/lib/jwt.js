import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'if_session';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 24) {
    throw Object.assign(new Error('JWT_SECRET is missing or too short'), { statusCode: 500 });
  }
  return secret;
}

export function signSession(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    getSecret(),
    { expiresIn: '30m' }
  );
}

export function verifySession(token) {
  return jwt.verify(token, getSecret());
}

export function getSessionCookie(req) {
  return req.cookies?.[COOKIE_NAME];
}

export function setSessionCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || '') === 'true' || process.env.NODE_ENV === 'production';
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 60 * 1000
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}
