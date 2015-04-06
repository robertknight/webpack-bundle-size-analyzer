/// <reference path="../typings/typings.d.ts" />

import {expect} from 'chai';
import fs = require('fs');

import size_tree = require('../size_tree');
import webpack_stats = require('../webpack_stats');

describe('printDependencySizeTree()', () => {
	it('should print the size tree', () => {
		let output = '';

		const statsJsonStr = fs.readFileSync('tests/stats.json').toString();
		const statsJson = <webpack_stats.WebpackJsonOutput>JSON.parse(statsJsonStr);
		const depsTree = size_tree.dependencySizeTree(statsJson);
		size_tree.printDependencySizeTree(depsTree, 0, line => output += '\n' + line);

		expect(output).to.equal(
`
marked: 27.53 kB (14.9%)
  <self>: 27.53 kB (100%)
lru-cache: 6.29 kB (3.40%)
  <self>: 6.29 kB (100%)
style-loader: 717 B (0.379%)
  <self>: 717 B (100%)
<self>: 150.33 kB (81.3%)`
);
	});
});
