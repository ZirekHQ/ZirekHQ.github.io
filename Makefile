ROOT_DIR=$(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))

all:	install	clean build serve

install:
	@echo "Installing dependencies"
	cd $(ROOT_DIR) && npm i

clean:
	rm -rf build

build:
	@echo "Building documentation"
	cd $(ROOT_DIR) && npm i
	cd $(ROOT_DIR) && npx antora --fetch antora-playbook.yml

serve:
	@echo "Serving documentation"
	cd $(ROOT_DIR) && npx serve build/site

help:
	@awk '/^#/{c=substr($$0,3);next}c&&/^[[:alpha:]][[:alnum:]_-]+:/{print substr($$1,1,index($$1,":")),c}1{c=0}' $(MAKEFILE_LIST) | column -s: -t | sort
