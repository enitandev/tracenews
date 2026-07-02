function safe(s) {
  return (s || '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const BOT_USER_AGENTS = [
  'googlebot', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'bingbot',
  'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'slackbot', 'applebot',
  'yahoo! slurp', 'duckduckbot',
  'baiduspider', 'yandexbot',
  'whatsapp', 'telegrambot', 'discordbot'
]

export default async function handler(
  req, res
) {
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
    res.setHeader('Content-Type', 
      'text/html')
    return res.status(200).send(html)
  }

  const title = 
    'TraceNews — Nigerian Media ' +
    'Intelligence'
  
  const description = 
    'TraceNews measures editorial ' +
    'independence across Nigerian ' +
    'news outlets. We score how ' +
    'outlets behave — who they ' +
    'quote, what they cover, and ' +
    'what they avoid. We are an ' +
    'analytical instrument: we ' +
    'observe and measure coverage. ' +
    'We do not produce news.'
  
  const canonical = 
    'https://tracenews.ng'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'TraceNews',
    'url': 'https://tracenews.ng',
    'description': description,
    'foundingDate': '2024',
    'areaServed': {
      '@type': 'Country',
      'name': 'Nigeria'
    },
    'knowsAbout': [
      'Media bias analysis',
      'Editorial independence',
      'Nigerian journalism',
      'Media intelligence'
    ],
    'sameAs': [
      'https://tracenews.ng/methodology',
      'https://tracenews.ng/about'
    ]
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(title)}</title>
  <meta name="description"
    content="${safe(description)}">
  <link rel="canonical"
    href="${canonical}">
  <meta property="og:type"
    content="website">
  <meta property="og:title"
    content="${safe(title)}">
  <meta property="og:description"
    content="${safe(description)}">
  <meta property="og:image"
    content="https://tracenews.ng/og-default.png">
  <meta property="og:url"
    content="${canonical}">
  <meta property="og:site_name"
    content="TraceNews">
  <meta name="twitter:card"
    content="summary_large_image">
  <meta name="twitter:title"
    content="${safe(title)}">
  <meta name="twitter:description"
    content="${safe(description)}">
  <meta name="twitter:image"
    content="https://tracenews.ng/og-default.png">
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <h1>${safe(title)}</h1>
  <p>${safe(description)}</p>
  <a href="${canonical}/about">
    About TraceNews
  </a>
  <a href="${canonical}/methodology">
    Our methodology
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
