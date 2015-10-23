/// <reference path="typings/typings.d.ts" />

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

/** Walk a dependency size tree produced by dependencySizeTree() and output the
  * size contributed to the bundle by each package's own code plus those
  * of its dependencies.
  */
export function printDependencySizeTree(node: StatsNode, depth: number = 0,
  outputFn: (str: string) => void = console.log) {
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
		remainder -= child.size;

		if (remainder < 0.01 * totalSize) {
			break;
		}

		++includedCount;
		const percentage = ((child.size/totalSize) * 100).toPrecision(3);
		outputFn(`${prefix}${child.packageName}: ${filesize(child.size)} (${percentage}%)`);
	
		printDependencySizeTree(child, depth + 1, outputFn);
	}

	const percentage = ((remainder/totalSize) * 100).toPrecision(3);
	outputFn(`${prefix}<self>: ${filesize(remainder)} (${percentage}%)`);
}

/** Takes the output of 'webpack --json', groups the require()'d modules
  * by their associated NPM package and outputs a tree of package dependencies.
  */
export function dependencySizeTree(stats: webpack_stats.WebpackJsonOutput) {
	let statsTree: StatsNode = {
		packageName: '<root>',
		size: 0,
		children: []
	};

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
		let nodeModulesRegex = new RegExp('\\' + path.sep + 'node_modules' + '\\' + path.sep);
		let packages = mod.path.split(nodeModulesRegex);
		let filename = '';
		if (packages.length > 1) {
			let lastSegment = packages.pop();
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

