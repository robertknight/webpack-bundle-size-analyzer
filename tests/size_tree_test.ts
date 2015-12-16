/// <reference path="../typings/typings.d.ts" />

import {expect} from 'chai';
import fs = require('fs');
import path = require('path');

import size_tree = require('../size_tree');
import webpack_stats = require('../webpack_stats');

describe('printDependencySizeTree()', () => {
	it('should print the size tree', () => {
		let output = '';

		const statsJsonStr = fs.readFileSync(path.join('tests', 'stats.json')).toString();
		const statsJson = <webpack_stats.WebpackCompilation>JSON.parse(statsJsonStr);

		// convert paths in Json to WIN if necessary
		if(path.sep !== '/') {
			statsJson.modules.forEach(module => {
				module.identifier = module.identifier.replace(/\//g, path.sep);
			});
		}

		const depsTree = size_tree.dependencySizeTree(statsJson);
		expect(depsTree.length).to.equal(1);
		size_tree.printDependencySizeTree(depsTree[0], 0, line => output += '\n' + line);

		expect(output).to.equal(
`
marked: 28.2 kB (14.9%)
  <self>: 28.2 kB (100%)
lru-cache: 6.45 kB (3.40%)
  <self>: 6.45 kB (100%)
style-loader: 717 Bytes (0.379%)
  <self>: 717 Bytes (100%)
<self>: 154 kB (81.3%)`
);
	});

	it('should print the bundle name', () => {
		let output = '';
		let namedBundle: size_tree.RootStatsNode = {
			bundleName: 'a-bundle',
			packageName: '<self>',
			size: 123,
			children: [],
		};
		size_tree.printDependencySizeTree(namedBundle, 0, line => output += '\n' + line);
		expect(output).to.equal(
`
Bundle: a-bundle
<self>: 123 Bytes (100%)`);
	});
});

describe('dependencySizeTree()', () => {
	it('should produce correct results where loaders are used', () => {
		let webpackOutput: webpack_stats.WebpackCompilation = {
			version: '1.2.3',
			hash: 'unused',
			time: 100,
			assetsByChunkName: {},
			assets: [],
			chunks: [],
			modules: [{
				id: 0,
				identifier: path.join('/', 'to', 'loader.js!', 'path', 'to', 'project', 'node_modules', 'dep', 'foo.js'),
				size: 1234,
				name: path.join('.', 'foo.js')
			}],
			errors: [],
			warnings: [],
		};
		const depsTree = size_tree.dependencySizeTree(webpackOutput);
		expect(depsTree.length).to.equal(1);
		expect(depsTree[0]).to.deep.equal({
			packageName: '<root>',
			size: 1234,
			children: [{
				packageName: 'dep',
				size: 1234,
				children: []
			}]
		});
	});

	it('should return a tree for each bundle in the config', () => {
		const statsJsonStr = fs.readFileSync(path.join('tests',
		  'multiple-bundle-stats.json')).toString();
		const statsJson = JSON.parse(statsJsonStr) as webpack_stats.WebpackStats;
		const depsTree = size_tree.dependencySizeTree(statsJson);
		expect(depsTree.length).to.equal(2);
	});
});
