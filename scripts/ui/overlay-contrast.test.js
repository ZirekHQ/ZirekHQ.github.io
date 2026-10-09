'use strict'

const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const root = path.join(__dirname, '../..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

// The bundle ships vars.css only compiled into site.css, so read the source that the `latest` release is built from.
const VARS_URL = 'https://raw.githubusercontent.com/hominux/docs-ui-bundle/main/src/css/vars.css'

const bundleVars = async () => {
  if (process.env.UI_VARS_CSS) return fs.readFileSync(process.env.UI_VARS_CSS, 'utf8')
  const res = await fetch(VARS_URL)
  assert.ok(res.ok, `download ${VARS_URL}: HTTP ${res.status}`)
  return res.text()
}

const block = (css, selector) => {
  const open = css.indexOf('{', css.indexOf(selector))
  assert.ok(open >= 0, `missing ${selector}`)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i)
  }
  throw new Error(`unterminated block for ${selector}`)
}

const declarations = (body) =>
  Object.fromEntries(
    [...body.matchAll(/^\s*--([\w-]+):\s*(.+?);\s*$/gm)].map((m) => [m[1], m[2].trim()])
  )

const NAMED = { white: '#ffffff', black: '#000000' }

const resolve = (theme, value, depth = 0) => {
  const ref = /^var\(--([\w-]+)\)$/.exec(value)
  if (!ref) return value
  assert.ok(depth <= 6, `var cycle at ${value}`)
  return resolve(theme, theme[ref[1]], depth + 1)
}

const hex = (theme, name) => {
  const resolved = resolve(theme, theme[name])
  const value = NAMED[resolved] || resolved
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(value)
  const full = short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : value
  assert.match(full, /^#[0-9a-f]{6}$/i, `${name} must resolve to a hex colour, got ${value}`)
  return full.toLowerCase()
}

const channel = (color, i) => {
  const c = Number.parseInt(color.slice(1 + i * 2, 3 + i * 2), 16) / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const luminance = (color) => 0.2126 * channel(color, 0) + 0.7152 * channel(color, 1) + 0.0722 * channel(color, 2)
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS = [
  ['body-font-color', 'body-background-color'],
  ['body-font-light-color', 'body-background-color'],
  ['link-font-color', 'body-background-color'],
  ['link-font-color', 'panel-background-color'],
  ['link_hover-font-color', 'body-background-color'],
  ['toc-active-font-color', 'selected-background-color'],
  ['badge-font-color', 'badge-background'],
  ['navbar-font-color', 'navbar-background'],
  ['navbar-menu-font-color', 'navbar-menu-background'],
  ['footer-gray-text-color', 'footer-background'],
  ['mark-font-color', 'mark-background-color'],
  ['quote-font-color', 'quote-background'],
  ['abstract-font-color', 'abstract-background'],
]

test('the ZirekHQ overlay keeps every token pair at 4.5:1 over the published bundle', async () => {
  const vars = await bundleVars()
  const overlay = read('supplemental-ui/css/zirek.css')
  const light = { ...declarations(block(vars, ':root {')), ...declarations(block(overlay, ':root {')) }
  const dark = {
    ...light,
    ...declarations(block(vars, 'html.dark-theme {')),
    ...declarations(block(overlay, 'html.dark-theme {')),
  }
  const failures = Object.entries({ light, dark }).flatMap(([name, theme]) =>
    PAIRS.map(([fg, bg]) => ({ name, fg, bg, ratio: ratio(hex(theme, fg), hex(theme, bg)) }))
      .filter((p) => p.ratio < 4.5)
      .map((p) => `${p.name}: ${p.fg} on ${p.bg} is ${p.ratio.toFixed(2)}:1`)
  )
  assert.deepEqual(failures, [])
})
