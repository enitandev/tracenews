import { createClient } from '@supabase/supabase-js'

const BOT_USER_AGENTS = [
  'googlebot', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'bingbot',
  'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'slackbot', 'applebot',
  'yahoo! slurp', 'duckduckbot',
  'baiduspider', 'yandexbot',
  'whatsapp', 'telegrambot', 'discordbot'
]

const STATIC_PAGES = {
  'methodology': {
    title: 'How TraceNews Scores ' +
      'Nigerian Media Independence ' +
      '| Methodology',
    description: 'The TraceNews ' +
      'Independence Index (TII) — ' +
      'six behavioural signals, ' +
      'three tiers, and complete ' +
      'transparency on every editorial ' +
      'decision behind the scores.',
    url: 'https://tracenews.ng/methodology'
  },
  'daily-briefing': {
    title: 'Daily Briefing | TraceNews',
    description: 'Your daily Nigerian ' +
      'media intelligence briefing — ' +
      'the top 9 stories, how they were ' +
      'covered, and what the coverage ' +
      'patterns reveal.',
    url: 'https://tracenews.ng/daily-briefing'
  }
}

function safe(s) {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(
  req, res
) {
  const { page } = req.query
  
  const ua = (
    req.headers['user-agent'] || ''
  ).toLowerCase()
  
  const isBot = BOT_USER_AGENTS
    .some(bot => ua.includes(bot))
  
  if (!isBot) {
    const response = await fetch(
      'https://tracenews.ng/'
    )
    const html = await response.text()
    res.setHeader(
      'Content-Type', 'text/html'
    )
    return res.status(200).send(html)
  }
  
  const pageData = STATIC_PAGES[page]
  if (!pageData) {
    return res.redirect(
      302, 'https://tracenews.ng'
    )
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(pageData.title)}</title>
  <meta name="description" 
    content="${safe(pageData.description)}">
  <link rel="canonical" 
    href="${pageData.url}">
  <meta property="og:type" 
    content="website">
  <meta property="og:title" 
    content="${safe(pageData.title)}">
  <meta property="og:description" 
    content="${safe(pageData.description)}">
  <meta property="og:image" 
    content="https://tracenews.ng/og-default.png">
  <meta property="og:url" 
    content="${pageData.url}">
  <meta property="og:site_name" 
    content="TraceNews">
  <meta name="twitter:card" 
    content="summary_large_image">
  <meta name="twitter:title" 
    content="${safe(pageData.title)}">
  <meta name="twitter:description" 
    content="${safe(pageData.description)}">
  <meta name="twitter:image" 
    content="https://tracenews.ng/og-default.png">
</head>
<body>
  <h1>${safe(pageData.title)}</h1>
  <p>${safe(pageData.description)}</p>
  <a href="${pageData.url}">
    Read on TraceNews
  </a>
</body>
</html>`

  res.setHeader(
    'Content-Type',
    'text/html; charset=utf-8'
  )
  res.setHeader(
    'Cache-Control',
    'public, max-age=86400, ' +
    'stale-while-revalidate=604800'
  )
  return res.status(200).send(html)
}
