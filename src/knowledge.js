const fs = require('fs');
const path = require('path');

function defaultDir() {
  if (process.env.LOCAL_KNOWLEDGE_DIR) return fs.existsSync(process.env.LOCAL_KNOWLEDGE_DIR) ? process.env.LOCAL_KNOWLEDGE_DIR : '';
  const candidates = [
    path.resolve(process.cwd(), '..', '任德耀新建华为PC知识库', '华为PC全板块深度知识库_v7'),
    path.resolve(process.cwd(), '..', '华为PC全板块深度知识库_v7')
  ].filter(Boolean);
  return candidates.find(dir => fs.existsSync(dir)) || '';
}
function allowed(file) {
  const normalized = file.replaceAll('\\', '/');
  return !/(P4|90-待审核|99-历史归档|机密|价格政策库|待审核|历史归档)/.test(normalized);
}
function collectFiles(root) {
  if (!root || !fs.existsSync(root)) return [];
  const out = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (allowed(full)) walk(full); }
      else if (entry.isFile() && /\.md$/i.test(entry.name) && allowed(full)) out.push(full);
    }
  }
  walk(root); return out;
}
function localSearch(query, dir) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = [];
  for (const file of collectFiles(dir)) {
    const text = fs.readFileSync(file, 'utf8');
    const lower = text.toLowerCase();
    const score = terms.reduce((n, term) => n + (lower.includes(term) ? 1 : 0), 0) + (path.basename(path.dirname(file)).toLowerCase() === query.toLowerCase() && path.basename(file) === '产品事实.md' ? 100 : 0);
    if (score) hits.push({ id: `local:${path.relative(dir, file)}`, title: path.basename(file, '.md'), highlight: text.slice(0, 900), file, score, source: 'local' });
  }
  return hits.sort((a, b) => b.score - a.score);
}
module.exports = { defaultDir, localSearch, allowed };
