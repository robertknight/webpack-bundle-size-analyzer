'use strict';

import fs = require('fs');
import path = require('path');
import sizeTree = require('./size_tree');

export class WebpackBundleSizeAnalyzerPlugin {
  filepath: string;
  statsOptions: object;
  constructor(filepath: string, statsOptions: object = {}) {
    this.filepath = filepath;
    this.statsOptions = statsOptions || {};
  }
  apply(compiler: any) {
    compiler.plugin('done', (stats: any) => {
        stats = stats.toJson(this.statsOptions);
        if (!path.isAbsolute(this.filepath)) {
          this.filepath = path.resolve(compiler.outputPath, this.filepath);
        }
        const depTrees = sizeTree.dependencySizeTree(stats);
        let output = '';
        depTrees.forEach(tree => {
            return sizeTree.printDependencySizeTree(tree, true, 0, (out) => {
                output += `${out}\n`;
            });
        });
        fs.writeFile(this.filepath, output, 'utf-8', () => {
            console.log(`WebpackBundleSizeAnalyzerPlugin wrote to:\n${this.filepath}`);
        });
    });
  }
}
