with open('middleware.js', 'r') as f:
    content = f.read()

# "After the /topics/ block and before the static pages block"
# The static pages block starts with "if (STATIC_PAGES[staticMatch]) {" or similar, or "const staticMatch = url.pathname.slice(1)"

topics_block = r"""      return new Response(null, { headers: { 'x-middleware-next': '1' } })
    }
  }
}"""

outlet_block = """

if (url.pathname.startsWith('/outlets/')) {
  const outletSlug = url.pathname.replace('/outlets/', '')
  if (outletSlug) {
    const apiUrl = new URL(request.url)
    apiUrl.pathname = '/api/outlet-og'
    apiUrl.search = `?slug=${outletSlug}`
    
    try {
      const apiResponse = await fetch(apiUrl.toString(), { headers: { 'user-agent': ua } })
      const html = await apiResponse.text()
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
        }
      })
    } catch (error) {
      console.error('outlet-og proxy failed:', error.message)
      return new Response(null, {
        headers: {
          'x-middleware-next': '1'
        }
      })
    }
  }
}
"""

# Find the end of the topics block.
# Actually let's search for the exact static match block
parts = content.split("const staticMatch = url.pathname.slice(1)")

if len(parts) == 2:
    new_content = parts[0] + outlet_block.strip() + "\n\n  const staticMatch = url.pathname.slice(1)" + parts[1]
    with open('middleware.js', 'w') as f:
        f.write(new_content)
else:
    print("Could not find staticMatch")

