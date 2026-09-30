# 纵有疾风起，人生不言弃

主页：https://linhaifeng-nju.github.io

保持米白背景和 Work / Life 排版，文章使用 Markdown 编写，GitHub Pages 自带的 Jekyll 自动生成并发布。

## 写文章

1. 用 VS Code、Typora 或 Obsidian 打开本地仓库。
2. 复制 `templates/article.md` 到 `content/work/` 或 `content/life/`，例如 `content/work/my-first-note.md`。
3. 修改文件顶部的标题、日期和摘要，在下方用 Markdown 写正文。
4. 提交并推送到 `main`，等待 GitHub Pages 构建成功，主页列表自动更新。

```markdown
---
title: "我的第一篇记录"
date: 2026-09-30
summary: "这篇文章讲什么。"
---

这里是正文，可以直接使用 **Markdown**。

## 小标题

![照片说明](../../images/photo.jpg)
```

- 所在文件夹决定 Work / Life 栏目，不需要手动修改列表或 JSON。
- `title` 和 `date` 必填；日期用 `YYYY-MM-DD`，列表按日期倒序。
- 文件名建议用英文和连字符，文件名决定文章地址。中文正文和标题正常支持。
- 图片放到 `images/`，使用 `../../images/photo.jpg`，本地 Markdown 编辑器和网站都能显示。
- 支持标题、段落、链接、图片、粗体、斜体、引用、列表、代码块和表格。
- `templates/` 不会发布；未准备好的稿件放在那里，完成后再移入 `content/`。
- `content/` 内的文章会公开发布，请不要把私人草稿放进去。
- 无需手动修改 `posts.json`，它是 Jekyll 自动生成列表的模板。

## 本地阅读和预览

日常写作直接用 Markdown 编辑器打开 `.md` 文件，或在 VS Code 中按 `⌘⇧V` 预览。

要预览完整网站（包含文章列表与网站样式），安装 Ruby 3.x 和 Bundler 后，在仓库目录运行：

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

打开 http://127.0.0.1:4000 。编辑并保存文章后，Jekyll 自动重新生成，刷新浏览器即可查看。

直接 `python3 -m http.server` 不会转换 Markdown，完整网站预览需要 Jekyll；只写文章并推送则不需要安装 Ruby。

## 发布

Settings → Pages → Deploy from a branch → `main` → `/ (root)`。

GitHub 自动转换 Markdown 并发布静态文件，不需要额外的发布脚本。

在线指南：https://linhaifeng-nju.github.io/guide.html

## 长期记录与性能

首页仅加载标题、日期、摘要与链接，不下载文章正文；每个栏目每页显示 20 篇。
文章正文在打开独立文章页时才加载，图片默认使用浏览器原生懒加载和异步解码。
摘要在目录中最多显示 160 个字符。图片仍建议在上传前压缩，并注明宽高以减少页面跳动。
文章目录的下载量仍随篇数增加，但不会随所有正文的总大小增加。
