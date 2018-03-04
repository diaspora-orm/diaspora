import _ from 'lodash';

import { IRawEntityAttributes } from './entityFactory';
import { QueryLanguage } from './adapters/base';

/**
 * @module Utils
 */

export const defineEnumerableProperties = (
	subject: object,
	handlers: object
) => {
	const remappedHandlers = _.mapValues(handlers, handler => {
		if (
			_.isNil(handler) ||
			'object' !== typeof handler ||
			Object.getPrototypeOf(handler) !== Object.prototype
		) {
			handler = {
				value: handler,
			};
		}
		let defaults: { enumerable: boolean; writable?: boolean } = {
			enumerable: true,
		};
		if (!handler.hasOwnProperty('get')) {
			defaults.writable = false;
		}
		_.defaults(handler, defaults);
		return handler;
	}) as PropertyDescriptorMap;
	return Object.defineProperties(subject, remappedHandlers);
};

/**
 * Merge update query with the entity. This operation allows to delete fields.
 *
 * @author gerkin
 * @param   update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
 * @param   entity - Entity to update.
 * @returns Entity modified.
 */
export const applyUpdateEntity = (
	update: IRawEntityAttributes,
	entity: IRawEntityAttributes
): IRawEntityAttributes => {
	_.forEach(update, (val, key) => {
		if (_.isUndefined(val)) {
			delete entity[key];
		} else {
			entity[key] = val;
		}
	});
	return entity;
};

/**
 * Create a new unique id for this store's entity.
 *
 * @author gerkin
 * @returns Generated unique id.
 */
export const generateUUID = (): string => {
	let d = new Date().getTime();
	// Use high-precision timer if available
	const perf = (global as any).performance;
	if (perf && 'function' === typeof perf.now) {
		d += perf.now();
	}
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = ((d + Math.random() * 16) % 16) | 0;
		d = Math.floor(d / 16);
		return ('x' === c ? r : (r & 0x3) | 0x8).toString(16);
	});
	return uuid;
};

/**
 * Reduce, offset or sort provided set.
 *
 * @author gerkin
 * @param   set     - Objects retrieved from memory store.
 * @param   options - Options to apply to the set.
 * @returns Set with options applied.
 */
export const applyOptionsToSet = (
	set: Array<IRawEntityAttributes>,
	options: QueryLanguage.QueryOptions
): Array<IRawEntityAttributes> => {
	_.defaults(options, {
		limit: Infinity,
		skip: 0,
	});
	set = set.slice(options.skip);
	if (set.length > options.limit) {
		set = set.slice(0, options.limit);
	}
	return set;
};
