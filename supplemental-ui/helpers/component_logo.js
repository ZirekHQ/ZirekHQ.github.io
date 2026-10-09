'use strict'

const LOGOS = {
  'dengjen-nvda': 'dengjen-nvda-logo.png',
  'nvda-addon-testkit': 'nvda-addon-testkit-logo.png',
  'dengjen-tts': 'dengjen-tts-logo.png',
  'dengjen-tashkeel': 'dengjen-tashkeel-logo.png',
  'dengjen-werger': 'dengjen-werger-logo.png',
  'piper-rs': 'dengjen-piper-rs-logo.png',
}

module.exports = function componentLogo (name) {
  return LOGOS[name]
}
