import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

const BOT_USER_AGENTS = [
  'googlebot', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'bingbot',
  'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'slackbot', 'applebot',
  'yahoo! slurp', 'duckduckbot',
  'baiduspider', 'yandexbot',
  'whatsapp', 'telegrambot', 'discordbot'
]

const TIER_MAP = {
  'adversarial': 'Watchdog',
  'institutional': 'Mainstream',
  'pro_establishment': 'Govt'
}

const ALIGNMENT_MAP = {
  'pro_government': 'Government-aligned',
  'neutral': 'Editorially neutral',
  'opposition': 'Critical of government'
}

function safe(s) {
  return (s || '')
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default async function handler(req, res) {
  const { slug } = req.query
  
  const ua = (req.headers['user-agent'] || '').toLowerCase()
  
  const isBot = BOT_USER_AGENTS.some(bot => ua.includes(bot))
  
  if (!isBot) {
    const response = await fetch('https://tracenews.ng/')
    const html = await response.text()
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
  }
  
  const { data: outlets } = await supabase
    .from('outlets')
    .select(
      'name, slug, website, ' +
      'independence_score, ' +
      'credibility_tier, ' +
      'ownership_name, ' +
      'ownership_type, ' +
      'geopolitical_lean, ' +
      'government_alignment, ' +
      'headquarters_city, ' +
      'founded_year, medium'
    )
    .eq('slug', slug)
    .limit(1)
  
  if (!outlets || !outlets.length) {
    return res.redirect(302, 'https://tracenews.ng')
  }
  
  const outlet = outlets[0]
  const score = outlet.independence_score
  const rawTier = (outlet.credibility_tier || 'unscored').toLowerCase()
  const tier = TIER_MAP[rawTier] || rawTier
  const alignment = ALIGNMENT_MAP[outlet.government_alignment] || outlet.government_alignment
  
  const canonical = `https://tracenews.ng/outlets/${slug}`
  
  const metaTitle = `${outlet.name} — Editorial Independence Score | TraceNews`
  
  const metaDesc = `TraceNews scores ${outlet.name} ${score}/100 for editorial independence — ${tier} tier. Owned by ${outlet.ownership_name}. Government alignment: ${alignment}. See coverage analysis and methodology on TraceNews.`
  
  // Organization + Dataset JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Dataset'],
    'name': outlet.name,
    'url': outlet.website 
      ? `https://${outlet.website}` 
      : canonical,
    'description': metaDesc,
    'creator': {
      '@type': 'Organization',
      'name': 'TraceNews',
      'url': 'https://tracenews.ng'
    },
    'license': 
      'https://tracenews.ng/methodology',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonical
    },
    'additionalProperty': [
      {
        '@type': 'PropertyValue',
        'name': 
          'TraceNews Independence Index',
        'value': score,
        'minValue': 0,
        'maxValue': 100
      },
      {
        '@type': 'PropertyValue',
        'name': 'Editorial Tier',
        'value': tier
      },
      {
        '@type': 'PropertyValue',
        'name': 'Government Alignment',
        'value': alignment
      }
    ]
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(metaTitle)}</title>
  <meta name="description" content="${safe(metaDesc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${safe(metaTitle)}">
  <meta property="og:description" content="${safe(metaDesc)}">
  <meta property="og:image" content="https://tracenews.ng/og-default.png">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="TraceNews">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safe(metaTitle)}">
  <meta name="twitter:description" content="${safe(metaDesc)}">
  <meta name="twitter:image" content="https://tracenews.ng/og-default.png">
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <h1>${safe(outlet.name)}</h1>
  <p>${safe(metaDesc)}</p>
  <p>Independence score: ${score}/100 — ${safe(tier)} tier</p>
  <p>Owned by: ${safe(outlet.ownership_name)}</p>
  <p>Government alignment: ${safe(alignment)}</p>
  <a href="${canonical}">View full analysis on TraceNews</a>
</body>
</html>`
  
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
  return res.status(200).send(html)
}
