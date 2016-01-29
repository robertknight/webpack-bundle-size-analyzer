Webpack Bundle Size Analyzer
============================

[![Build Status](https://travis-ci.org/robertknight/webpack-bundle-size-analyzer.png?branch=master)](https://travis-ci.org/robertknight/webpack-bundle-size-analyzer)

A small utility to help you find out what is contributing
to the size of your [Webpack](http://webpack.github.io/) bundles.

Webpack has a JSON output mode which produces detailed machine-readable
information about everything that has been included in a generated bundle.

This output is produced by running `webpack --json`. This tool analyzes
the resulting JSON output and displays a tree of packages that were included
in the bundle, ordered by the size of all the used modules.

For further reading on reducing the size of Webpack bundles,
see their [optimization guide](http://webpack.github.io/docs/optimization.html)

## Usage

````
npm install -g webpack-bundle-size-analyzer
webpack --json | webpack-bundle-size-analyzer
````

When run on [react-testing](https://github.com/robertknight/react-testing) for example,
it produces this output, where `<self>` refers to the size of the bundle's own code.

````
react: 641.95 kB (55.3%)
  <self>: 641.95 kB (100%)
chai: 125.8 kB (10.8%)
  deep-eql: 7.51 kB (5.97%)
    type-detect: 2.72 kB (36.2%)
      <self>: 2.72 kB (100%)
    <self>: 4.79 kB (63.8%)
  assertion-error: 2.29 kB (1.82%)
    <self>: 2.29 kB (100%)
  <self>: 116 kB (92.2%)
flummox: 73.46 kB (6.33%)
  flux: 9.01 kB (12.3%)
    <self>: 9.01 kB (100%)
  eventemitter3: 5.94 kB (8.08%)
    <self>: 5.94 kB (100%)
  uniqueid: 947 B (1.26%)
    <self>: 947 B (100%)
  object-assign: 484 B (0.643%)
    <self>: 484 B (100%)
  <self>: 57.12 kB (77.8%)
q: 58.84 kB (5.07%)
  <self>: 58.84 kB (100%)
...
<self>: 195.57 kB (16.9%)
````

### Important Note About Minification

The statistics reported for modules in Webpack's JSON output do
take into account transformations resulting from loaders, but
not plugins which operate on the whole generated bundle.

The [recommended approach](http://webpack.github.io/docs/optimization.html)
to minifying JavaScript in Webpack bundles is to use the UglifyJS plugin,
which operates on the whole bundle. Consequently the stats shown by webpack-bundle-size-analyzer
will report sizes _before_ minification. This should still give a pretty good idea of what
contributes to your bundle size but some libraries will compress better than others,
so they can be misleading.

A workaround is to generate a Webpack build using [the UglifyJS loader](https://www.npmjs.com/package/uglify-loader)
instead and use the JSON output from that. Since the loader runs on individual files before they are bundled,
the accounting will be correct.


