.PHONY: console build

console: build
	docker run -it -v="$(PWD):/braintree-node" --net="host" braintree-node /bin/bash

build:
	docker build -t braintree-node .
