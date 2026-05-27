export default async (request, context) => {
  const cookie = request.headers.get('cookie') ?? '';
  const hasPref = /preferred_language=/.test(cookie);

  const response = await context.next();

  if (!hasPref) {
    const country = context.geo?.country?.code ?? '';
    const lang = country === 'MX' ? 'es' : 'en';
    response.headers.append(
      'Set-Cookie',
      `preferred_language=${lang}; Path=/; SameSite=Lax; Max-Age=31536000`
    );
  }

  return response;
};
