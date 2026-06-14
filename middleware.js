import { NextResponse } from 'next/server'

export function middleware(request) {
  const ua = request.headers.get('user-agent') || ''
  
  const crawlers = [
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot', 
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',
    'googlebot'
  ]
  
  const isCrawler = crawlers.some(
    bot => ua.toLowerCase().includes(bot)
  )
  
  const pathname = request.nextUrl.pathname
  const isStoryPage = pathname.startsWith('/story/')
  
  if (isCrawler && isStoryPage) {
    const slug = pathname.replace('/story/', '')
    const ogUrl = 'https://uvicorn-appmain-production-79c6.up.railway.app/story-og/' + slug
    return NextResponse.rewrite(new URL(ogUrl))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/story/:path*']
}
