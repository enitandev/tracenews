import { createClient } from 
  '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Must match BOT_USER_AGENTS in 
// api/story-og.js and middleware.js
const BOT_USER_AGENTS = [
  'googlebot', 'gptbot', 'claudebot',
  'perplexitybot', 'ccbot', 'bingbot',
  'twitterbot', 'facebookexternalhit',
  'linkedinbot', 'slackbot', 'applebot',
  'yahoo! slurp', 'duckduckbot',
  'baiduspider', 'yandexbot',
  'whatsapp', 'telegrambot', 'discordbot'
]

const CATEGORY_META = {
  Politics: 'Track how Nigerian media covers politics — bias, silences, and coverage gaps across government-aligned and watchdog outlets.',
  Security: 'See how Nigerian media covers security — banditry, terrorism, and police accountability across all editorial tiers.',
  Economy: 'Monitor Nigerian business and economy coverage — who reports on fiscal policy, inflation, and corporate accountability.',
  Sports: 'Nigerian sports news coverage across all major outlets — football, athletics, and more.',
  Health: 'Health and medical coverage in Nigerian media — disease, policy, and accountability reporting.',
  Entertainment: 'Nigerian entertainment news tracked across outlets.',
  Technology: 'Nigerian tech and innovation coverage across media.',
  Education: 'Education policy and school news coverage in Nigerian media.',
  International: 'How Nigerian outlets cover international news and foreign affairs.',
  Judiciary: 'Court cases, legal accountability, and judicial coverage in Nigerian media.',
  Religion: 'Religious affairs coverage across Nigerian media outlets.'
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
    const response = await fetch(
      'https://tracenews.ng/'
    )
    const html = await response.text()
    res.setHeader('Content-Type', 'text/html')
    return res.status(200).send(html)
  }
  
  // Capitalize first letter for 
  // category name matching
  const categoryName = slug
    ? slug.charAt(0).toUpperCase() + 
      slug.slice(1).toLowerCase()
    : ''
  
  const canonical = 
    `https://tracenews.ng/topics/${slug}`
  
  const metaDesc = CATEGORY_META[
    categoryName
  ] || `See how Nigerian media covers ` +
    `${categoryName} — track bias, ` +
    `silences and coverage gaps on TraceNews.`
  
  const metaTitle = 
    `${categoryName} News Coverage ` +
    `Analysis | TraceNews`
  
  // Fetch top story image for this 
  // category for og:image
  let metaImage = 
    'https://tracenews.ng/og-default.png'
  
  try {
    const { data: clusters } = 
      await supabase
        .from('clusters')
        .select('id')
        .eq('category', categoryName)
        .order('outlet_count', { 
          ascending: false 
        })
        .limit(1)
    
    if (clusters && clusters.length) {
      const { data: stories } = 
        await supabase
          .from('stories')
          .select('image_url')
          .eq('cluster_id', clusters[0].id)
          .not('image_url', 'is', null)
          .limit(5)
      
      const realImage = (stories || [])
        .map(s => s.image_url)
        .find(img => img && 
          !img.includes('logo') && 
          img.startsWith('http')
        )
      
      if (realImage) metaImage = realImage
    }
  } catch (e) {
    // fallback to default image
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
</head>
<body>
  <h1>${safe(metaTitle)}</h1>
  <p>${safe(metaDesc)}</p>
  <a href="${canonical}">
    Read ${safe(categoryName)} news 
    on TraceNews
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
