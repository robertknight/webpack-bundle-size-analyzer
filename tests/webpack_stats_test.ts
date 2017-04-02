import fs = require('fs');
import path = require('path');

import webpack_stats = require('../src/webpack_stats');
const { isMultiCompilation } = webpack_stats;

describe('isMultiCompilation()', () => {
	it('should return false for non-multi stats objects', () => {
		const statsJsonStr = fs.readFileSync(path.join('tests', 'fixtures/stats.json')).toString();
		const statsJson = <webpack_stats.WebpackCompilation>JSON.parse(statsJsonStr);
		expect(isMultiCompilation(statsJson)).toEqual(false);
	});
	it('should return true for multi stats objects', () => {
		const multiStatsJsonStr = fs.readFileSync(path.join('tests', 'fixtures/multiple-bundle-stats.json')).toString();
		const multiStatsJson = <webpack_stats.WebpackCompilation>JSON.parse(multiStatsJsonStr);
		expect(isMultiCompilation(multiStatsJson)).toEqual(true);
	});
});
