const motto = '纵有疾风起，人生不言弃';
const categories = {
  work: { title: 'Work', intro: '记录工作中的思考与实践。' },
  life: { title: 'Life', intro: '记录日常，也记录沿途的风景。' },
};
const main = document.querySelector('main');
const pageSize = 20;
let posts = [];
let loaded = false;
const categoryPosts = { work: [], life: [] };
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function render() {
  const [route, query = ''] = location.hash.slice(1).split('?');
  const [requestedCategory, slug] = route.split('/');
  const category = Object.hasOwn(categories, requestedCategory) ? requestedCategory : 'work';
  const info = categories[category];
  document.querySelectorAll('[data-category]').forEach(link => {
    if (link.dataset.category === category) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  main.replaceChildren();
  document.title = `${info.title} · ${motto}`;
  if (!loaded) {
    main.append(element('h1', info.title), element('p', '正在加载文章目录…', 'intro'));
    return;
  }
  // Keep previously shared hash article links working without loading any body.
  if (slug) {
    const post = categoryPosts[category].find(item => item.slug === slug);
    if (post) { location.replace(post.url); return; }
    const back = element('a', `← ${info.title}`, 'back');
    back.href = `#${category}`;
    main.append(back, element('h1', '文章未找到'), element('p', '返回栏目查看其他记录。', 'intro'));
    return;
  }
  main.append(element('h1', info.title), element('p', info.intro, 'intro'));
  const selected = categoryPosts[category];
  if (!selected.length) { main.append(element('p', '文章陆续更新。', 'empty')); return; }
  const pageCount = Math.ceil(selected.length / pageSize);
  const requestedPage = Number(new URLSearchParams(query).get('page'));
  const page = Math.min(pageCount, Math.max(1, Number.isSafeInteger(requestedPage) ? requestedPage : 1));
  const list = element('ul', undefined, 'posts');
  for (const item of selected.slice((page - 1) * pageSize, page * pageSize)) {
    const li = element('li');
    const link = element('a', undefined, 'post-link');
    link.href = item.url;
    const time = element('time', item.date.replaceAll('-', '.'), 'date');
    time.dateTime = item.date;
    const content = element('div');
    content.append(element('div', item.title, 'post-title'));
    if (item.summary) content.append(element('p', item.summary, 'summary'));
    link.append(time, content); li.append(link); list.append(li);
  }
  main.append(list);
  if (pageCount > 1) {
    const pagination = element('nav', undefined, 'pagination');
    pagination.setAttribute('aria-label', '文章分页');
    function pageLink(text, target) {
      const link = element('a', text);
      link.href = `#${category}?page=${target}`;
      return link;
    }
    pagination.append(page > 1 ? pageLink('← 上一页', page - 1) : element('span', '← 上一页', 'disabled'));
    const status = element('span', `${page} / ${pageCount}`, 'page-count');
    status.setAttribute('aria-label', `第 ${page} 页，共 ${pageCount} 页`);
    pagination.append(status);
    pagination.append(page < pageCount ? pageLink('下一页 →', page + 1) : element('span', '下一页 →', 'disabled'));
    main.append(pagination);
  }
}
window.addEventListener('hashchange', () => { if (main.hasAttribute('data-article')) return; render(); window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
if (!main.hasAttribute('data-article')) {
  render();
  fetch('posts.json').then(response => {
    if (!response.ok) throw new Error('文章加载失败');
    return response.json();
  }).then(data => {
    if (!Array.isArray(data)) throw new Error('文章格式错误');
    posts = data;
    for (const category of Object.keys(categories)) {
      categoryPosts[category] = posts.filter(item => item.category === category)
        .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
    }
    loaded = true;
    render();
  }).catch(() => {
    main.replaceChildren(element('h1', '暂时无法加载文章'), element('p', '请稍后刷新页面。', 'intro'));
  });
}
