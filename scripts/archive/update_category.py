with open("src/pages/Category.jsx", "r") as f:
    content = f.read()

# Add Skeleton components at the top (after imports)
skeletons = """
function SkeletonHeroStoryCard() {
  return (
    <div style={{ width: '100%', height: '340px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '24px', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
        <div style={{ width: '70%', height: '24px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '40%', height: '24px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '20px' }}></div>
        <div style={{ width: '100%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
    </div>
  );
}

function SkeletonStandardStoryItem() {
  return (
    <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ width: '30%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '90%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '70%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
      </div>
      <div style={{ width: '100px', height: '80px', background: 'var(--bg-hover)', borderRadius: '6px' }}></div>
    </div>
  );
}

function SkeletonSidebarCard() {
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', height: '150px' }}>
      <div style={{ width: '50%', height: '16px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '20px' }}></div>
      <div style={{ width: '100%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
      <div style={{ width: '80%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px', marginBottom: '12px' }}></div>
      <div style={{ width: '90%', height: '12px', background: 'var(--bg-hover)', borderRadius: '4px' }}></div>
    </div>
  );
}
"""

if "function SkeletonHeroStoryCard" not in content:
    content = content.replace("const CATEGORIES =", skeletons + "\nconst CATEGORIES =")

# FIX 1: Loading state
# Remove early return if (loading)
early_return_loading = """  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        Loading {categoryName} news...
      </div>
    );
  }"""
content = content.replace(early_return_loading, "")

# Replace `if (!data) return null;`
# Instead of returning null, we let the render method proceed but with fallback data.
# So we need to handle destructuring safely.
destructuring_block = """  if (!data) return null;

  const { total_cluster_count, top_stories, stories, covered_most_by, bias_breakdown } = data;

  const total = bias_breakdown.total || 1;
  const tiers = ['pro_establishment', 'institutional', 'adversarial'];
  const dominant = tiers.reduce((a,b) => bias_breakdown[a] > bias_breakdown[b] ? a : b);
  const pct = Math.round((bias_breakdown[dominant] || 0)/total*100);

  const biasSummary = pct > 50 ? 
    `${categoryName} is covered mostly by ${TIER_LABELS[dominant]} sources (${pct}%).` : 
    `Coverage of ${categoryName} is relatively balanced across tiers.`;

  const synthCoverageStats = {
    coverage_tier_distribution: {
      pro_establishment: bias_breakdown.pro_establishment || 0,
      institutional: bias_breakdown.institutional || 0,
      adversarial: bias_breakdown.adversarial || 0
    },
    total_coverage: bias_breakdown.total || 1
  };
  
  // Sort top_stories by outlet_count
  const sortedTopStories = top_stories ? [...top_stories].sort((a,b) => (b.outlet_count || 0) - (a.outlet_count || 0)) : [];
  const heroStory = sortedTopStories.length > 0 ? sortedTopStories[0] : null;
  const restTopStories = sortedTopStories.slice(1);
  
  const displayStories = stories ? stories.slice(0, displayCount) : [];
  const hasMore = stories ? displayCount < stories.length : false;
  const canLoadMore = hasMore || (stories && stories.length >= 30);"""

safe_destructuring = """  const total_cluster_count = data ? data.total_cluster_count : 0;
  const top_stories = data ? data.top_stories : null;
  const stories = data ? data.stories : null;
  const covered_most_by = data ? data.covered_most_by : [];
  const bias_breakdown = data ? data.bias_breakdown : { pro_establishment: 0, institutional: 0, adversarial: 0, total: 1 };

  // FIX 4: synthCoverageStats total mismatch
  const tierSum = (bias_breakdown.pro_establishment || 0) + (bias_breakdown.institutional || 0) + (bias_breakdown.adversarial || 0);
  const synthCoverageStats = {
    coverage_tier_distribution: {
      pro_establishment: bias_breakdown.pro_establishment || 0,
      institutional: bias_breakdown.institutional || 0,
      adversarial: bias_breakdown.adversarial || 0
    },
    total_coverage: tierSum || 1
  };

  let biasSummary = '';
  if (data && tierSum > 0) {
    const tiers = ['pro_establishment', 'institutional', 'adversarial'];
    const dominant = tiers.reduce((a,b) => (bias_breakdown[a] || 0) > (bias_breakdown[b] || 0) ? a : b);
    const pct = Math.round(((bias_breakdown[dominant] || 0) / tierSum) * 100);
    biasSummary = pct > 50 ? 
      `${categoryName} is covered mostly by ${TIER_LABELS[dominant]} sources (${pct}%).` : 
      `Coverage of ${categoryName} is relatively balanced across tiers.`;
  }

  const sortedTopStories = top_stories ? [...top_stories].sort((a,b) => (b.outlet_count || 0) - (a.outlet_count || 0)) : [];
  const heroStory = sortedTopStories.length > 0 ? sortedTopStories[0] : null;
  const restTopStories = sortedTopStories.slice(1);
  
  const displayStories = stories ? stories.slice(0, displayCount) : [];
  const hasMore = stories ? displayCount < stories.length : false;
  const canLoadMore = hasMore || (stories && stories.length >= 30);"""

content = content.replace(destructuring_block, safe_destructuring)

# FIX 2: Remove "Top {categoryName} News" header and fix follow button
follow_button_old = """          <button style={{ 
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            border: 'none', padding: '8px 24px', borderRadius: '20px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            Follow
          </button>"""

follow_button_new = """          <button style={{ 
            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
            border: '1px solid var(--border)', padding: '8px 24px', borderRadius: '20px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer'
          }}>
            Follow
          </button>"""
content = content.replace(follow_button_old, follow_button_new)

# Remove the H2 inside ZONE 1 and handle loading skeletons
zone1_old = """          {/* ZONE 1: Top Stories */}
          {heroStory && (
            <div style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                Top {categoryName} News
              </h2>
              
              <HeroStoryCard cluster={heroStory} />
              
              <div>
                {restTopStories.map(cluster => (
                  <StandardStoryItem key={cluster.id} cluster={cluster} />
                ))}
              </div>
              
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }}></div>
            </div>
          )}"""

zone1_new = """          {/* ZONE 1: Top Stories */}
          <div style={{ marginBottom: '48px' }}>
            {loading ? <SkeletonHeroStoryCard /> : (heroStory && <HeroStoryCard cluster={heroStory} />)}
            <div>
              {loading ? (
                Array(3).fill(null).map((_, i) => <SkeletonStandardStoryItem key={i} />)
              ) : restTopStories.map(cluster => (
                <StandardStoryItem key={cluster.id} cluster={cluster} />
              ))}
            </div>
            {(!loading && heroStory) && (
              <div style={{ height: '1px', background: 'var(--border)', margin: '32px 0' }}></div>
            )}
          </div>"""
content = content.replace(zone1_old, zone1_new)

# Apply skeletons to ZONE 3
zone3_old = """          {/* ZONE 3: Story List (Replaces CompactStoryItem with StandardStoryItem) */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
              Latest {categoryName} News
            </h2>
            {displayStories.map(cluster => (
              <StandardStoryItem key={cluster.id} cluster={cluster} />
            ))}"""

zone3_new = """          {/* ZONE 3: Story List */}
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
              Latest {categoryName} News
            </h2>
            {loading ? (
              Array(4).fill(null).map((_, i) => <SkeletonStandardStoryItem key={i} />)
            ) : displayStories.map(cluster => (
              <StandardStoryItem key={cluster.id} cluster={cluster} />
            ))}"""
content = content.replace(zone3_old, zone3_new)

# Sidebar skeletons
sidebar_old = """        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* CARD 1: Covered Most By */}"""

sidebar_new = """        {/* RIGHT COLUMN: Sidebar */}
        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading && (
            <>
              <SkeletonSidebarCard />
              <SkeletonSidebarCard />
              <SkeletonSidebarCard />
            </>
          )}

          {/* CARD 1: Covered Most By */}"""
content = content.replace(sidebar_old, sidebar_new)

# Hide real cards if loading
content = content.replace("{/* CARD 1: Covered Most By */}", "{/* CARD 1: Covered Most By */}\n          {!loading && (")
content = content.replace("</div>\n\n      </div>\n\n      {/* ZONE 4: Related Categories (Full Width Below) */}", "</div>\n          )}\n\n      </div>\n\n      {/* ZONE 4: Related Categories (Full Width Below) */}")


# FIX 3: Related Categories chips - remove pill wrapper
zone4_old = """              <Link to={`/topics/${topicCat.toLowerCase()}`} key={topicCat} style={{ 
                display: 'flex', alignItems: 'center', gap: '12px',
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                padding: '12px 20px 12px 12px', borderRadius: '32px', textDecoration: 'none', color: 'var(--text-primary)'
              }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0 }}>
                  {catHeroImage && <img src={catHeroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{topicCat}</span>
              </Link>"""

zone4_new = """              <Link to={`/topics/${topicCat.toLowerCase()}`} key={topicCat} style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '12px',
                textDecoration: 'none', color: 'var(--text-primary)'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-hover)', overflow: 'hidden', flexShrink: 0 }}>
                  {catHeroImage && <img src={catHeroImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {topicCat}
                </span>
              </Link>"""
content = content.replace(zone4_old, zone4_new)

with open("src/pages/Category.jsx", "w") as f:
    f.write(content)

