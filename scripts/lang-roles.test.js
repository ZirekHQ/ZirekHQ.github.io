'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { register, addLangAttributes } = require('../extensions/lang-roles')

test('a section with a lang role gets the lang attribute', () => {
  assert.equal(
    addLangAttributes('<div class="sect1 lang-ku">'),
    '<div lang="ku" class="sect1 lang-ku">',
  )
})

test('an inline role inside a link gets it too', () => {
  assert.equal(
    addLangAttributes('<a href="x.html"><span class="lang-en">Get involved</span></a>'),
    '<a href="x.html"><span lang="en" class="lang-en">Get involved</span></a>',
  )
})

test('the role can sit anywhere in the class list and other attributes stay', () => {
  assert.equal(
    addLangAttributes('<p id="a" class="x lang-kmr y">'),
    '<p lang="kmr" id="a" class="x lang-kmr y">',
  )
})

test('an element that already has a lang attribute, or no role, is left alone', () => {
  const html = '<span id="t" lang="ku" class="lang-en">a</span><span class="lang-en" lang="ku">c</span><div class="language-ku sect1">b</div><div class="slang-ku">'
  assert.equal(addLangAttributes(html), html)
})

test('the extension rewrites every converted page with output', () => {
  const handlers = {}
  register.call({ on: (event, fn) => (handlers[event] = fn) })
  const page = { out: {}, contents: Buffer.from('<div class="sect1 lang-ku">') }
  const contentCatalog = { getPages: (filter) => [page, { contents: Buffer.from('') }].filter(filter) }
  handlers.documentsConverted({ contentCatalog })
  assert.equal(page.contents.toString(), '<div lang="ku" class="sect1 lang-ku">')
})
