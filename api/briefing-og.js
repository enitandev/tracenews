import { createClient } from '@supabase/supabase-js'
import { BOT_USER_AGENTS, truncateDesc, safe } from './story-og.js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Bot HTML for /daily-briefing/:slug, built like story-og. Replaces the
// Railway Chrome prerender, which this page type was the only content
// reason for. Data comes from the same public API the page itself uses.
const API_BASE =
  process.env.VITE_API_URL ||
  'https://uvicorn-appmain-production-79c6.up.railway.app'

export default async function handler(req, res) {
  const { slug } = req.query

  const ua = (req.headers['user-agent'] || '').toLowerCase()
  const isBot = BOT_USER_AGENTS.some(bot => ua.includes(bot))

  if (!isBot) {
    // Human traffic — return SPA shell
    const response = await fetch('https://tracenews.ng/')
    const html = await response.text()
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
  }

  let briefing = null
  try {
    const apiRes = await fetch(
      `${API_BASE}/daily-briefing/${encodeURIComponent(slug || '')}`
    )
    if (apiRes.ok) briefing = await apiRes.json()
  } catch (error) {
    console.error('briefing-og fetch failed:', error.message)
  }

  const cluster = briefing && briefing.cluster
  if (!cluster || !cluster.representative_title) {
    return res.redirect(302, 'https://tracenews.ng/daily-briefing')
  }

  const canonical = `https://tracenews.ng/daily-briefing/${encodeURIComponent(slug)}`

  const metaImage =
    [briefing.image_url, ...(briefing.stories || []).map(s => s.image_url)]
      .find(img => img && !img.includes('logo') && img.startsWith('http')) ||
    'https://tracenews.ng/og-default.png'

  // The outlets' own article summaries, read exactly as story-og reads them
  // (the briefing payload carries titles only)
  const { data: summaries } = await supabase
    .from('stories')
    .select('summary')
    .eq('cluster_id', cluster.id)
    .limit(10)
  const firstSummary =
    (summaries || [])
      .map(s => s.summary || '')
      .find(s => s.length > 20) ||
    'See every side of every Nigerian news story on TraceNews.'
  const metaDesc = truncateDesc(firstSummary)

  const metaTitle = `${cluster.representative_title} | TraceNews Briefing`
  const published = cluster.first_seen_at || new Date().toISOString()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'headline': cluster.representative_title,
    'datePublished': published,
    'dateModified': published,
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
        'url': 'https://tracenews.ng/logo.png'
      }
    },
    'description': metaDesc,
    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonical }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(metaTitle)}</title>
  <meta name="description" content="${safe(metaDesc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safe(metaTitle)}">
  <meta property="og:description" content="${safe(metaDesc)}">
  <meta property="og:image" content="${safe(metaImage)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="TraceNews">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safe(metaTitle)}">
  <meta name="twitter:description" content="${safe(metaDesc)}">
  <meta name="twitter:image" content="${safe(metaImage)}">
  <meta property="article:published_time" content="${published}">
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd)}
  </script>
</head>
<body>
  <h1>${safe(cluster.representative_title)}</h1>
  <p>${safe(metaDesc)}</p>
  <a href="${canonical}">Read the full briefing on TraceNews</a>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=3600')
  return res.status(200).send(html)
}
