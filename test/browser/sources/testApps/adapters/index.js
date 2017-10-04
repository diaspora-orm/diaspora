'use strict';

var describeApp = function describeApp(level, name, slug, adapter) {
	describe('Level ' + level + ': ' + name, function () {
		var data = void 0;
		try {
			data = require('./' + slug + '.json');
		} catch (err) {}
		try {
			require('./' + slug)(adapter, data, 'app1-matchmail');
		} catch (err) {
			console.log('Could not prepare app:', err);
		}
	});
};

module.exports = function (adapter) {
	describe(chalk.underline.white('Testing adapter with apps'), function () {
		describeApp(1, 'MatchMail Simple', 'app1-matchmail-simple', adapter);
	});
};

// Symbols: ✨ 🔎 🔃 ❌
