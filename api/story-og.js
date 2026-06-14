import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { slug } = req.query
  
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
  
  const ua = (req.headers['user-agent'] || '').toLowerCase()
  
  const isCrawler = crawlers.some(bot => ua.includes(bot))
  
  if (!isCrawler) {
    res.redirect(302, `https://tracenews.ng/story/${slug}`)
    return
  }
  
  const { data: clusters } = await supabase
    .from('clusters')
    .select('id, representative_title')
    .eq('slug', slug)
    .limit(1)
  
  if (!clusters || !clusters.length) {
    res.redirect(302, 'https://tracenews.ng')
    return
  }
  
  const cluster = clusters[0]
  const { data: stories } = await supabase
    .from('stories')
    .select('image_url, summary')
    .eq('cluster_id', cluster.id)
    .not('image_url', 'is', null)
    .limit(1)
  
  const title = cluster.representative_title
  const canonical = `https://tracenews.ng/story/${slug}`
  
  let image_url = 'https://tracenews.ng/og-default.png'
  let description = 'See every side of every Nigerian news story on TraceNews.'
  
  if (stories && stories.length) {
    image_url = stories[0].image_url || image_url
    const raw = stories[0].summary || ''
    const clean = raw
      .replace(/<[^>]+>/g, '')
      .trim()
      .slice(0, 160)
    if (clean) description = clean
  }
  
  const safe = s => s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${safe(title)}</title>
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safe(title)}">
  <meta property="og:description" content="${safe(description)}">
  <meta property="og:image" content="${image_url}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="TraceNews">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safe(title)}">
  <meta name="twitter:description" content="${safe(description)}">
  <meta name="twitter:image" content="${image_url}">
  <meta http-equiv="refresh" content="0;url=${canonical}">
</head>
<body>
  <a href="${canonical}">
    ${safe(title)}
  </a>
</body>
</html>`
  
  res.setHeader('Content-Type', 'text/html')
  res.status(200).send(html)
}
