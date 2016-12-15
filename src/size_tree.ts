import filesize = require('filesize');
import path = require('path');

import webpack_stats = require('./webpack_stats');

function modulePath(identifier: string) {
	// the format of module paths is
	//   '(<loader expression>!)?/path/to/module.js'
	let loaderRegex = /.*!/;
	return identifier.replace(loaderRegex, '');
}

/** A node in the package size tree
  */
export interface StatsNode {
	/** Name of the package. ie. 'foo' from 'node_modules/foo' */
	packageName: string;
	/** Total size of files in this package, including its dependencies,
	  * in bytes.
	  */
	size: number;
	children: StatsNode[];
}

export interface RootStatsNode extends StatsNode {
	bundleName?: string;
}

/** Walk a dependency size tree produced by dependencySizeTree() and output the
  * size contributed to the bundle by each package's own code plus those
  * of its dependencies.
  */
export function printDependencySizeTree(node: StatsNode, sharesStat: boolean, depth: number = 0,
  outputFn: (str: string) => void = console.log) {

	if (node.hasOwnProperty('bundleName')) {
		let rootNode = node as RootStatsNode;
		outputFn(`Bundle: ${rootNode.bundleName}`);
	}

	const childrenBySize = node.children.sort((a, b) => {
		return b.size - a.size;
	});

	const totalSize = node.size
	let remainder = totalSize;
	let includedCount = 0;

	let prefix = '';
	for (let i=0; i < depth; i++) {
		prefix += '  ';
	}

	for (const child of childrenBySize) {
		++includedCount;
		let out = `${prefix}${child.packageName}: ${filesize(child.size)}`;
		if (sharesStat) {
			const percentage = ((child.size/totalSize) * 100).toPrecision(3);
			out = `${out} (${percentage}%)`;
		}
		outputFn(out);
	
		printDependencySizeTree(child, sharesStat, depth + 1, outputFn);

		remainder -= child.size;

		if (remainder < 0.01 * totalSize) {
			break;
		}
	}

	if (depth === 0 || remainder !== totalSize) {
		let out = `${prefix}<self>: ${filesize(remainder)}`;
		if (sharesStat) {
			const percentage = ((remainder/totalSize) * 100).toPrecision(3);
			out = `${out} (${percentage}%)`
		}
		outputFn(out);
	}
}

function bundleSizeTree(stats: webpack_stats.WebpackCompilation) {
	let statsTree: RootStatsNode = {
		packageName: '<root>',
		size: 0,
		children: []
	};

	if (stats.name) {
		statsTree.bundleName = stats.name;
	}

	// extract source path for each module
	let modules = stats.modules.map(mod => {
		return {
			path: modulePath(mod.identifier),
			size: mod.size
		};
	});
	modules.sort((a, b) => {
		if (a === b) {
			return 0;
		} else {
			return a < b ? -1 : 1;
		}
	});

	modules.forEach(mod => {
		// convert each module path into an array of package names, followed
		// by the trailing path within the last module:
		//
		// root/node_modules/parent/node_modules/child/file/path.js =>
		//  ['root', 'parent', 'child', 'file/path.js'

		let packages = mod.path.split(new RegExp('\\' + path.sep + 'node_modules\\' + path.sep));
		let filename = '';
		if (packages.length > 1) {
			let lastSegment = packages.pop() as string;
			let lastPackageName = lastSegment.slice(0, lastSegment.search(new RegExp('\\' + path.sep + '|$')));
			packages.push(lastPackageName);
			filename = lastSegment.slice(lastPackageName.length + 1);
		} else {
			filename = packages[0];
		}
		packages.shift();

		let parent = statsTree;
		parent.size += mod.size;
		packages.forEach(pkg => {
			let existing = parent.children.filter(child => child.packageName === pkg);
			if (existing.length > 0) {
				existing[0].size += mod.size;
				parent = existing[0];
			} else {
				let newChild: StatsNode = {
					packageName: pkg,
					size: mod.size,
					children: []
				};
				parent.children.push(newChild);
				parent = newChild;
			}
		});
	});

	return statsTree;
}

/** Takes the output of 'webpack --json', and returns
  * an array of trees of require()'d package names and sizes.
  *
  * There is one entry in the array for each bundle specified
  * in the Webpack compilation.
  */
export function dependencySizeTree(stats: webpack_stats.WebpackStats) {
	if (webpack_stats.isMultiCompilation(stats)) {
		return stats.children.map(bundleSizeTree);
	} else {
		return [bundleSizeTree(stats)];
	}
}
