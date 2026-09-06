# Translating the docs

The site currently ships an English → Kurmanji (`kmr`) translation pipeline, built with
[po4a](https://po4a.org/). Pages fall back to English until translated.

## Filling in Kurmanji translations

Edit `locale/kmr/docs.po` directly (any PO editor works — Poedit, Lokalize, or a plain
text editor) and fill in the `msgstr` under each `msgid` you can translate. You don't
need to touch anything else — the next build picks up your changes automatically.

## Adding a new language

See the full runbook: [Translating the docs](docs/modules/ROOT/pages/translating.adoc)
(also published on the site itself, under Home → Translating the docs).
