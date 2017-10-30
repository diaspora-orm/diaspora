'use strict';

const {
	_,
} = require( './dependencies' );

module.exports = {
	defineEnumerableProperties( subject, handlers ) {
		const remappedHandlers = _.mapValues( handlers, handler => {
			if ( _.isNil( handler ) || 'object' !== typeof handler || Object.getPrototypeOf( handler ) !== Object.prototype ) {
				handler = {
					value: handler,
				};
			}
			let defaults = {
				enumerable: true,
			};
			if ( !handler.hasOwnProperty( 'get' )) {
				defaults.writable = false;
			}
			_.defaults( handler, defaults );
			return handler;
		});
		return Object.defineProperties( subject, remappedHandlers );
	},
	/**
	 * Merge update query with the entity. This operation allows to delete fields.
	 *
	 * @author gerkin
	 * @param   {Object} update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
	 * @param   {Object} entity - Entity to update.
	 * @returns {Object} Entity modified.
	 */
	applyUpdateEntity( update, entity ) {
		_.forEach( update, ( val, key ) => {
			if ( _.isUndefined( val )) {
				delete entity[key];
			} else {
				entity[key] = val;
			}
		});
		return entity;
	},
};
