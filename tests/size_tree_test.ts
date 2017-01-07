import {expect} from 'chai';
import fs = require('fs');
import path = require('path');

import size_tree = require('../src/size_tree');
import webpack_stats = require('../src/webpack_stats');

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
marked: 27.53 KB (14.9%)
lru-cache: 6.29 KB (3.40%)
style-loader: 717 B (0.379%)
<self>: 150.33 KB (81.3%)`
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
<self>: 123 B (100%)`);
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

	it('should include the package name of scoped packages', () => {
		let webpackOutput: webpack_stats.WebpackCompilation = {
			version: '1.2.3',
			hash: 'unused',
			time: 100,
			assetsByChunkName: {},
			assets: [],
			chunks: [],
			modules: [{
				id: 0,
				identifier: path.join('/', 'path', 'to', 'project', 'node_modules', '@scope', 'package1', 'foo.js'),
				size: 1234,
				name: path.join('.', 'foo.js')
			}, {
				id: 0,
				identifier: path.join('/', 'path', 'to', 'project', 'node_modules', '@scope', 'package2', 'bar.js'),
				size: 1234,
				name: path.join('.', 'bar.js')
			}],
			errors: [],
			warnings: [],
		};
		const depsTree = size_tree.dependencySizeTree(webpackOutput);
		expect(depsTree.length).to.equal(1);
		expect(depsTree[0].children).to.deep.include({
			packageName: '@scope/package1',
			size: 1234,
			children: []
		});
		expect(depsTree[0].children).to.deep.include({
			packageName: '@scope/package2',
			size: 1234,
			children: []
		});
	});
});