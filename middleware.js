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

import { BRIEFING_PUBLIC, REGISTRY_PUBLIC } from './src/constants/features.js'

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

  // Surfaces switched off in src/constants/features.js return 404 to
  // browsers and crawlers alike. Code and data are kept; nothing is deleted.
  const flaggedOff =
    (!BRIEFING_PUBLIC && /^\/daily-briefing(\/|$)/.test(url.pathname)) ||
    (!REGISTRY_PUBLIC && /^\/registry(\/|$)/.test(url.pathname))
  if (flaggedOff) {
    return new Response(
      '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Not found | TraceNews</title><p>Page not found. <a href="/">TraceNews home</a></p>',
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } }
    )
  }
  
  // Politician pages: held, private and no-data people are 404 for every
  // client, browser or crawler (counsel, 3 Oct 2026). The backend decides.
  const polMatch = url.pathname.match(/^\/politicians\/([^/]+)\/?$/)
  if (polMatch) {
    let visible = false
    try {
      const v = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/politicians/${encodeURIComponent(polMatch[1])}/visibility`)
      visible = v.ok && (await v.json()).visible === true
    } catch (error) {
      console.error('politician visibility check failed:', error.message)
    }
    if (!visible) {
      return new Response(
        '<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Not found | TraceNews</title><p>Page not found. <a href="/">TraceNews home</a></p>',
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } }
      )
    }
  }

  if ((url.pathname === '/' || 
       url.pathname === '') && isBot) {
    const apiUrl = new URL(request.url)
    apiUrl.pathname = '/api/home-og'
    
    try {
      const apiResponse = await fetch(
        apiUrl.toString(),
        { headers: { 
          'user-agent': ua 
        }}
      )
      const html = 
        await apiResponse.text()
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
        'home-og proxy failed:',
        error.message
      )
      return new Response(null, {
        headers: {
          'x-middleware-next': '1'
        }
      })
    }
  }

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

  if (url.pathname.startsWith('/politicians/')) {
    const polSlug = url.pathname.replace('/politicians/', '')
    if (polSlug) {
      const apiUrl = new URL(request.url)
      apiUrl.pathname = '/api/politician-og'
      apiUrl.search = `?slug=${polSlug}`
      
      try {
        const apiResponse = await fetch(
          apiUrl.toString(),
          { headers: { 'user-agent': ua } }
        )
        const html = await apiResponse.text()
        return new Response(html, {
          status: apiResponse.status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': apiResponse.ok ? 'public, max-age=3600, stale-while-revalidate=86400' : 'no-store'
          }
        })
      } catch (error) {
        console.error('politician-og proxy failed:', error.message)
        return new Response(null, {
          headers: { 'x-middleware-next': '1' }
        })
      }
    }
  }

  if (
    url.pathname === '/methodology' ||
    url.pathname === '/daily-briefing' ||
    url.pathname === '/corrections' ||
    url.pathname === '/about'
  ) {
    const pageMap = {
      '/methodology': 'methodology',
      '/daily-briefing': 'daily-briefing',
      '/corrections': 'corrections',
      '/about': 'about'
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

  // Bot on a daily briefing story: same pattern as /story/
  if (url.pathname.startsWith('/daily-briefing/')) {
    const slug = url.pathname.replace('/daily-briefing/', '')
    if (slug) {
      const apiUrl = new URL(request.url)
      apiUrl.pathname = '/api/briefing-og'
      apiUrl.search = `?slug=${slug}`

      try {
        const apiResponse = await fetch(
          apiUrl.toString(),
          { headers: { 'user-agent': ua } }
        )
        const html = await apiResponse.text()
        return new Response(html, {
          status: apiResponse.status,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600'
          }
        })
      } catch (error) {
        console.error('briefing-og proxy failed:', error.message)
        return new Response(null, {
          headers: { 'x-middleware-next': '1' }
        })
      }
    }
  }

  // Bot on all other pages (app screens, files, unknown URLs): serve the
  // normal site. These pages were sent to a Railway Chrome prerender, which
  // was retired in Oct 2026: every content page now has its own OG function
  // above, and the rest (login, dashboard, admin, files) needs no rendering.
  return new Response(null, {
    headers: { 'x-middleware-next': '1' }
  })
}
