const { serveMenuImage } = require('./_menu-image-core');

exports.handler = (event) => serveMenuImage(event, 'es');
