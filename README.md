# 纵有疾风起，人生不言弃

个人主页：https://linhaifeng-nju.github.io

米白背景、单栏排版，包含 Work / Life、文章详情、深浅色模式和移动端布局。无构建步骤，无第三方脚本、字体或依赖。首次发布不包含虚构文章。

## 添加文章

编辑 `posts.json`，将下面的对象放入数组，多篇文章之间用逗号分隔。提交到 `main` 后 GitHub Pages 自动发布。

```json
[
  {
    "slug": "my-first-note",
    "category": "work",
    "title": "文章标题",
    "date": "2026-09-30",
    "summary": "可选的一句话摘要。",
    "body": [
      { "type": "paragraph", "text": "第一段正文。" },
      { "type": "heading", "text": "小标题" },
      { "type": "paragraph", "text": "另一段正文。" },
      { "type": "quote", "text": "引用或感想。" },
      { "type": "code", "text": "print('hello')" },
      { "type": "image", "src": "images/photo.jpg", "alt": "照片内容描述", "caption": "可选图片说明" }
    ]
  }
]
```

- `category` 使用 `work` 或 `life`。
- `slug` 使用唯一的英文字母、数字和连字符，同一栏目不能重复。
- `date` 使用 `YYYY-MM-DD`，列表按日期倒序显示。
- `summary` 可省略；正文支持段落、小标题、引用、代码和图片，文本按纯文本显示。
- 图片上传至仓库的 `images/` 文件夹，填写相对路径。
- 文章链接示例：`https://linhaifeng-nju.github.io/#work/my-first-note`。

## 本地预览

```sh
python3 -m http.server 8000
```

打开 http://localhost:8000 。

## 发布设置

GitHub 仓库 Settings → Pages → Deploy from a branch → `main` → `/ (root)`。
