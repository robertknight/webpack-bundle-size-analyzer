NODE_BIN=./node_modules/.bin

all: cli

node_modules: package.json
	npm install

cli: node_modules
	$(NODE_BIN)/tsc

test:
	$(NODE_BIN)/jest

clean:
	rm -rf build
