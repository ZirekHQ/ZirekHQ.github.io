# ZirekHQ Documentation

[Project board](https://github.com/orgs/ZirekHQ/projects/1) — live roadmap and status for this repo's issues.

Aggregated Antora documentation site for the ZirekHQ organization, structured after
[compress4j/compress4j.github.io](https://github.com/compress4j/compress4j.github.io).

Each source repo owns its own docs under `docs/` (an Antora component: `docs/antora.yml` +
`docs/modules/ROOT/pages/*.adoc`). This repo only holds the playbook, UI, and build tooling
that stitches those components into one published site.

Currently a spike covering the components listed in `antora-playbook.yml`. Add a repo by
adding a `content.sources` entry in `antora-playbook.yml` and a `docs/antora.yml` in that repo.

## Versions

`extensions/doc-versions.js` overrides the `version:` in each component's `docs/antora.yml`, unless that file hardcodes a value (see `pact-avro-plugin` in the playbook):

- Every branch (`main`) publishes as **Next**, a prerelease. It is the default only while a component has no release.
- Only the newest `vX.Y.Z` tag of each major line publishes, as `X.x`. Below 1.0 each minor counts as a line (`0.2.x`).
- Other tags, such as betas (`v4.0.2-beta.1`), are skipped.
- `home` is unversioned in both playbooks. The Kurmanji site translates `main` only, so it shows Next alone.

Antora fails on a tag without `docs/`. When onboarding a repo, negate its older tags in `antora-playbook.yml` (e.g. `'!v1.5.*'`).

```
make install   # npm i
make build     # antora --fetch antora-playbook.yml
make serve     # serve build/site locally
```

---

## 💝 Support This Project

If this repository saves you time and effort, please consider supporting it!

- ⭐ [Star on GitHub](https://github.com/ZirekHQ/ZirekHQ.github.io)
- 🐦 [Share on Twitter](https://twitter.com/intent/tweet?text=ZirekHQ%20-%20screen%20readers%20and%20local%20neural%20TTS%20for%20under-served%20languages&url=https%3A%2F%2Fgithub.com%2FZirekHQ%2FZirekHQ.github.io)
- 💖 [Support on Open Collective](https://opencollective.com/zirek)
