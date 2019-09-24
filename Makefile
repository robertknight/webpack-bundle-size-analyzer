NODE_BIN=./node_modules/.bin

.PHONY: all
all: cli

.PHONY: cli
cli: node_modules/.uptodate
	$(NODE_BIN)/tsc

.PHONY: test
test:
	$(NODE_BIN)/jest

.PHONY: clean
clean:
	rm -rf build

node_modules/.uptodate: package.json package-lock.json
	npm install
	@touch node_modules/.uptodate
