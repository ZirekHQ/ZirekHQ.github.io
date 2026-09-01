# ZirekHQ Documentation

Aggregated Antora documentation site for the ZirekHQ organization, structured after
[compress4j/compress4j.github.io](https://github.com/compress4j/compress4j.github.io).

Each source repo owns its own docs under `docs/` (an Antora component: `docs/antora.yml` +
`docs/modules/ROOT/pages/*.adoc`). This repo only holds the playbook, UI, and build tooling
that stitches those components into one published site.

Currently a spike with two pilot components: `dengjen-tts` and `dengjen-nvda`. Add a repo by
adding a `content.sources` entry in `antora-playbook.yml` and a `docs/antora.yml` in that repo.

```
make install   # npm i
make build     # antora --fetch antora-playbook.yml
make serve     # serve build/site locally
```
