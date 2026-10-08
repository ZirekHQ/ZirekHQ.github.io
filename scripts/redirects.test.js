'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { redirectsFor, stubHtml } = require('./redirects')

const FILES = [
  'index.html',
  '404.html',
  '_/css/site.css',
  'assets/home.css',
  'search-index.js',
  'sitemap.xml',
  'home/index.html',
  'dengjen-nvda/next/usage.html',
  'dengjen-nvda/4.x/index.html',
  'en/home/index.html',
]

test('maps every docs page to a stub under en/ pointing at the new path', () => {
  const map = Object.fromEntries(redirectsFor(FILES).map((r) => [r.stub, r.target]))
  assert.equal(map['en/home/index.html'], '/home/')
  assert.equal(map['en/dengjen-nvda/next/usage.html'], '/dengjen-nvda/next/usage.html')
  assert.equal(map['en/dengjen-nvda/4.x/index.html'], '/dengjen-nvda/4.x/')
})

test('redirects the old language root to the landing page', () => {
  const map = Object.fromEntries(redirectsFor(FILES).map((r) => [r.stub, r.target]))
  assert.equal(map['en/index.html'], '/')
})

test('leaves the landing page, error page, assets, UI files and existing en/ files alone', () => {
  const stubs = redirectsFor(FILES).map((r) => r.stub)
  for (const skipped of ['en/index.html.html', 'en/404.html', 'en/_/css/site.css', 'en/assets/home.css', 'en/en/home/index.html']) {
    assert.ok(!stubs.includes(skipped), skipped)
  }
  assert.equal(stubs.filter((s) => s === 'en/index.html').length, 1)
})

test('a stub refreshes to the target, names it as canonical and links it for readers without refresh', () => {
  const html = stubHtml('/dengjen-nvda/next/usage.html', 'https://zirekhq.github.io')
  assert.match(html, /<meta http-equiv="refresh" content="0; url=\/dengjen-nvda\/next\/usage\.html">/)
  assert.match(html, /<link rel="canonical" href="https:\/\/zirekhq\.github\.io\/dengjen-nvda\/next\/usage\.html">/)
  assert.match(html, /<a href="\/dengjen-nvda\/next\/usage\.html">/)
})
