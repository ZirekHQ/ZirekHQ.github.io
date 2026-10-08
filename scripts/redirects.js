'use strict'

const fs = require('node:fs')
const path = require('node:path')

const SITE = 'https://zirekhq.github.io'
const SKIPPED = [/^index\.html$/, /^404\.html$/, /^_\//, /^assets\//, /^en\//]

const isDocsPage = (file) => file.endsWith('.html') && !SKIPPED.some((rx) => rx.test(file))

const targetOf = (file) => (file.endsWith('/index.html') ? `/${file.slice(0, -'index.html'.length)}` : `/${file}`)

const redirectsFor = (files) => [
  { stub: 'en/index.html', target: '/' },
  ...files.filter(isDocsPage).map((file) => ({ stub: `en/${file}`, target: targetOf(file) })),
]

const stubHtml = (target, site = SITE) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Moved</title>
<link rel="canonical" href="${site}${target}">
<meta http-equiv="refresh" content="0; url=${target}"></head>
<body><p>This page moved to <a href="${target}">${target}</a>.</p></body></html>
`

const walk = (dir, base = dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(full, base) : [path.relative(base, full).split(path.sep).join('/')]
  })

const main = () => {
  const root = path.resolve(__dirname, '../build/site')
  const redirects = redirectsFor(walk(root))
  redirects.forEach(({ stub, target }) => {
    fs.mkdirSync(path.dirname(path.join(root, stub)), { recursive: true })
    fs.writeFileSync(path.join(root, stub), stubHtml(target))
  })
  console.log(`wrote ${redirects.length} redirect stubs under /en/`)
}

if (require.main === module) main()

module.exports = { redirectsFor, stubHtml }
