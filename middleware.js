export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets|logo.png|favicon-32.png|apple-touch-icon.png|.*\\.svg$).*)',
};

// Vercel Edge Middleware
export default async function middleware(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';

  // List of bots to prerender for
  const bots = [
    'googlebot',
    'gptbot',
    'claudebot',
    'perplexitybot',
    'ccbot',
    'bingbot',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'slackbot',
    'applebot',
    'yahoo! slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot'
  ];

  const isBot = bots.some(bot => userAgent.toLowerCase().includes(bot));

  if (!isBot) {
    // Pass through to standard SPA
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }

  // Rewrite to Railway Prerender
  // User will set PRERENDER_URL in Vercel environment variables, 
  // e.g., https://prerender-production.up.railway.app
  // Temporarily force a bad URL to test graceful fallback
  const PRERENDER_URL = 'https://this-is-a-completely-broken-url.railway.app';
  const targetUrl = `${PRERENDER_URL}/${url.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000); // 4-second hard timeout

  try {
    const prerenderResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': userAgent
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!prerenderResponse.ok) {
      throw new Error(`Prerender failed with status: ${prerenderResponse.status}`);
    }

    const html = await prerenderResponse.text();

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate', // Let prerender caching handle it
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Prerender fallback triggered:', error.message);
    
    // Graceful fallback to the standard SPA (empty shell) so the bot gets a 200, not a 500
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    });
  }
}
