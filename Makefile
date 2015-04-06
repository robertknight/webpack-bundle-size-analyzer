NODE_BIN=./node_modules/.bin

all: build/cli.js

typings_file=typings/DefinitelyTyped/tsd.d.ts

$(typings_file): tsd.json
	$(NODE_BIN)/tsd reinstall
	$(NODE_BIN)/tsd rebundle

build/cli.js: $(typings_file) $(wildcard *.ts) $(wildcard tests/*.ts)
	tsc -m commonjs --target ES5 --outDir build --noImplicitAny --noEmitOnError $?

test: build/cli.js
	$(NODE_BIN)/mocha build/tests/

clean:
	rm -rf build
