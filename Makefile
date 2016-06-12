NODE_BIN=./node_modules/.bin
typings_file=typings/index.d.ts

all: cli

node_modules: package.json
	npm install

$(typings_file): typings.json node_modules
	$(NODE_BIN)/typings install
	touch $(typings_file)

cli: $(typings_file)
	$(NODE_BIN)/tsc

test: cli
	$(NODE_BIN)/mocha build/tests/

clean:
	rm -rf build
