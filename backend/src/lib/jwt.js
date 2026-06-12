import jwt from 'jsonwebtoken';

const ACCESS_COOKIE = 'if_access';
const REFRESH_COOKIE = 'if_refresh';

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw Object.assign(new Error('JWT_SECRET is missing or too short'), { statusCode: 500 });
  }
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    throw Object.assign(new Error('REFRESH_TOKEN_SECRET is missing or too short'), { statusCode: 500 });
  }
  return secret;
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: 'access' },
    getAccessSecret(),
    { expiresIn: '15m' }
  );
}

export function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, type: 'refresh' },
    getRefreshSecret(),
    { expiresIn: '7d' }
  );
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, getAccessSecret());
    if (payload.type !== 'access') throw new Error('Invalid token type');
    return payload;
  } catch (e) {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, getRefreshSecret());
    if (payload.type !== 'refresh') throw new Error('Invalid token type');
    return payload;
  } catch (e) {
    return null;
  }
}

export function getAccessCookie(req) {
  return req.cookies?.[ACCESS_COOKIE];
}

export function getRefreshCookie(req) {
  return req.cookies?.[REFRESH_COOKIE];
}

export function setAccessCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || '') === 'true' || process.env.NODE_ENV === 'production';
  res.cookie(ACCESS_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000
  });
}

export function setRefreshCookie(res, token) {
  const secure = String(process.env.COOKIE_SECURE || '') === 'true' || process.env.NODE_ENV === 'production';
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export function clearAccessCookie(res) {
  res.clearCookie(ACCESS_COOKIE, { path: '/' });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
}
