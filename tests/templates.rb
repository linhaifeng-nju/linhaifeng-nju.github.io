require 'liquid'
require 'json'

module TestFilters
  def jsonify(value)
    JSON.generate(value)
  end
  def relative_url(value)
    value
  end
end
Liquid::Template.register_filter(TestFilters)
def assert(condition, message)
  raise message unless condition
end
source = File.read('posts.json').split('---', 3).last
entries = [
  { 'path' => 'content/work/a.md', 'name' => 'a.md', 'category' => 'work', 'title' => '中文 "标题"', 'date' => '2026-09-30', 'summary' => 'x' * 500, 'url' => '/content/work/a.html', 'content' => 'SECRET_BODY' * 10000 },
  { 'path' => 'content/life/b.md', 'name' => 'b.md', 'category' => 'life', 'title' => 'Life', 'date' => '2026-09-29', 'url' => '/content/life/b.html' },
  { 'path' => 'guide.md', 'category' => 'work', 'listed' => false },
  { 'path' => 'index.html' }
]
result = Liquid::Template.parse(source).render!('site' => { 'pages' => entries })
rows = JSON.parse(result)
assert(rows.length == 2, 'only listed Work/Life articles belong in the index')
work = rows.find { |row| row['category'] == 'work' }
life = rows.find { |row| row['category'] == 'life' }
assert(work['title'] == '中文 "标题"', 'JSON must escape titles correctly')
assert(work['summary'].length == 160, 'summary must be bounded')
assert(life['summary'] == '', 'missing summary must be optional')
assert(!result.include?('SECRET_BODY') && rows.none? { |row| row.key?('html') }, 'body must never reach the index')
assert(JSON.parse(Liquid::Template.parse(source).render!('site' => { 'pages' => [] })) == [], 'empty index must be valid JSON')
images = Liquid::Template.parse(File.read('_includes/lazy-images.html'))
input = '<p>before <img src="a.jpg" alt="A"> between <img loading="eager" decoding="sync" src="b.jpg"> after</p>'
html = images.render!('include' => { 'html' => input })
assert(html.include?('<img loading="lazy" decoding="async" src="a.jpg" alt="A">'), 'default images must get lazy loading and async decoding')
assert(html.include?('<img loading="eager" decoding="sync" src="b.jpg">'), 'explicit author attributes must be preserved without duplication')
assert(html.include?(' between ') && html.include?(' after</p>'), 'surrounding content must be preserved')
assert(images.render!('include' => { 'html' => '<p>no image</p>' }) == '<p>no image</p>', 'image-free prose must not change')
puts 'Passed: metadata-only Liquid output, JSON escaping, summary limit, exclusions, and native image loading attributes.'
