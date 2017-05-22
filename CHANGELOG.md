## 2.7.0

- Add note to text output about file sizes not taking into account minification
  (#41).

## 2.6.0

- Enable the tool to be used as a Webpack plugin.

## 2.5.0

- Print a more helpful error if the input is not valid JSON.
- Fix --version output

## 2.4.0

- Include package name for scoped packages (#31)

## 2.3.0

- Added `--no-share-stats` command-line argument which disables output
  dependency sizes as a percentage (#27)

## 2.2.0

- Added `--json` command-line argument which outputs the package size
  tree in JSON format (#20).

## 2.0.2

- Fixed issue with package sizes not being output if a bundle had
  very small dependencies (#15).

## 2.0.0

- Renamed the binary to webpack-bundle-size-analyzer
  to match the package and repository name.

## 1.3.0

- Simplify output by not printing '<self>' lines
  for packages with no dependencies.

## 1.2.0

- Support parsing the output of `webpack --json` generated
  on Windows.
- Add support for processing stats for Webpack configurations
  which generate multiple bundles.

## 1.10

- Initial release
