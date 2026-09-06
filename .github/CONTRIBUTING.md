# Contributing to ZirekHQ Documentation

This repo aggregates the ZirekHQ organization's docs into one [Antora](https://antora.org/)
site. It only holds the playbook, UI overrides, and build tooling — each product repo
(`dengjen-tts`, `dengjen-nvda`, ...) owns its own content under its own `docs`.

Contributions are welcome.

## Reporting a bug

Open an issue at <https://github.com/ZirekHQ/ZirekHQ.github.io/issues/new/choose>. For a
broken or missing *content* page, check whether it belongs to this repo (the `home`
component, under `docs`) or to the product repo that owns it — if it's product content,
file the issue there instead.

## Suggesting a feature

Open an issue describing the problem you're trying to solve, not just the proposed
change — that often surfaces a simpler fix.

## Development setup

Requires Node.js and [po4a](https://po4a.org/) (e.g. `sudo apt-get install po4a`). From
the repo root:

```bash
make install   # npm i
make build     # po4a, then two Antora builds: English (antora-playbook.yml) and
                # Kurmanji (antora-playbook-kmr.yml), into build/site/en and build/site/kmr
make serve     # serve build/site locally
```

`make build` fetches every component repo listed in `antora-playbook.yml`'s
`content.sources` (English) and clones them again for po4a to translate (Kurmanji), so
the first build needs network access.

## Adding a new component

Each product repo owns its own docs as an Antora component (`docs/antora.yml` +
`docs/modules/ROOT/pages/*.adoc`). To onboard a repo here, add a `content.sources`
entry for it in `antora-playbook.yml` — see the existing `dengjen-tts` and
`dengjen-nvda` entries for the shape. For it to also build in Kurmanji, add the
matching entries in `antora-playbook-kmr.yml`, `po4a.cfg`, and the `Makefile`/
`.github/workflows/deploy.yml` staging steps — see the existing entries for the shape.

## Working on translations

The Kurmanji (`kmr`) translation pipeline (po4a-generated) is documented separately in
[`TRANSLATING.md`](../TRANSLATING.md) and, in more depth, on the published
[Translating the docs](../docs/modules/ROOT/pages/translating.adoc) page. That's also
where to look if you want to add support for another language.

## Submitting a PR

- **Commit messages**: short imperative subject line (e.g. "Add search index",
  "Fix broken nav link") — matches the existing history, no type prefix required.
- **Branch naming**: a short descriptive slug, e.g. `add-search`, `fix-nav-link`.
- **No `Co-Authored-By` trailers.**
- Link any related issue in the PR description (`Closes #N`).

## Deploying

Deployment is automatic: pushing to `main` runs `workflows/deploy.yml`, which
builds the site with Antora and publishes it to GitHub Pages. There's no separate
release/tagging step for this repo.
