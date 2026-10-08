'use strict'

const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')
const { renderPage } = require('./render')

const project = (over = {}) => ({
  slug: 'dengjen-nvda', name: 'dengjen-nvda', tagline: 'tag', logo: 'dengjen-nvda-logo.png', group: 'screen-readers',
  docsComponent: 'dengjen-nvda', getUrl: 'https://example.test/get', getLabel: 'Download the add-on',
  releases: [{ tag: 'v4.1.0', date: '2026-10-01T00:00:00Z', url: 'u', excerpt: 'e' }], versions: ['next', '4.x'],
  language: 'Python', license: 'GPL-2.0', stars: 3, openIssues: 2, ...over,
})
const model = (projects, feed = []) => ({ projects, feed, year: 2026 })
const configured = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/projects.json'), 'utf8'))
  .map((p) => ({ releases: [], versions: [], ...p }))

test('groups projects under their headings and omits empty groups', () => {
  const html = renderPage(model([project()]))
  assert.match(html, /<h3>Screen readers<\/h3>/)
  assert.doesNotMatch(html, /<h3>Translation<\/h3>/)
})

test('a card carries the slug as its anchor and links the latest stable docs version', () => {
  const html = renderPage(model([project()]))
  assert.match(html, /<article class="card" id="dengjen-nvda">/)
  assert.match(html, /href="\/en\/dengjen-nvda\/4\.x\/">Documentation</)
})

test('only unreleased docs fall back to next', () => {
  const html = renderPage(model([project({ versions: ['next'] })]))
  assert.match(html, /href="\/en\/dengjen-nvda\/next\/">Documentation</)
})

test('no Documentation link without a docs component or without built versions', () => {
  assert.doesNotMatch(renderPage(model([project({ docsComponent: undefined })])), />Documentation</)
  assert.doesNotMatch(renderPage(model([project({ versions: [] })])), />Documentation</)
})

test('escapes release notes in the feed', () => {
  const feed = [{ project: 'p', tag: 'v1.0.0', date: '2026-10-06T00:00:00Z', url: 'u', excerpt: '<script>alert(1)</script>' }]
  const html = renderPage(model([project()], feed))
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
  assert.match(html, /&lt;script&gt;/)
})

test('has a skip link, one main landmark and exactly one h1', () => {
  const html = renderPage(model([project()]))
  assert.match(html, /<a class="skip-link" href="#main">/)
  assert.match(html, /<main id="main"/)
  assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1)
})

test('heading levels never skip a level', () => {
  const html = renderPage(model(configured))
  const levels = [...html.matchAll(/<h([1-6])[ >]/g)].map((m) => Number(m[1]))
  assert.equal(levels[0], 1)
  levels.slice(1).forEach((level, i) => assert.ok(level <= levels[i] + 1, `h${level} after h${levels[i]}`))
})

test('every in-page link has a matching id', () => {
  const html = renderPage(model(configured))
  const targets = [...html.matchAll(/href="#([\w-]+)"/g)].map((m) => m[1])
  assert.ok(targets.length > 0)
  targets.forEach((id) => assert.ok(html.includes(`id="${id}"`), id))
})

test('every image has an alt attribute', () => {
  assert.doesNotMatch(renderPage(model(configured)), /<img(?![^>]*\balt=)/)
})

test('renders the seven configured projects and never nvdaku', () => {
  const html = renderPage(model(configured))
  assert.equal(configured.length, 7)
  configured.forEach((p) => assert.ok(html.includes(`id="${p.slug}"`), p.slug))
  assert.doesNotMatch(html, /nvdaku/i)
})

test('sets the canonical URL and social image', () => {
  const html = renderPage(model([project()]))
  assert.match(html, /<link rel="canonical" href="https:\/\/zirekhq\.github\.io\/">/)
  assert.match(html, /property="og:image" content="https:\/\/zirekhq\.github\.io\/assets\/social-preview\.png"/)
})

test('omits the get link when it duplicates the Source link', () => {
  const html = renderPage(model([project({ getUrl: 'https://github.com/ZirekHQ/dengjen-nvda', getLabel: 'Source' })]))
  assert.equal((html.match(/>Source</g) ?? []).length, 1)
})

test('never shows the raw NOASSERTION license', () => {
  assert.doesNotMatch(renderPage(model([project({ license: 'NOASSERTION' })])), /NOASSERTION/)
})

test('card heading has no trailing space without a release badge', () => {
  const html = renderPage(model([project({ slug: 'dengjen-tts-go', name: 'dengjen-tts-go', releases: [] })]))
  assert.match(html, /<h4>dengjen-tts-go<\/h4>/)
})
