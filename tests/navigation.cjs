const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Node {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.dataset = {}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = nodes; }
  setAttribute(k, v) { this.attributes[k] = v; }
  removeAttribute(k) { delete this.attributes[k]; }
  hasAttribute(k) { return Object.hasOwn(this.attributes, k); }
  addEventListener() {}
  focus() {}
}
async function setup(data, hash = '#work', article = false, fail = false) {
  const main = new Node('main'), theme = new Node('button');
  if (article) main.setAttribute('data-article', '');
  const links = ['work', 'life'].map(category => { const n = new Node('a'); n.dataset.category = category; return n; });
  const document = { documentElement: new Node('html'), createElement: tag => new Node(tag),
    querySelector: selector => selector === 'main' ? main : selector === '#theme' ? theme : new Node('a'), querySelectorAll: () => links };
  let fetches = 0;
  const context = { document, URLSearchParams, location: { hash, replace(url) { this.redirect = url; } },
    localStorage: { getItem() {}, setItem() {} }, matchMedia: () => ({ matches: false, addEventListener() {} }),
    window: { addEventListener() {}, scrollTo() {} }, fetch: async () => { fetches++; return { ok: !fail, json: async () => data }; } };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('app.js', 'utf8'), context);
  await new Promise(resolve => setImmediate(resolve));
  return { main, context, fetches, render(hash) { context.location.hash = hash; vm.runInContext('render()', context); } };
}
function find(node, predicate) { return [node, ...node.children.flatMap(child => find(child, predicate))].filter(predicate); }
const rows = Array.from({ length: 1003 }, (_, i) => ({ category: 'work', slug: `note-${String(i).padStart(4, '0')}`, title: `Note ${i}`, date: '2026-09-30', summary: 'summary', url: `/content/work/note-${i}.html` }));
(async () => {
  const app = await setup([...rows].reverse().concat({ ...rows[0], category: 'life', slug: 'life', url: '/content/life/life.html' }));
  const entries = () => find(app.main, n => n.tag === 'li');
  assert.equal(entries().length, 20);
  assert.equal(entries()[0].children[0].href, '/content/work/note-0.html');
  assert.equal(find(app.main, n => n.href === '#work?page=2').length, 1);
  app.render('#work?page=51'); assert.equal(entries().length, 3);
  app.render('#work?page=9999'); assert.equal(entries().length, 3);
  for (const page of ['-2', 'NaN', '1.5', 'Infinity']) { app.render(`#work?page=${page}`); assert.equal(entries().length, 20); }
  app.render('#life'); assert.equal(entries().length, 1); assert.equal(find(app.main, n => n.className === 'pagination').length, 0);
  app.render('#work/note-0007'); assert.equal(app.context.location.redirect, '/content/work/note-7.html');
  app.render('#work/missing'); assert.equal(find(app.main, n => n.textContent === '文章未找到').length, 1);
  assert.equal((await setup(rows, '#work', true)).fetches, 0);
  const empty = await setup([]); assert.equal(find(empty.main, n => n.textContent === '文章陆续更新。').length, 1);
  const failed = await setup([], '#work', false, true); assert.equal(find(failed.main, n => n.textContent === '暂时无法加载文章').length, 1);
  const template = fs.readFileSync('posts.json', 'utf8');
  assert.ok(!template.includes('entry.content')); assert.ok(!template.includes('markdownify'));
  console.log('Passed: 1,003-article pagination, route bounds, categories, old links, empty/error states, no article-page index fetch, metadata-only index.');
})().catch(error => { console.error(error); process.exitCode = 1; });
