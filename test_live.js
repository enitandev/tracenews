async function main() {
  const resTop = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/landing?limit=15');
  const dataTop = await resTop.json();
  const resFeed = await fetch('https://uvicorn-appmain-production-79c6.up.railway.app/clusters/feed?offset=15&limit=65');
  const dataFeed = await resFeed.json();
  
  const clusters = [...(dataTop.clusters || []), ...(dataFeed.clusters || [])];
  
  const categories = {};
  clusters.slice(14).forEach(c => {
    if (!c || !c.image_url) return;
    const catName = c.category || 'General';
    if (!categories[catName]) categories[catName] = [];
    categories[catName].push(c);
  });
  
  const validCategories = Object.keys(categories).filter(cat => categories[cat].length >= 3);
  
  const leads = ['Politics', 'Security'];
  const compacts = ['Technology', 'Religion', 'Niger Delta'];
  const availableLeads = validCategories.filter(c => leads.includes(c));
  const availableStandards = validCategories.filter(c => !leads.includes(c) && !compacts.includes(c));
  
  const ordered = [];
  if (availableLeads.length > 0) ordered.push({ cat: availableLeads.shift(), type: 'LEAD' });
  for (let i=0; i<3; i++) { if (availableStandards.length > 0) ordered.push({ cat: availableStandards.shift(), type: 'STANDARD' }); }
  if (availableLeads.length > 0) ordered.push({ cat: availableLeads.shift(), type: 'LEAD' });
  for (let i=0; i<3; i++) { if (availableStandards.length > 0) ordered.push({ cat: availableStandards.shift(), type: 'STANDARD' }); }
  
  console.log('Categories requiring rails:', ordered.map(o => o.cat));
  
  let count2 = 0;
  let count1 = 0;
  let count0 = 0;
  
  for (const section of ordered) {
    const stories = categories[section.cat] || [];
    const mainIds = new Set(stories.map(s => s.id));
    
    const railRes = await fetch(`https://uvicorn-appmain-production-79c6.up.railway.app/clusters/most-carried?category=${encodeURIComponent(section.cat)}&limit=6`);
    const railData = await railRes.json();
    const railClusters = railData.clusters || [];
    
    const filtered = railClusters.filter(c => !mainIds.has(c.id));
    const finalCount = Math.min(2, filtered.length);
    
    console.log(`- ${section.cat}: ${finalCount} rail cards`);
    if (finalCount === 2) count2++;
    else if (finalCount === 1) count1++;
    else count0++;
  }
  
  console.log(`\nTotals:`);
  console.log(`2 cards: ${count2}`);
  console.log(`1 card: ${count1}`);
  console.log(`0 cards: ${count0}`);
}

main().catch(console.error);
