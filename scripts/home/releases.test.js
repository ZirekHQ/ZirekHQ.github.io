'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const { fetchRepo } = require('./github')

const release = (tag, over = {}) => ({
  tag_name: tag, published_at: '2026-10-01T00:00:00Z', html_url: `https://example.test/${tag}`, body: 'notes', draft: false, prerelease: false, ...over,
})

const fakeFetch = (routes) => async (url) => {
  const body = routes[new URL(url).pathname]
  return body === undefined
    ? { ok: false, status: 404, json: async () => ({}) }
    : { ok: true, status: 200, json: async () => body }
}

const repo = { description: 'd', language: 'Rust', license: { spdx_id: 'GPL-3.0-or-later' }, stargazers_count: 1, open_issues_count: 0, topics: [], default_branch: 'main' }

test('keeps only stable vX.Y.Z releases', async () => {
  const base = '/repos/ZirekHQ/dengjen-tts'
  const fetchFn = fakeFetch({
    [base]: repo,
    [`${base}/releases`]: [release('grpc-release-v2.1.1'), release('v2.1.1'), release('v2.2.0-beta.1', { prerelease: true }), release('v2.1.0')],
    [`${base}/releases/latest`]: release('grpc-release-v2.1.1'),
  })
  const data = await fetchRepo(fetchFn, 'dengjen-tts')
  assert.deepEqual(data.releases.map((r) => r.tag), ['v2.1.1', 'v2.1.0'])
})

test('a repository with no releases yields an empty list', async () => {
  const fetchFn = fakeFetch({ '/repos/ZirekHQ/dengjen-werger': repo, '/repos/ZirekHQ/dengjen-werger/releases': [] })
  const data = await fetchRepo(fetchFn, 'dengjen-werger')
  assert.deepEqual(data.releases, [])
})

test('a release with a null body yields an empty excerpt', async () => {
  const base = '/repos/ZirekHQ/dengjen-tts'
  const fetchFn = fakeFetch({
    [base]: repo,
    [`${base}/releases`]: [release('v2.1.1', { body: null })],
    [`${base}/releases/latest`]: release('v2.1.1', { body: null }),
  })
  const data = await fetchRepo(fetchFn, 'dengjen-tts')
  assert.equal(data.releases[0].excerpt, '')
})

const pagedFetch = (all) => async (url) => {
  const { pathname, searchParams } = new URL(url)
  const routes = {
    '/repos/ZirekHQ/dengjen-tts': repo,
    '/repos/ZirekHQ/dengjen-tts/releases': all.slice(0, Number(searchParams.get('per_page') ?? 30)),
  }
  const body = routes[pathname]
  return body === undefined
    ? { ok: false, status: 404, json: async () => ({}) }
    : { ok: true, status: 200, json: async () => body }
}

test('finds stable releases behind a run of non-stable ones', async () => {
  const noise = Array.from({ length: 12 }, (_, i) => release(`grpc-release-v2.0.${i}`))
  const stable = [release('v2.1.0'), release('v2.0.0')]
  const data = await fetchRepo(pagedFetch([...noise, ...stable]), 'dengjen-tts')
  assert.deepEqual(data.releases.map((r) => r.tag), ['v2.1.0', 'v2.0.0'])
})

test('keeps at most five stable releases', async () => {
  const stable = Array.from({ length: 8 }, (_, i) => release(`v1.${8 - i}.0`))
  const data = await fetchRepo(pagedFetch(stable), 'dengjen-tts')
  assert.equal(data.releases.length, 5)
  assert.equal(data.releases[0].tag, 'v1.8.0')
})
