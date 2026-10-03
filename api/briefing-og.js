import { BRIEFING_PUBLIC } from '../src/constants/features.js'
import { BOT_USER_AGENTS, truncateDesc, safe } from './story-og.js'

// Crawler and link-preview HTML for /daily-briefing/:slug. It reads the same
// API item as the page and uses the same text: the story title, the
// "AI-generated summary of the sources" label and the summary itself
// (counsel, 3 Oct 2026, B7). Off, with 404, while BRIEFING_PUBLIC is false.
const API_BASE =
  process.env.VITE_API_URL ||
  'https://uvicorn-appmain-production-79c6.up.railway.app'

export default async function handler(req, res) {
  if (!BRIEFING_PUBLIC) {
    res.setHeader('X-Robots-Tag', 'noindex')
    return res.status(404).send('Not found')
  }
  const { slug } = req.query
  const ua = (req.headers['user-agent'] || '').toLowerCase()
  if (!BOT_USER_AGENTS.some(bot => ua.includes(bot))) {
    const html = await (await fetch('https://tracenews.ng/')).text()
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
  }

  const apiRes = await fetch(`${API_BASE}/daily-briefing/${encodeURIComponent(slug || '')}`)
  if (!apiRes.ok) {
    res.setHeader('X-Robots-Tag', 'noindex')
    return res.status(404).send('Not found')
  }
  const { item, ui } = await apiRes.json()
  const bullets = (item.bullets || []).filter(b => typeof b === 'string')
  const title = `${item.title} | ${ui.title} | TraceNews`
  const desc = truncateDesc(`${ui.attribution_label}: ${bullets.join(' ')}`)
  const canonical = `https://tracenews.ng/daily-briefing/${item.slug}`
  const image = item.image_url || 'https://tracenews.ng/og-default.png'

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${safe(title)}</title>
  <meta name="description" content="${safe(desc)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safe(title)}">
  <meta property="og:description" content="${safe(desc)}">
  <meta property="og:image" content="${safe(image)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="TraceNews">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safe(title)}">
  <meta name="twitter:description" content="${safe(desc)}">
  <meta name="twitter:image" content="${safe(image)}">
</head>
<body>
  <h1>${safe(item.title)}</h1>
  <p>${safe(ui.attribution_label)}</p>
  <ul>${bullets.map(b => `<li>${safe(b)}</li>`).join('')}</ul>
  <a href="${canonical}">Read on TraceNews</a>
</body>
</html>`
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=900, stale-while-revalidate=3600')
  return res.status(200).send(html)
}
