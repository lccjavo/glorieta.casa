const { checkCredentials, makeSessionCookie } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!checkCredentials(body.username, body.password)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials' }) };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    multiValueHeaders: { 'Set-Cookie': [makeSessionCookie()] },
    body: JSON.stringify({ ok: true }),
  };
};
