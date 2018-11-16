const path = require('path');
const { WebpackBundleSizeAnalyzerPlugin } = require('../../');

module.exports = {
  entry: './index.js',
  plugins: [
    new WebpackBundleSizeAnalyzerPlugin('./dependency-size-report.txt'),
  ],
  output: {
    filename: 'app.bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
