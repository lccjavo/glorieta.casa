const crypto = require('crypto');

const COOKIE_NAME = 'config_session';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

function sign(payload) {
  const secret = process.env.CONFIG_SESSION_SECRET;
  if (!secret) throw new Error('CONFIG_SESSION_SECRET is not set');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function makeSessionCookie() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + SESSION_TTL_MS })).toString('base64url');
  const sig = sign(payload);
  const value = `${payload}.${sig}`;
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`;
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  });
  return out;
}

function verifySession(event) {
  const cookies = parseCookies(event.headers && (event.headers.cookie || event.headers.Cookie));
  const value = cookies[COOKIE_NAME];
  if (!value) return false;
  const [payload, sig] = value.split('.');
  if (!payload || !sig) return false;

  let expected;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

function checkCredentials(username, password) {
  const expectedUser = process.env.CONFIG_USERNAME || '';
  const expectedPass = process.env.CONFIG_PASSWORD || '';
  if (!expectedUser || !expectedPass) return false;

  const userBuf = Buffer.from(String(username || ''));
  const expectedUserBuf = Buffer.from(expectedUser);
  const passBuf = Buffer.from(String(password || ''));
  const expectedPassBuf = Buffer.from(expectedPass);

  const userMatch =
    userBuf.length === expectedUserBuf.length && crypto.timingSafeEqual(userBuf, expectedUserBuf);
  const passMatch =
    passBuf.length === expectedPassBuf.length && crypto.timingSafeEqual(passBuf, expectedPassBuf);

  return userMatch && passMatch;
}

module.exports = { verifySession, makeSessionCookie, clearSessionCookie, checkCredentials };
