with open("src/pages/Category.jsx", "r") as f:
    content = f.read()

# Replace offset state
content = content.replace(
    "const [offset, setOffset] = useState(0);",
    "const [offset, setOffset] = useState(0);\n  const [displayCount, setDisplayCount] = useState(7);"
)

# Replace loadMore function
old_loadMore = """  const loadMore = () => {
    const nextOffset = offset + 7;
    fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/categories/${categoryName}/feed?limit=7&offset=${nextOffset}`)
      .then(res => res.json())
      .then(d => {
        setData(prev => ({
          ...prev,
          stories: [...prev.stories, ...d.stories]
        }));
        setOffset(nextOffset);
      });
  };"""

new_loadMore = """  const loadMore = () => {
    const nextCount = displayCount + 7;
    const currentStories = data ? data.stories : [];
    
    if (nextCount > currentStories.length) {
      // We've exhausted local stories, fetch more from API
      const nextOffset = offset + currentStories.length;
      fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/categories/${categoryName}/feed?limit=30&offset=${nextOffset}`)
        .then(res => res.json())
        .then(d => {
          setData(prev => ({
            ...prev,
            stories: [...prev.stories, ...d.stories]
          }));
          setOffset(nextOffset);
        });
    }
    setDisplayCount(nextCount);
  };"""

content = content.replace(old_loadMore, new_loadMore)

# Replace displayStories logic at line 93
old_displayStories = """  // Only show up to 7 compact stories
  const displayStories = stories ? stories.slice(0, 7) : [];"""

new_displayStories = """  const displayStories = stories ? stories.slice(0, displayCount) : [];
  const hasMore = stories ? displayCount < stories.length : false;
  // Can load more if we have local stories left to show, OR if we fetched exactly 30 from the backend (meaning there might be more on the server)
  const canLoadMore = hasMore || (stories && stories.length >= 30);"""

content = content.replace(old_displayStories, new_displayStories)

# Replace the button rendering condition
old_button = """            <button onClick={loadMore} style={{ 
              width: '100%', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', marginTop: '20px'
            }}>
              Load more
            </button>"""

new_button = """            {canLoadMore && (
              <button onClick={loadMore} style={{ 
                width: '100%', padding: '16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', marginTop: '20px'
              }}>
                Load more
              </button>
            )}"""

content = content.replace(old_button, new_button)

with open("src/pages/Category.jsx", "w") as f:
    f.write(content)
