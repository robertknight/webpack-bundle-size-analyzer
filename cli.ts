/// <reference path="typings/typings.d.ts" />

import commander = require('commander');
import fs = require('fs');

import size_tree = require('./size_tree');
import webpack_stats = require('./webpack_stats');

commander.version('0.1.0')
         .usage('[options] <Webpack JSON output>')
         .description(
 `Analyzes the JSON output from 'webpack --json'
  and displays the total size of JS modules
  contributed by each NPM package that has been included in the bundle.`
  );

commander.parse(process.argv);

if (!commander.args[0]) {
	console.error('No Webpack JSON output file specified. Use `webpack --json` to generate it.');
	process.exit(1);
}

const bundleStatsJson = fs.readFileSync(commander.args[0]).toString();
const bundleStats = <webpack_stats.WebpackJsonOutput>JSON.parse(bundleStatsJson);
const depTree = size_tree.dependencySizeTree(bundleStats);
size_tree.printDependencySizeTree(depTree);

