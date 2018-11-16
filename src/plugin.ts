'use strict';

import fs = require('fs');
import path = require('path');
import sizeTree = require('./size_tree');

export class WebpackBundleSizeAnalyzerPlugin {
  filepath: string;
  statsOptions: object;
  constructor(filepath: string = '', statsOptions: object = {}) {
    this.filepath = filepath;
    this.statsOptions = statsOptions;
  }
  apply(compiler: any) {
    compiler.hooks.done.tap('WebpackBundleSizeAnalyzerPlugin', (stats: any) => {
      let filepath = this.filepath;
      if (filepath.length > 0) {
        stats = stats.toJson(this.statsOptions);
        if (!path.isAbsolute(filepath)) {
          filepath = path.resolve(compiler.outputPath, filepath);
        }
        const depTrees = sizeTree.dependencySizeTree(stats);
        let output = '';
        depTrees.forEach(tree => {
            return sizeTree.printDependencySizeTree(tree, true, 0, (out) => {
                output += `${out}\n`;
            });
        });
        fs.writeFile(filepath, output, 'utf8', () => {});
      }
    });
  }
}
