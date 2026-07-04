import { createClient } from 
  '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Single source of truth for bot UAs
// Used identically by middleware.js
// and this function
export const BOT_USER_AGENTS = [
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

// Shared description truncation logic
// Must match Story.jsx exactly
function truncateDesc(raw, maxLen = 155) {
  const clean = (raw || '')
    .replace(/<[^>]+>/g, '')
    .replace(
      /\s*read more\s+.{0,80}\.{3}$/i, 
      ''
    )
    .replace(/\s*read more\.{3}$/i, '')
    .replace(/\s*read more$/i, '')
    .trim()
  if (clean.length <= maxLen) 
    return clean
  const truncated = clean
    .substring(0, maxLen)
  return truncated.substring(
    0, 
    Math.min(
      truncated.length,
      truncated.lastIndexOf(' ')
    )
  ) + '...'
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
  const { slug } = req.query
  
  const ua = (
    req.headers['user-agent'] || ''
  ).toLowerCase()
  
  const isBot = BOT_USER_AGENTS
    .some(bot => ua.includes(bot))
  
  if (!isBot) {
    // Human traffic — return SPA shell
    const response = await fetch(
      'https://tracenews.ng/'
    )
    const html = await response.text()
    res.setHeader(
      'Content-Type', 
      'text/html'
    )
    return res.status(200).send(html)
  }
  
  // Bot traffic — serve full HTML
  // with story-specific meta + schema
  const { data: clusters } = 
    await supabase
      .from('clusters')
      .select(
        'id, representative_title, ' +
        'first_seen_at, slug'
      )
      .eq('slug', slug)
      .limit(1)
  
  if (!clusters || !clusters.length) {
    return res.redirect(
      302, 'https://tracenews.ng'
    )
  }
  
  const cluster = clusters[0]
  
  // Fetch stories for image + summary
  // Matches Story.jsx derivation logic
  const { data: stories } = 
    await supabase
      .from('stories')
      .select('image_url, summary')
      .eq('cluster_id', cluster.id)
      .limit(10)
  
  const canonical = 
    `https://tracenews.ng/story/${slug}`
  
  // Image: first real story image,
  // not a logo, falls back to OG card
  const metaImage = (stories || [])
    .map(s => s.image_url)
    .find(img => img && 
      !img.includes('logo') && 
      img.startsWith('http')
    ) || 
    'https://tracenews.ng/og-default.png'
  
  // Description: first usable summary,
  // truncated at word boundary ~155 chars
  const firstSummary = (stories || [])
    .map(s => s.summary || '')
    .find(s => s.length > 20) || 
    'See every side of every ' +
    'Nigerian news story on TraceNews.'
  const metaDesc = truncateDesc(
    firstSummary
  )
  
  const metaTitle = 
    `${cluster.representative_title}` +
    ` | TraceNews`
  
  // NewsArticle JSON-LD
  // Must match Story.jsx jsonLd exactly
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': 
      cluster.representative_title,
    'datePublished': 
      cluster.first_seen_at || 
      new Date().toISOString(),
    'dateModified': 
      cluster.first_seen_at || 
      new Date().toISOString(),
    'image': [metaImage],
    'author': [{
      '@type': 'Organization',
      'name': 'TraceNews',
      'url': 'https://tracenews.ng/'
    }],
    'publisher': {
      '@type': 'Organization',
      'name': 'TraceNews',
      'logo': {
        '@type': 'ImageObject',
        'url': 
          'https://tracenews.ng/logo.png'
      }
    },
    'description': metaDesc,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonical
    }
  }
  
  // Return complete HTML at the 
  // ORIGINAL URL — no redirect,
  // no meta-refresh
  // Bot sees full story content
  // at /story/:slug permanently
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(metaTitle)}</title>
  <meta name="description" 
    content="${safe(metaDesc)}">
  <link rel="canonical" 
    href="${canonical}">
  <meta property="og:type" 
    content="article">
  <meta property="og:title" 
    content="${safe(metaTitle)}">
  <meta property="og:description" 
    content="${safe(metaDesc)}">
  <meta property="og:image" 
    content="${metaImage}">
  <meta property="og:url" 
    content="${canonical}">
  <meta property="og:site_name" 
    content="TraceNews">
  <meta name="twitter:card" 
    content="summary_large_image">
  <meta name="twitter:title" 
    content="${safe(metaTitle)}">
  <meta name="twitter:description" 
    content="${safe(metaDesc)}">
  <meta name="twitter:image" 
    content="${metaImage}">
  <meta property="article:published_time"
    content="${cluster.first_seen_at || 
      new Date().toISOString()}">
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>
</head>
<body>
  <h1>${safe(
    cluster.representative_title
  )}</h1>
  <p>${safe(metaDesc)}</p>
  <a href="${canonical}">
    Read full coverage on TraceNews
  </a>
</body>
</html>`
  
  res.setHeader(
    'Content-Type', 
    'text/html; charset=utf-8'
  )
  res.setHeader(
    'Cache-Control',
    'public, max-age=900, ' +
    'stale-while-revalidate=3600'
  )
  return res.status(200).send(html)
}
