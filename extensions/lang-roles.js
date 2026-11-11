'use strict'

// An element whose class list holds `lang-<code>` (an AsciiDoc role such as `[.lang-ku]`) and no `lang`
// attribute yet. AsciiDoc has no syntax for `lang`, and screen readers need it to switch pronunciation.
const LANG_ROLE_RX = /<([a-z][a-z0-9]*)((?:\s[^>]*?)?\sclass="(?:[^"]*\s)?lang-([a-z]{2,3})(?:\s[^"]*)?"[^>]*)>/g

/** Adds `lang="<code>"` to every element that carries a `lang-<code>` role. */
const addLangAttributes = (html) =>
  html.replace(LANG_ROLE_RX, (match, tag, attrs, code) =>
    /\slang=/.test(attrs) ? match : `<${tag} lang="${code}"${attrs}>`,
  )

/** Antora extension: applies {@link addLangAttributes} to every converted page. */
function register() {
  this.on('documentsConverted', ({ contentCatalog }) => {
    contentCatalog
      .getPages((page) => page.out && page.contents)
      .forEach((page) => {
        page.contents = Buffer.from(addLangAttributes(page.contents.toString()))
      })
  })
}

module.exports = { register, addLangAttributes }
