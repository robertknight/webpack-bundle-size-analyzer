build/cli.js: $(wildcard *.ts) $(wildcard tests/*.ts)
	tsc -m commonjs --target ES5 --outDir build --noImplicitAny --noEmitOnError $?

test: build/cli.js
	./node_modules/.bin/mocha build/tests/

clean:
	rm -rf build
