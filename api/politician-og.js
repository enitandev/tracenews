// Reads the same backend endpoint as the page, so the preview can only say
// what the page says, and held, private and no-data people are 404 here too.
const API = 'https://uvicorn-appmain-production-79c6.up.railway.app'

const BOT_USER_AGENTS = [
  'googlebot', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'bingbot',
  'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'slackbot', 'applebot',
  'yahoo! slurp', 'duckduckbot',
  'baiduspider', 'yandexbot',
  'whatsapp', 'telegrambot', 'discordbot'
]


const CATEGORY_DISPLAY = {
  Legislature: "Legislator",
  Governor: "Governor",
  Security: "Security official",
  Executive: "Executive official",
  Party: "Party official",
  Judiciary: "Judicial official",
  PowerBroker: "Political figure",
  CivilSociety: "Civil society figure",
  Traditional: "Traditional ruler",
  Business: "Business figure"
}

function safe(s) {
  return (s || '')
    .toString()
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
    const response = await fetch(
      'https://tracenews.ng/'
    )
    const html = await response.text()
    res.setHeader('Content-Type', 
      'text/html')
    return res.status(200).send(html)
  }

  const apiRes = await fetch(`${API}/politicians/${encodeURIComponent(slug || '')}`)
  if (!apiRes.ok) {
    res.setHeader('X-Robots-Tag', 'noindex')
    return res.status(404).send('Not found')
  }
  const data = await apiRes.json()
  const p = data.politician
  const name = p.common_name || 
    p.full_name
  const canonical =
    `https://tracenews.ng` +
    `/politicians/${slug}`

  const metaTitle =
    `${name} — Media Coverage ` +
    `Record | TraceNews`

  const c = data.article_counts || {}
  const metaDesc =
    `As of ${data.as_of}, TraceNews has recorded ${data.total_articles} articles ` +
    `that name ${name}: ${c.govt_aligned || 0} from government-aligned outlets, ` +
    `${c.mainstream || 0} from mainstream outlets and ${c.watchdog || 0} from watchdog outlets` +
    (c.untiered ? `, and ${c.untiered} from outlets not assigned a tier.` : '.') +
    ` This page describes coverage, not the person.`

  const categoryLabel =
    CATEGORY_DISPLAY[p.category] ||
    p.category || ''

  // Person JSON-LD — public record
  // identity only. No Rating/Review.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': name,
    'jobTitle': p.current_position,
    'affiliation': {
      '@type': 'Organization',
      'name': p.party
    },
    'url': canonical
  }

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
    content="website">
  <meta property="og:title"
    content="${safe(metaTitle)}">
  <meta property="og:description"
    content="${safe(metaDesc)}">
  <meta property="og:image"
    content="${p.wikipedia_image_url || 
      'https://tracenews.ng/og-default.png'}">
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
    content="${p.wikipedia_image_url || 
      'https://tracenews.ng/og-default.png'}">
  <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
  </script>
</head>
<body>
  <h1>${safe(name)}</h1>
  <p>${safe(p.current_position)}</p>
  <p>${safe(p.party)} · 
    ${safe(p.state)} · 
    ${safe(categoryLabel)}</p>
  <p>${safe(metaDesc)}</p>
  <a href="${canonical}">
    View coverage record on TraceNews
  </a>
</body>
</html>`

  res.setHeader(
    'Content-Type',
    'text/html; charset=utf-8'
  )
  res.setHeader(
    'Cache-Control',
    'public, max-age=3600, ' +
    'stale-while-revalidate=86400'
  )
  return res.status(200).send(html)
}
