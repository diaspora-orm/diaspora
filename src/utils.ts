import * as _ from 'lodash';

import { IEntityAttributes, IEntityProperties } from './types/entity';
import { QueryLanguage } from './types/queryLanguage';
import { namedFunctions } from './staticStores';

/*#if _BROWSER
export const glob = window as Window | any;
//#else // */
export const glob = global as Window | any;
// tslint:disable-next-line:comment-format
//#endif

/**
 * Merge update query with the entity. This operation allows to delete fields.
 *
 * @author gerkin
 * @param   update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
 * @param   entity - Entity to update.
 * @returns Entity modified.
 */
export const applyUpdateEntity = (
	update: IEntityAttributes,
	entity: IEntityAttributes
): IEntityAttributes => {
	_.forEach( update, ( val, key ) => {
		if ( _.isUndefined( val ) ) {
			delete entity[key];
		} else {
			entity[key] = val;
		}
	} );
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
	const perf = glob.performance;
	if ( perf && 'function' === typeof perf.now ) {
		d += perf.now();
	}
	const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
		const r = ( d + Math.random() * 16 ) % 16 | 0;
		d = Math.floor( d / 16 );
		return ( 'x' === c ? r : ( r & 0x3 ) | 0x8 ).toString( 16 );
	} );
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
	set: IEntityProperties[],
	options: QueryLanguage.IQueryOptions
): IEntityProperties[] => {
	_.defaults( options, {
		limit: Infinity,
		skip: 0,
	} );
	set = set.slice( options.skip );
	if ( set.length > options.limit ) {
		set = set.slice( 0, options.limit );
	}
	return set;
};

/**
 * Totally freeze an object, preventing any modifications on it.
 *
 * @author gerkin
 * @param object - Object to freeze
 * @returns The frozen object
 */
export const deepFreeze = <TObject>( object: TObject ) => {
	const deepMap = ( obj: TObject, mapper: Function ): TObject =>
	mapper(
		_.isObject( obj )
		? _.mapValues( ( obj as any ) as object, function( v ) {
			return _.isPlainObject( v ) ? deepMap( v, mapper ) : v;
		} )
		: obj
	);
	return deepMap( object, Object.freeze );
};

export const getDefaultFunction = (
	identifier: string
): ( ( ...args: any[] ) => any ) => {
	const match = identifier.match( /^(.+?)(?:::(.+?))+$/ );
	if ( match ) {
		const parts = identifier.split( '::' );
		const namedFunction = _.get( namedFunctions, parts );
		if ( _.isFunction( namedFunction ) ) {
			return namedFunction;
		}
	}
	return _.identity;
};

export const getDefaultValue = ( value: any ) => {
	if ( _.isFunction( value ) ) {
		return value();
	} else if ( _.isString( value ) ) {
		return getDefaultFunction( value )( value );
	}
	return value;
};
