const { getStore, connectLambda } = require('@netlify/blobs');
const { verifySession } = require('./_auth');
const DEFAULT_TAPLIST = require('./_taplist-default');

const VALID_COLORS = new Set(['ipa', 'hazy', 'lager', 'red', 'vienna', 'stout', 'session', 'pale']);

function validate(items) {
  if (!Array.isArray(items) || items.length === 0) return 'Body must be a non-empty array';

  for (const item of items) {
    if (typeof item.name !== 'string' || !item.name.trim()) return 'Each item needs a name';
    if (typeof item.style !== 'string') return 'Each item needs a style';
    if (typeof item.brewery !== 'string') return 'Each item needs a brewery';
    if (typeof item.abv !== 'string') return 'Each item needs an abv';
    if (!VALID_COLORS.has(item.color)) return `Invalid color: ${item.color}`;
    if (!Number.isInteger(item.hops) || item.hops < 0 || item.hops > 5) return 'hops must be an integer 0-5';
    if (typeof item.price !== 'number' || item.price < 0) return 'price must be a non-negative number';
    if (typeof item.soldOut !== 'boolean') return 'soldOut must be a boolean';
  }

  return null;
}

async function handleGet() {
  const store = getStore('site-config');
  const items = (await store.get('taplist', { type: 'json' })) || DEFAULT_TAPLIST;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify(items),
  };
}

async function handlePost(event) {
  if (!verifySession(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let items;
  try {
    items = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const error = validate(items);
  if (error) {
    return { statusCode: 400, body: JSON.stringify({ error }) };
  }

  const store = getStore('site-config');
  await store.setJSON('taplist', items);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  };
}

exports.handler = async (event) => {
  connectLambda(event);
  if (event.httpMethod === 'GET') return handleGet();
  if (event.httpMethod === 'POST') return handlePost(event);
  return { statusCode: 405, body: 'Method not allowed' };
};
