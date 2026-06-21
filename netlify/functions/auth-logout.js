const { clearSessionCookie } = require('./_auth');

exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    multiValueHeaders: { 'Set-Cookie': [clearSessionCookie()] },
    body: JSON.stringify({ ok: true }),
  };
};
