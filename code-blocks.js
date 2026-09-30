(() => {
  for (const pre of document.querySelectorAll('.prose pre')) {
    if (pre.closest('.code-window')) continue;
    const code = pre.querySelector('code') || pre;
    const source = code.textContent;
    const languageClass = `${code.className} ${pre.closest('.highlighter-rouge')?.className || ''}`;
    const language = languageClass.match(/(?:^|\s)language-([\w+-]+)/)?.[1] || 'text';
    const labels = { plaintext: 'Text', text: 'Text', bash: 'Shell', sh: 'Shell', python: 'Python', javascript: 'JavaScript', js: 'JavaScript', typescript: 'TypeScript', json: 'JSON', html: 'HTML', css: 'CSS', markdown: 'Markdown', ruby: 'Ruby' };
    const window = document.createElement('div');
    window.className = 'code-window';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const dots = document.createElement('span');
    dots.className = 'code-dots';
    dots.setAttribute('aria-hidden', 'true');
    for (const color of ['red', 'yellow', 'green']) {
      const dot = document.createElement('span');
      dot.className = color;
      dots.append(dot);
    }
    const label = document.createElement('span');
    label.className = 'code-language';
    label.textContent = labels[language] || language;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', `复制 ${label.textContent} 代码`);
    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    toolbar.append(dots, label, button, status);
    pre.parentNode.insertBefore(window, pre);
    window.append(toolbar, pre);
    let resetTimer;
    button.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      button.disabled = true;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(source);
        button.textContent = 'Copied ✓';
        status.textContent = '代码已复制。';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = document.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = '手动复制';
        status.textContent = '已选中代码，请按 ⌘C 或 Ctrl+C 复制。';
        button.title = status.textContent;
      } finally {
        button.disabled = false;
        resetTimer = setTimeout(() => {
          button.textContent = 'Copy';
          button.title = '';
          status.textContent = '';
        }, 2500);
      }
    });
  }
})();
