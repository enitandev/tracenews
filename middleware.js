// Bot UA list — must stay identical 
// to BOT_USER_AGENTS in api/story-og.js
// Update both together if adding new bots
const BOT_USER_AGENTS = [
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
  'yandexbot',
  'whatsapp',
  'telegrambot',
  'discordbot'
]

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|assets|logo.png|favicon-32.png|apple-touch-icon.png|.*\\.svg$).*)',
}

export default async function middleware(
  request
) {
  const url = new URL(request.url)
  const ua = request.headers.get(
    'user-agent'
  ) || ''
  
  const isBot = BOT_USER_AGENTS.some(
    bot => ua.toLowerCase().includes(bot)
  )
  
  // Non-bots: pass through to SPA
  if (!isBot) {
    return new Response(null, {
      headers: { 'x-middleware-next': '1' }
    })
  }
  
  // Bot on a story page:
  // proxy to /api/story-og and return
  // the response AT THE ORIGINAL URL
  // No redirect — bot never sees 
  // /api/story-og, just gets full HTML
  // at /story/:slug
  if (url.pathname.startsWith('/story/')) {
    const slug = url.pathname
      .replace('/story/', '')
    const apiUrl = new URL(request.url)
    apiUrl.pathname = '/api/story-og'
    apiUrl.search = `?slug=${slug}`
    
    try {
      const apiResponse = await fetch(
        apiUrl.toString(),
        { headers: { 
          'user-agent': ua 
        }}
      )
      const html = await apiResponse.text()
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 
            'text/html; charset=utf-8',
          'Cache-Control': 
            'public, max-age=900, ' +
            'stale-while-revalidate=3600'
        }
      })
    } catch (error) {
      // Fallback to SPA on any error
      console.error(
        'story-og proxy failed:', 
        error.message
      )
      return new Response(null, {
        headers: { 
          'x-middleware-next': '1' 
        }
      })
    }
  }

  if (url.pathname.startsWith('/topics/')) {
    const slug = url.pathname
      .replace('/topics/', '')
    const apiUrl = new URL(request.url)
    apiUrl.pathname = '/api/category-og'
    apiUrl.search = `?slug=${slug}`
    
    try {
      const apiResponse = await fetch(
        apiUrl.toString(),
        { headers: { 'user-agent': ua }}
      )
      const html = await apiResponse.text()
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 
            'text/html; charset=utf-8',
          'Cache-Control': 
            'public, max-age=3600, ' +
            'stale-while-revalidate=86400'
        }
      })
    } catch (error) {
      console.error(
        'category-og proxy failed:', 
        error.message
      )
      return new Response(null, {
        headers: { 
          'x-middleware-next': '1' 
        }
      })
    }
  }
  
  if (url.pathname.startsWith('/outlets/')) {
    const outletSlug = url.pathname.replace('/outlets/', '')
    if (outletSlug) {
      const apiUrl = new URL(request.url)
      apiUrl.pathname = '/api/outlet-og'
      apiUrl.search = `?slug=${outletSlug}`
      
      try {
        const apiResponse = await fetch(
          apiUrl.toString(),
          { headers: { 'user-agent': ua } }
        )
        const html = await apiResponse.text()
        return new Response(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
          }
        })
      } catch (error) {
        console.error('outlet-og proxy failed:', error.message)
        return new Response(null, {
          headers: { 'x-middleware-next': '1' }
        })
      }
    }
  }

  if (
    url.pathname === '/methodology' ||
    url.pathname === '/daily-briefing'
  ) {
    const pageMap = {
      '/methodology': 'methodology',
      '/daily-briefing': 'daily-briefing'
    }
    const pageKey = pageMap[url.pathname]
    const apiUrl = new URL(request.url)
    apiUrl.pathname = '/api/static-og'
    apiUrl.search = `?page=${pageKey}`
    
    try {
      const apiResponse = await fetch(
        apiUrl.toString(),
        { headers: { 'user-agent': ua }}
      )
      const html = await apiResponse.text()
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type':
            'text/html; charset=utf-8',
          'Cache-Control':
            'public, max-age=86400, ' +
            'stale-while-revalidate=604800'
        }
      })
    } catch (error) {
      console.error(
        'static-og proxy failed:',
        error.message
      )
      return new Response(null, {
        headers: {
          'x-middleware-next': '1'
        }
      })
    }
  }

  // Bot on all other pages:
  // proxy to Railway Chrome prerender
  const PRERENDER_URL = 
    process.env.PRERENDER_URL || 
    'https://tracenews-prerender-production.up.railway.app'
  const targetUrl = 
    `${PRERENDER_URL}/${url.toString()}`
  
  const controller = new AbortController()
  const timeoutId = setTimeout(
    () => controller.abort(), 
    8000
  )
  
  try {
    const prerenderResponse = await fetch(
      targetUrl,
      { 
        headers: { 'User-Agent': ua },
        signal: controller.signal
      }
    )
    clearTimeout(timeoutId)
    
    if (!prerenderResponse.ok) {
      throw new Error(
        `Prerender failed: ` + 
        prerenderResponse.status
      )
    }
    
    const html = await 
      prerenderResponse.text()
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 
          'text/html; charset=utf-8',
        'Cache-Control': 
          'public, max-age=0, ' +
          'must-revalidate'
      }
    })
  } catch (error) {
    clearTimeout(timeoutId)
    console.error(
      'Prerender fallback:', 
      error.message
    )
    return new Response(null, {
      headers: { 
        'x-middleware-next': '1' 
      }
    })
  }
}
