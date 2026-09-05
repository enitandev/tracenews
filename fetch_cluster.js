async function main() {
  const url = 'https://uvicorn-appmain-production-79c6.up.railway.app/clusters/most-carried?category=Entertainment&limit=1';
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data.clusters[0], null, 2));
}
main().catch(console.error);
