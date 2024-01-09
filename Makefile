.PHONY: console build

console: build
	docker run -it -v="$(PWD):/braintree-node" --net="host" braintree-node /bin/bash

build:
	docker build -t braintree-node .

lint: build
	docker run -i -v="$(PWD):/braintree-node" --net="host" braintree-node /bin/bash -l -c "npm install;npm run lint"
