const fs = require('fs');
const path = require('path');
const { getStore, connectLambda } = require('@netlify/blobs');

const FALLBACK_PATH = {
  es: path.join(__dirname, 'assets', 'menu-es.png'),
  en: path.join(__dirname, 'assets', 'menu-en.png'),
};

exports.handler = async (event) => {
  connectLambda(event);
  const lang = event.queryStringParameters && event.queryStringParameters.lang === 'en' ? 'en' : 'es';
  const store = getStore('site-config');

  let bytes = await store.get(`menu-${lang}`, { type: 'arrayBuffer' });
  if (!bytes) {
    bytes = fs.readFileSync(FALLBACK_PATH[lang]);
  }

  const buffer = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
