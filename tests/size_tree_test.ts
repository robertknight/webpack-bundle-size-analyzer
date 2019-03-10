import fs = require('fs');
import path = require('path');

import size_tree = require('../src/size_tree');
import webpack_stats = require('../src/webpack_stats');

const printShareStats    = true;
const suppressShareStats = false;

describe('printDependencySizeTree()', () => {
	it('should print the size tree', () => {
		let output = '';

		const statsJsonStr = fs.readFileSync(path.join('tests', 'fixtures/stats.json')).toString();
		const statsJson = <webpack_stats.WebpackCompilation>JSON.parse(statsJsonStr);

		// convert paths in Json to WIN if necessary
		if(path.sep !== '/') {
			statsJson.modules.forEach(module => {
				module.identifier = module.identifier.replace(/\//g, path.sep);
			});
		}

		const depsTree = size_tree.dependencySizeTree(statsJson);
		expect(depsTree.length).toEqual(1);
		size_tree.printDependencySizeTree(depsTree[0], printShareStats, false, 0, line => output += '\n' + line);

		expect(output).toEqual(
`
marked: 27.53 KB (14.9%)
lru-cache: 6.29 KB (3.40%)
style-loader: 717 B (0.379%)
<self>: 150.33 KB (81.3%)`
);
	});

	it('should print the size tree without share stats', () => {
		let output = '';

		const statsJsonStr = fs.readFileSync(path.join('tests', 'fixtures/stats.json')).toString();
		const statsJson = <webpack_stats.WebpackCompilation>JSON.parse(statsJsonStr);

		// convert paths in Json to WIN if necessary
		if(path.sep !== '/') {
			statsJson.modules.forEach(module => {
				module.identifier = module.identifier.replace(/\//g, path.sep);
			});
		}

		const depsTree = size_tree.dependencySizeTree(statsJson);
		expect(depsTree.length).toEqual(1);
		size_tree.printDependencySizeTree(depsTree[0], suppressShareStats, true, 0, line => output += '\n' + line);

		expect(output).toEqual(
`
marked: 28192
lru-cache: 6445
style-loader: 717
<self>: 153940`
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
		size_tree.printDependencySizeTree(namedBundle, printShareStats, false, 0, line => output += '\n' + line);
		expect(output).toEqual(
`
Bundle: a-bundle
<self>: 123 B (100%)`);
	});

	it('should print the bundle name without share stats', () => {
		let output = '';
		let namedBundle: size_tree.RootStatsNode = {
			bundleName: 'a-bundle',
			packageName: '<self>',
			size: 123,
			children: [],
		};
		size_tree.printDependencySizeTree(namedBundle, suppressShareStats, false, 0, line => output += '\n' + line);
		expect(output).toEqual(
`
Bundle: a-bundle
<self>: 123 B`);
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
		expect(depsTree.length).toEqual(1);
		expect(depsTree[0]).toEqual({
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
		  'fixtures/multiple-bundle-stats.json')).toString();
		const statsJson = JSON.parse(statsJsonStr) as webpack_stats.WebpackStats;
		const depsTree = size_tree.dependencySizeTree(statsJson);
		expect(depsTree.length).toEqual(2);
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
		expect(depsTree.length).toEqual(1);
		expect(depsTree[0].children).toContainEqual({
			packageName: '@scope/package1',
			size: 1234,
			children: []
		});
		expect(depsTree[0].children).toContainEqual({
			packageName: '@scope/package2',
			size: 1234,
			children: []
		});
	});
});
