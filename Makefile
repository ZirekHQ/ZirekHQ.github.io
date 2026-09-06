ROOT_DIR=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

.PHONY: all install clean build serve help

all:	install	clean build serve

install:
	@echo "Installing dependencies"
	cd $(ROOT_DIR) && npm i

clean:
	rm -rf build .translation-src

build:
	@echo "Building documentation"
	@command -v po4a >/dev/null || (echo "po4a is required (e.g. 'sudo apt-get install po4a') -- see TRANSLATING.md" && exit 1)
	cd $(ROOT_DIR) && npm i
	cd $(ROOT_DIR) && rm -rf .translation-src build/docs
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/dengjen-tts.git .translation-src/dengjen-tts
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/dengjen-nvda.git .translation-src/dengjen-nvda
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/dengjen-piper-rs.git .translation-src/dengjen-piper-rs
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/nvda-addon-testkit.git .translation-src/nvda-addon-testkit
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/dengjen-tashkeel.git .translation-src/dengjen-tashkeel
	cd $(ROOT_DIR) && git clone --depth 1 --branch main https://github.com/ZirekHQ/pact-avro-plugin.git .translation-src/pact-avro-plugin
	cd $(ROOT_DIR) && mkdir -p build/docs/kmr
	cd $(ROOT_DIR) && cp -r docs build/docs/kmr/home
	cd $(ROOT_DIR) && cp -r .translation-src/dengjen-tts/docs build/docs/kmr/dengjen-tts
	cd $(ROOT_DIR) && cp -r .translation-src/dengjen-nvda/docs build/docs/kmr/dengjen-nvda
	cd $(ROOT_DIR) && cp -r .translation-src/dengjen-piper-rs/docs build/docs/kmr/dengjen-piper-rs
	cd $(ROOT_DIR) && cp -r .translation-src/dengjen-tashkeel/docs build/docs/kmr/dengjen-tashkeel
	# nvda-addon-testkit and pact-avro-plugin link doc examples out to source
	# code living outside docs/, so stage the whole repo (minus .git) rather
	# than just docs/, to keep those relative symlinks resolvable.
	cd $(ROOT_DIR) && cp -r .translation-src/nvda-addon-testkit build/docs/kmr/nvda-addon-testkit && rm -rf build/docs/kmr/nvda-addon-testkit/.git
	cd $(ROOT_DIR) && cp -r .translation-src/pact-avro-plugin build/docs/kmr/pact-avro-plugin && rm -rf build/docs/kmr/pact-avro-plugin/.git
	cd $(ROOT_DIR) && po4a --no-update --keep 0 po4a.cfg
	cd $(ROOT_DIR) && SITE_LANG=en npx antora --fetch antora-playbook.yml
	cd $(ROOT_DIR) && SITE_LANG=kmr npx antora antora-playbook-kmr.yml
	cd $(ROOT_DIR) && cp site-redirect.html build/site/index.html
	cd $(ROOT_DIR) && cp serve.json build/site/serve.json

serve:
	@echo "Serving documentation"
	cd $(ROOT_DIR) && npx serve build/site

help:
	@awk '/^#/{c=substr($$0,3);next}c&&/^[[:alpha:]][[:alnum:]_-]+:/{print substr($$1,1,index($$1,":")),c}1{c=0}' $(MAKEFILE_LIST) | column -s: -t | sort
