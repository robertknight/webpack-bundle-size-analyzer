/// <reference path="typings/typings.d.ts" />

import commander = require('commander');
import fs = require('fs');

import size_tree = require('./size_tree');
import webpack_stats = require('./webpack_stats');

function printStats(json) {
	const bundleStats = JSON.parse(json) as webpack_stats.WebpackJsonOutput;
	const depTree = size_tree.dependencySizeTree(bundleStats);
	size_tree.printDependencySizeTree(depTree);
}

commander.version('1.1.0')
         .usage('[options] [Webpack JSON output]')
         .description(
 `Analyzes the JSON output from 'webpack --json'
  and displays the total size of JS modules
  contributed by each NPM package that has been included in the bundle.
 
  The JSON output can either be supplied as the first argument or
  passed via stdin.
  `
  );

commander.parse(process.argv);

if (commander.args[0]) {
	printStats(fs.readFileSync(commander.args[0]).toString());
} else if (!process.stdin.isTTY) {
	let json = '';
	process.stdin.on('data', chunk => json += chunk.toString());
	process.stdin.on('end', () => printStats(json));
} else {
	console.error('No Webpack JSON output file specified. Use `webpack --json` to generate it.');
	process.exit(1);
}

