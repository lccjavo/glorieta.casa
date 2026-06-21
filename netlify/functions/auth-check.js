const { verifySession } = require('./_auth');

exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authenticated: verifySession(event) }),
  };
};
