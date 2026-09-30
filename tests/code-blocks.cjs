const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
class Node {
  constructor(tag, text = '') { this.tag = tag; this.textContent = text; this.className = ''; this.children = []; this.attrs = {}; this.events = {}; }
  append(...nodes) { for (const n of nodes) { if (n.parentNode) n.parentNode.children = n.parentNode.children.filter(child => child !== n); n.parentNode = this; this.children.push(n); } }
  insertBefore(node, before) { node.parentNode = this; this.children.splice(this.children.indexOf(before), 0, node); }
  setAttribute(k, v) { this.attrs[k] = v; }
  addEventListener(type, fn) { this.events[type] = fn; }
  closest(selector) { for (let n = this; n; n = n.parentNode) if (n.className.split(' ').includes(selector.slice(1))) return n; return null; }
  querySelector(tag) { return this.children.find(n => n.tag === tag) || null; }
}
const text = 'def example():\n    return "<>&中文"\n\n';
const parent = new Node('div'); parent.className = 'language-python highlighter-rouge';
const pre = new Node('pre'), code = new Node('code', text); pre.append(code); parent.append(pre);
const plainParent = new Node('div'), plain = new Node('pre', 'a\t b\n'); plainParent.append(plain);
const blocks = [pre, plain]; let copied, selected, timer;
const sandbox = { document: { querySelectorAll: () => blocks, createElement: tag => new Node(tag),
  createRange: () => ({ selectNodeContents(n) { selected = n; } }), getSelection: () => ({ removeAllRanges() {}, addRange() {} }) },
  navigator: { clipboard: { async writeText(text) { copied = text; } } }, clearTimeout() {}, setTimeout(fn) { timer = fn; } };
vm.createContext(sandbox);
const script = fs.readFileSync('code-blocks.js', 'utf8');
vm.runInContext(script, sandbox);
const window = parent.children[0], toolbar = window.children[0], button = toolbar.children[2];
assert.equal(toolbar.children[1].textContent, 'Python');
assert.equal(toolbar.children[0].children.length, 3);
assert.equal(plainParent.children[0].children[0].children[1].textContent, 'Text');
assert.equal(window.children[1], pre);
vm.runInContext(script, sandbox); assert.equal(parent.children[0], window); assert.equal(window.children[1], pre);
(async () => {
  await button.events.click(); assert.equal(copied, text); assert.equal(button.textContent, 'Copied ✓'); assert.equal(button.disabled, false);
  timer(); assert.equal(button.textContent, 'Copy');
  sandbox.navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  await button.events.click(); assert.equal(button.textContent, '手动复制'); assert.equal(selected, code); assert.equal(button.disabled, false);
  delete sandbox.navigator.clipboard;
  const plainButton = plainParent.children[0].children[0].children[2];
  await plainButton.events.click(); assert.equal(selected, plain); assert.equal(plainButton.textContent, '手动复制');
  console.log('Passed: macOS toolbar, language labels, exact copy including whitespace, feedback/reset, denied/unavailable clipboard fallback, and idempotent enhancement.');
})().catch(error => { console.error(error); process.exitCode = 1; });
