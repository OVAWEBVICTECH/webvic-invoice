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
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
}

export function verifySession(token) {
  return jwt.verify(token, getSecret());
}

export function getSessionToken(req) {
  const auth = req.get('authorization') || '';
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : req.cookies?.[COOKIE_NAME];
}

export function getSessionCookie(req) {
  return req.cookies?.[COOKIE_NAME];
}

function cookieOptions() {
  const secure = String(process.env.COOKIE_SECURE || '') === 'true' || process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: process.env.COOKIE_SAME_SITE || (secure ? 'none' : 'lax'),
    path: '/',
    maxAge: 30 * 60 * 1000
  };
}

export function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

export function clearSessionCookie(res) {
  const options = cookieOptions();
  delete options.maxAge;
  res.clearCookie(COOKIE_NAME, options);
}
