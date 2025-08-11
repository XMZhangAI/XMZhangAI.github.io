import fs from 'node:fs/promises';

const author = process.env.SCHOLAR_AUTHOR_ID || 'zP5k9lsAAAAJ'; // your Google Scholar author id
const key    = process.env.SERPAPI_KEY;

if (!key) {
  console.error('[update-metrics] Missing SERPAPI_KEY in environment.');
  process.exit(1);
}

const url = `https://serpapi.com/search.json?engine=google_scholar_author&author_id=${author}&api_key=${key}`;

function pick(obj, pathArr, fallback=null){
  for(const path of pathArr){
    try{
      const val = path.split('.').reduce((o,k)=>o?.[k], obj);
      if(val !== undefined && val !== null) return val;
    }catch(_){}
  }
  return fallback;
}

try {
  const r = await fetch(url);
  if(!r.ok){
    throw new Error(`[update-metrics] SerpAPI error: ${r.status} ${r.statusText}`);
  }
  const data = await r.json();

  // Robust parsing across possible SerpAPI schema variants
  const citations = pick(data, [
    'cited_by.table.0.citations.all',
    'cited_by.table.0.cited_by.all',
    'cited_by.value',
    'author.cited_by.all',
    'author.cited_by.value'
  ], null);

  const hindex = pick(data, [
    'cited_by.table.1.h_index.all',
    'author.h_index',
    'author.h_index.value'
  ], null);

  const out = {
    citations: (typeof citations === 'number') ? citations : Number(citations),
    hindex: (typeof hindex === 'number') ? hindex : (hindex==null?null:Number(hindex)),
    updated: new Date().toISOString()
  };

  await fs.writeFile('metrics.json', JSON.stringify(out, null, 2));
  console.log('[update-metrics] Wrote metrics.json:', out);
} catch (err) {
  console.error('[update-metrics] Failed:', err);
  process.exit(1);
}
