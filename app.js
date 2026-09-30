const motto = '纵有疾风起，人生不言弃';
const categories = {
  work: { title: 'Work', intro: '记录工作中的思考与实践。' },
  life: { title: 'Life', intro: '记录日常，也记录沿途的风景。' },
};
const main = document.querySelector('main');
const themeButton = document.querySelector('#theme');
let posts = [];
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.setAttribute('aria-label', `切换为${theme === 'dark' ? '浅' : '深'}色模式`);
}
let savedTheme;
try { savedTheme = localStorage.getItem('theme'); } catch {}
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
setTheme(['light', 'dark'].includes(savedTheme) ? savedTheme : systemTheme.matches ? 'dark' : 'light');
themeButton.addEventListener('click', () => {
  savedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(savedTheme);
  try { localStorage.setItem('theme', savedTheme); } catch {}
});
systemTheme.addEventListener('change', event => { if (!savedTheme) setTheme(event.matches ? 'dark' : 'light'); });

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function safeImageSource(value) {
  if (typeof value !== 'string') return null;
  const url = new URL(value, location.href);
  return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
}
function render() {
  const [requestedCategory, slug] = location.hash.slice(1).split('/');
  const category = Object.hasOwn(categories, requestedCategory) ? requestedCategory : 'work';
  const info = categories[category];
  document.querySelectorAll('[data-category]').forEach(link => {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  main.replaceChildren();
  const post = posts.find(item => item.category === category && item.slug === slug);
  if (slug) {
    const back = element('a', `← ${info.title}`, 'back');
    back.href = `#${category}`;
    main.append(back);
    if (!post) {
      main.append(element('h1', '文章未找到'), element('p', '返回栏目查看其他记录。', 'intro'));
      document.title = `文章未找到 · ${motto}`;
      return;
    }
    const article = element('article');
    const head = element('header', undefined, 'article-head');
    head.append(element('div', `${info.title} · ${post.date}`, 'meta'), element('h1', post.title));
    const body = element('div', undefined, 'prose');
    for (const block of post.body || []) {
      if (block.type === 'image') {
        const src = safeImageSource(block.src);
        if (!src) continue;
        const figure = element('figure');
        const img = element('img');
        img.src = src; img.alt = block.alt || ''; img.loading = 'lazy';
        figure.append(img);
        if (block.caption) figure.append(element('figcaption', block.caption));
        body.append(figure);
      } else if (block.type === 'code') {
        const pre = element('pre');
        pre.append(element('code', block.text));
        body.append(pre);
      } else {
        const tag = { heading: 'h2', quote: 'blockquote' }[block.type] || 'p';
        body.append(element(tag, block.text));
      }
    }
    article.append(head, body); main.append(article);
    document.title = `${post.title} · ${motto}`;
  } else {
    main.append(element('h1', info.title), element('p', info.intro, 'intro'));
    const selected = posts.filter(item => item.category === category).sort((a, b) => b.date.localeCompare(a.date));
    if (!selected.length) main.append(element('p', '文章陆续更新。', 'empty'));
    else {
      const list = element('ul', undefined, 'posts');
      for (const item of selected) {
        const li = element('li');
        const link = element('a', undefined, 'post-link');
        link.href = `#${category}/${item.slug}`;
        const time = element('time', item.date.replaceAll('-', '.'), 'date');
        time.dateTime = item.date;
        const content = element('div');
        content.append(element('div', item.title, 'post-title'));
        if (item.summary) content.append(element('p', item.summary, 'summary'));
        link.append(time, content); li.append(link); list.append(li);
      }
      main.append(list);
    }
    document.title = `${info.title} · ${motto}`;
  }
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
render();
fetch('posts.json').then(response => {
  if (!response.ok) throw new Error('文章加载失败');
  return response.json();
}).then(data => {
  if (!Array.isArray(data)) throw new Error('文章格式错误');
  posts = data; render();
}).catch(() => {
  main.replaceChildren(element('h1', '暂时无法加载文章'), element('p', '请稍后刷新页面。', 'intro'));
});
