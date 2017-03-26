NODE_BIN=./node_modules/.bin

all: cli

node_modules: package.json
	npm install

cli: node_modules
	$(NODE_BIN)/tsc

test: cli
	$(NODE_BIN)/jest build/tests/

clean:
	rm -rf build
