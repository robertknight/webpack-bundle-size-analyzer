import lib = require('../src/index');

describe('index.ts', () => {
	it('should include all exported functions in library', () => {
		expect(lib).toHaveProperty('printDependencySizeTree');
		expect(lib).toHaveProperty('dependencySizeTree');
		expect(lib).toHaveProperty('isMultiCompilation');
		expect(lib).toHaveProperty('WebpackBundleSizeAnalyzerPlugin');
		expect(Object.keys(lib).length).toEqual(4);
	});
});
