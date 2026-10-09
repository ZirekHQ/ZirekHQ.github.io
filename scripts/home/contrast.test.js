'use strict'

const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const css = fs.readFileSync(path.join(__dirname, '../../home/assets/home.css'), 'utf8')

const block = (selector) => {
  const start = css.indexOf(selector)
  assert.ok(start >= 0, `missing ${selector}`)
  return css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
}

const vars = (body) => Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toLowerCase()]))

const channel = (hex, i) => {
  const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const luminance = (hex) => 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2)
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const PAIRS = [['fg', 'bg'], ['muted', 'bg'], ['link', 'bg'], ['fg', 'surface'], ['muted', 'surface'], ['link', 'surface'], ['on-accent', 'accent']]

const light = vars(block(':root {'))
const dark = vars(block(':root[data-theme="dark"]'))
const media = vars(block(':root:not([data-theme="light"])'))

for (const [name, theme] of [['light', { ...light }], ['dark', { ...light, ...dark }]]) {
  test(`${name} theme text meets 4.5:1`, () => {
    PAIRS.forEach(([fg, bg]) => assert.ok(ratio(theme[fg], theme[bg]) >= 4.5, `${fg} on ${bg}: ${ratio(theme[fg], theme[bg]).toFixed(2)}`))
  })
}

for (const [name, theme] of [['light', { ...light }], ['dark', { ...light, ...dark }]]) {
  test(`${name} theme control borders meet 3:1 (WCAG 1.4.11)`, () => {
    const value = ratio(theme['control-border'], theme.bg)
    assert.ok(value >= 3, `control-border on bg: ${value.toFixed(2)}`)
  })
}

test('prefers-color-scheme dark matches data-theme dark', () => {
  assert.deepEqual(media, dark)
})
