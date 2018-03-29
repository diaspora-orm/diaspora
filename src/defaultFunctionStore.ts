import * as _ from 'lodash';

export const namedFunctions = {
	Diaspora: {
		'Date.now()': () => new Date(),
	},
};

export const getDefaultFunction = (identifier: string | Function): Function => {
	if (_.isString(identifier)) {
		const match = identifier.match(/^(.+?)(?:::(.+?))+$/);
		if (match) {
			const parts = identifier.split('::');
			const namedFunction = _.get(namedFunctions, parts);
			if (_.isFunction(namedFunction)) {
				return namedFunction();
			}
		}
		return _.identity;
	}
	return identifier;
};
