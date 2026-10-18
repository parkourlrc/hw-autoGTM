'use strict';
const $ = id => document.getElementById(id);
const form = $('task'); let current; let rules;
function el(tag, text, className) { const node = document.createElement(tag); if (text !== undefined) node.textContent = text; if (className) node.className = className; return node; }
function put(id, children) { $(id).replaceChildren(...children); $(id).classList.remove('placeholder'); }
async function api(url, data) { const res = await fetch(url, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}); const value = await res.json(); if (!res.ok) throw new Error(value.error || '请求失败'); return value; }
function limits() { const [min, max] = rules[form.elements.platform.value]; Object.assign(form.elements.imageCount, { min, max }); form.elements.imageCount.value = min; }
function loadDemo(demo) { for (const [key, value] of Object.entries(demo)) if (form.elements[key]) form.elements[key].value = value; limits(); form.elements.imageCount.value = demo.imageCount; }
function draftText() { return `${current.article.label}\n未实时ima认证 · 不可正式交付\n\n${current.article.title}\n\n${current.article.paragraphs.join('\n\n')}\n\n来源：${current.knowledge.evidence.map(e => e.reference).join('；')}`; }
function render(r) {
  current = r;
  put('scene', [el('p', r.scene.audience + ' · ' + r.scene.situation), el('p', r.scene.strategy), el('p', '目标：' + r.scene.goal)]);
  const evidence = [el('p', r.knowledge.mode === 'ima' ? 'ima 搜索结果 · 完整取证未完成' : '本地授权开发资料 · 未实时 ima 认证', 'badge')];
  for (const e of r.knowledge.evidence) { const d = el('details'); d.append(el('summary', `[${e.id}] ${e.title}`), el('p', e.reference), el('pre', e.content)); evidence.push(d); }
  if (!r.knowledge.evidence.length) evidence.push(el('p', '无可用证据，已停止生成。'));
  put('knowledge', evidence);
  const article = [];
  if (r.article) { article.push(el('p', r.article.label + ' · 不可正式交付', 'badge'), el('h3', r.article.title), ...r.article.paragraphs.map(p => el('p', p, 'copy'))); const gallery = el('div', undefined, 'gallery'); for (const image of r.article.images) { const figure = el('figure'); const img = el('img'); img.src = image.url; img.alt = image.caption; img.loading = 'lazy'; figure.append(img, el('figcaption', image.caption + ' · 授权待复核')); gallery.append(figure); } article.push(gallery); }
  else article.push(el('p', '门禁已阻止写作，请补充或澄清证据后重试。'));
  put('article', article);
  put('verification', [el('p', r.verification.status === 'draft' ? '草稿可审阅 · 正式交付未完成' : '存在阻断项 · 不可交付', 'badge'), ...r.verification.checks.map(c => el('p', `${c.passed ? '✓' : '✕'} ${c.name}：${c.detail}`, c.passed ? 'pass' : 'fail')), ...r.verification.limitations.map(x => el('p', x, 'muted'))]);
  $('version').textContent = `${r.version} · ${r.id}\n${r.trace.map(t => `${t.node}: ${t.implementation}`).join(' → ')}`;
  $('copy').disabled = $('download').disabled = !r.article;
  document.querySelectorAll('[data-feedback]').forEach(b => { b.disabled = false; });
}
async function generate(demoCase) {
  if (!form.reportValidity()) return;
  const input = Object.fromEntries(new FormData(form)); input.imageCount = Number(input.imageCount); if (demoCase) input.case = demoCase;
  const buttons = form.querySelectorAll('button'); buttons.forEach(b => { b.disabled = true; });
  $('message').textContent = '正在检索、生成并核验；真实模型调用可能需要数十秒…';
  try { const result = await api('/api/generate', input); render(result); $('message').textContent = result.article ? '生成完成。请查看来源、图片与核验限制。' : '已触发证据门禁，未生成文章。'; }
  catch (error) { $('message').textContent = `生成失败：${error.message}。模型错误不会自动切换模板；下方如有内容，为上一次结果。`; }
  finally { buttons.forEach(b => { b.disabled = false; }); }
}
form.addEventListener('submit', event => { event.preventDefault(); generate(); });
document.querySelectorAll('[data-case]').forEach(b => b.addEventListener('click', () => generate(b.dataset.case)));
document.querySelectorAll('[data-feedback]').forEach(b => b.addEventListener('click', async () => { try { await api('/api/feedback', { runId: current.id, action: b.dataset.feedback, comment: $('comment').value }); $('message').textContent = '反馈已保存到本机。'; } catch (e) { $('message').textContent = e.message; } }));
$('copy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(draftText()); $('message').textContent = '已复制，包含不可交付标识与来源。'; } catch { $('message').textContent = '浏览器未允许剪贴板，请下载草稿。'; } });
$('download').addEventListener('click', () => { const url = URL.createObjectURL(new Blob([draftText()], { type: 'text/plain;charset=utf-8' })); const a = el('a'); a.href = url; a.download = `autoGTM-${current.id}.txt`; a.click(); URL.revokeObjectURL(url); });
api('/api/config').then(c => { rules = c.platforms; for (const name of Object.keys(rules)) { const option = el('option', name); option.value = name; form.elements.platform.append(option); } c.demos.forEach((d, i) => { const b = el('button', i ? '办公 · 公众号' : '学习 · 小红书'); b.type = 'button'; b.addEventListener('click', () => loadDemo(d)); $('demos').append(b); }); loadDemo(c.demos[0]); form.elements.platform.addEventListener('change', limits); $('config').textContent = `本地资料：${c.localAvailable ? '目录可用' : '未找到，请配置目录'} / 模型：${c.modelConfigured ? '已配置，连通性待调用验证' : '未配置'} / ima：${c.imaConfigured ? '已配置，连通性待调用验证' : '未配置'}。${c.execution}`; }).catch(e => { $('config').textContent = e.message; });
