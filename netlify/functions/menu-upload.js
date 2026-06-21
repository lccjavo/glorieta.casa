const { getStore, connectLambda } = require('@netlify/blobs');
const { verifySession } = require('./_auth');

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const MAX_BYTES = 8 * 1024 * 1024;

exports.handler = async (event) => {
  connectLambda(event);
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  if (!verifySession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { lang, imageBase64 } = body;
  if (lang !== 'es' && lang !== 'en') {
    return { statusCode: 400, body: JSON.stringify({ error: 'lang must be "es" or "en"' }) };
  }
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: 'imageBase64 is required' }) };
  }

  let buffer;
  try {
    buffer = Buffer.from(imageBase64, 'base64');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'imageBase64 is not valid base64' }) };
  }

  if (buffer.length === 0 || buffer.length > MAX_BYTES) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Image too large or empty' }) };
  }
  if (!buffer.subarray(0, 8).equals(PNG_MAGIC)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'File is not a PNG' }) };
  }

  const store = getStore('site-config');
  await store.set(`menu-${lang}`, buffer);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
};
