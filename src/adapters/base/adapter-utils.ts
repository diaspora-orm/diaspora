import _ from 'lodash';
import Bluebird from 'bluebird';

import * as QueryLanguage from './queryLanguage';
import { AdapterEntity, Adapter } from '.';

function getNum(fullMatch: string, sign: string, val: string): number;
function getNum([fullMatch, sign, val]: string[]): number;
function getNum(...params: (string | string[])[]) {
	const flatten = _.flattenDeep(params) as string[];
	const [fullMatch, sign, val] = flatten;
	if ('∞' === val) {
		if ('-' === sign) {
			return -Infinity;
		} else {
			return Infinity;
		}
	} else {
		return parseInt(fullMatch, 10);
	}
}

const validations = {
	type: {
		int(key: string, val: string | number) {
			if (_.isString(val)) {
				val = parseInt(val, 10);
			}
			if (!_.isInteger(val) && isFinite(val)) {
				throw new TypeError(`Expect "${key}" to be an integer`);
			}
			return val;
		},
	},
	rng(key: string, val: string | number, range: string) {
		const rangeMatch = range.match(/^([[\]])((-)?(\d+|∞)),((-)?(\d+|∞))([[\]])$/);
		if (rangeMatch) {
			const lower = getNum(rangeMatch.splice(2, 3));
			const upper = getNum(rangeMatch.splice(2, 3));
			const isInRangeLower = '[' === rangeMatch[1] ? val >= lower : val > lower;
			const isInRangeUpper = ']' === rangeMatch[2] ? val <= upper : val < upper;
			if (!(isInRangeLower && isInRangeUpper)) {
				throw new RangeError(
					`Expect "${key}" to be within ${range}, have "${val}"`
				);
			}
		}
		return val;
	},
};
const validateOption = (
	key: string,
	val: string | number,
	config: { type: string; rng?: string }
): any => {
	const valTypes: any = validations.type;
	if (valTypes[config.type]) {
		val = valTypes[config.type](key, val);
	}
	if (config.rng) {
		val = validations.rng(key, val, config.rng);
	}
	return val;
};

export const iterateLimit = async (
	options: QueryLanguage.QueryOptions,
	query: (options: QueryLanguage.QueryOptions) => Bluebird<AdapterEntity>
): Bluebird<AdapterEntity[]> => {
	const foundEntities: AdapterEntity[] = [];
	let foundCount = 0;
	let origSkip = options.skip;

	// We are going to loop until we find enough items
	const loopFind = async (
		found?: AdapterEntity | true
	): Bluebird<AdapterEntity[]> => {
		// If the search returned nothing, then just finish the findMany
		if (_.isNil(found)) {
			return Promise.resolve(foundEntities);
			// Else, if this is a value and not the initial `true`, add it to the list
		} else if (found instanceof AdapterEntity) {
			foundEntities.push(found);
		}
		// If we found enough items, return them
		if (foundCount === options.limit) {
			return Promise.resolve(foundEntities);
		}
		options.skip = origSkip + foundCount;
		// Next time we'll skip 1 more item
		foundCount++;
		// Do the query & loop
		return loopFind(await query(options));
	};
	return loopFind(true);
};

/**
 * TODO.
 *
 * @author gerkin
 * @see TODO remapping.
 */
export const remapIO = (
	adapter: Adapter,
	tableName: string,
	query: object,
	input: boolean
): object => {
	if (_.isNil(query)) {
		return query;
	}
	const direction = true === input ? 'input' : 'output';
	const filtered = _.mapValues(query, (value, key) => {
		const filter = _.get(
			adapter,
			['filters', tableName, direction, key],
			undefined
		);
		if (_.isFunction(filter)) {
			return filter(value);
		}
		return value;
	});
	const remapType = true === input ? 'normal' : 'inverted';
	const remaped = _.mapKeys(filtered, (value, key) => {
		return _.get(adapter, ['remaps', tableName, remapType, key], key);
	});
	return remaped;
};

export const OPERATORS = {
	$exists: (entityVal: any, targetVal: any) =>
		targetVal === !_.isUndefined(entityVal),
	$equal: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal === targetVal,
	$diff: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal !== targetVal,
	$less: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal < targetVal,
	$lessEqual: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal <= targetVal,
	$greater: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal > targetVal,
	$greaterEqual: (entityVal: any, targetVal: any) =>
		!_.isUndefined(entityVal) && entityVal >= targetVal,
};
export const CANONICAL_OPERATORS = {
	'~': '$exists',
	'==': '$equal',
	'!=': '$diff',
	'<': '$less',
	'<=': '$lessEqual',
	'>': '$greater',
	'>=': '$greaterEqual',
};
export const QUERY_OPTIONS_TRANSFORMS = {
	limit(opts: QueryLanguage.QueryOptionsRaw) {
		opts.limit = validateOption('limit', opts.limit as number, {
			type: 'int',
			rng: '[0,∞]',
		});
	},
	skip(opts: QueryLanguage.QueryOptionsRaw) {
		opts.skip = validateOption('skip', opts.skip as number, {
			type: 'int',
			rng: '[0,∞[',
		});
	},
	page(opts: QueryLanguage.QueryOptionsRaw) {
		if (!opts.hasOwnProperty('limit')) {
			throw new ReferenceError(
				'Usage of "options.page" requires "options.limit" to be defined.'
			);
		}
		if (!isFinite(opts.limit as number)) {
			throw new RangeError(
				'Usage of "options.page" requires "options.limit" to not be infinite'
			);
		}
		if (opts.hasOwnProperty('skip')) {
			throw new ReferenceError('Use either "options.page" or "options.skip"');
		}
		opts.skip =
			validateOption('page', opts.page as number, {
				type: 'int',
				rng: '[0,∞[',
			}) * (opts.limit as number);
		delete opts.page;
	},
};
