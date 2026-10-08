'use strict'

const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const css = fs.readFileSync(path.join(__dirname, '../../home/assets/home.css'), 'utf8')

test('the skip-link target keeps a visible focus outline', () => {
  assert.doesNotMatch(css, /main:focus\s*\{[^}]*outline:\s*none/)
})
