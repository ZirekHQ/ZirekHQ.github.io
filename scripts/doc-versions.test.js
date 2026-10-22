'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { register } = require('../extensions/doc-versions')

const bundle = (name, reftype, refname) => ({ name, origins: [{ reftype, refname }] })

const aggregate = (bundles, unversioned = []) => {
  const handlers = {}
  register.call({ on: (event, fn) => (handlers[event] = fn) }, { config: { unversioned } })
  handlers.contentAggregated({ contentAggregate: bundles })
  return bundles
}

test('publishes tags that predate the rename under the dengjen component', () => {
  const result = aggregate([
    bundle('dengjen', 'branch', 'main'),
    bundle('dengjen-tts', 'tag', 'v2.1.1'),
    bundle('dengjen-tts', 'tag', 'v1.2.0'),
  ])
  assert.deepEqual(
    result.map(({ name, version }) => `${name}@${version}`),
    ['dengjen@next', 'dengjen@2.x', 'dengjen@1.x'],
  )
})

test('leaves a component named after an Object.prototype member untouched', () => {
  const [result] = aggregate([bundle('constructor', 'branch', 'main')])
  assert.equal(result.name, 'constructor')
})

test('keeps the newest tag per line across old and new component names', () => {
  const result = aggregate([bundle('dengjen-tts', 'tag', 'v2.1.1'), bundle('dengjen', 'tag', 'v2.2.0')])
  assert.deepEqual(
    result.map(({ name, origins }) => `${name}:${origins[0].refname}`),
    ['dengjen:v2.2.0'],
  )
})
