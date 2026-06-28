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

const DATA_SINCE = "22 June 2026"
const SMALL_N_THRESHOLD = 25

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

function tierText(name, dist, total) {
  if (!total || total < SMALL_N_THRESHOLD) {
    return `Mentioned in ${total || 0} ` +
      `stories tracked by TraceNews ` +
      `since ${DATA_SINCE}.`
  }
  const g = dist?.pro_establishment || 0
  const m = dist?.institutional || 0
  const w = dist?.adversarial || 0
  const pct = (n) => 
    Math.round((n / total) * 100)
  return (
    `Of ${total} stories mentioning ` +
    `${name} since ${DATA_SINCE}, ` +
    `${pct(g)}% appeared in ` +
    `government-aligned outlets, ` +
    `${pct(m)}% in mainstream outlets, ` +
    `and ${pct(w)}% in watchdog outlets.`
  )
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

  const { data: politicians } =
    await supabase
      .from('politicians')
      .select(
        'full_name, common_name, ' +
        'slug, party, state, ' +
        'current_position, category, ' +
        'wikipedia_image_url'
      )
      .eq('slug', slug)
      .eq('active', true)
      .limit(1)

  if (!politicians || 
      !politicians.length) {
    return res.redirect(
      302, 'https://tracenews.ng'
    )
  }

  const p = politicians[0]
  const name = p.common_name || 
    p.full_name
  const canonical =
    `https://tracenews.ng` +
    `/politicians/${slug}`

  const metaTitle =
    `${name} — Media Coverage ` +
    `Record | TraceNews`

  const metaDesc =
    `How Nigerian media has covered ` +
    `stories mentioning ${name}, ` +
    `as recorded by TraceNews since ` +
    `${DATA_SINCE}. This page ` +
    `describes coverage behaviour, ` +
    `not the person.`

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
