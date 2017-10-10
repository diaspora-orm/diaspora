(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Diaspora = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const Diaspora = require( './lib/diaspora' );

module.exports = Diaspora;

},{"./lib/diaspora":9}],2:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );

/**
 * @namespace ConstrainedTypes
 * @description Namespace for types with constraints, like <code>[0, Infinity]</code>, <code>]0, Infinity[</code>, etc etc
 */

/**
 * @typedef {Integer} AbsInt0
 * @memberof ConstrainedTypes
 * @description Integer equal or above 0
 */

/**
 * @typedef {Integer} AbsInt
 * @memberof ConstrainedTypes
 * @description Integer above 0
 */

/**
 * @typedef {Integer} AbsIntInf
 * @memberof ConstrainedTypes
 * @description Integer above 0, may be integer
 */

/**
 * @typedef {Integer} AbsIntInf0
 * @memberof ConstrainedTypes
 * @description Integer equal or above 0, may be integer
 */

/**
 * @namespace QueryLanguage
 */

/**
 * @typedef {Object} QueryOptions
 * @description All properties are optional
 * @memberof QueryLanguage
 * @public
 * @instance
 * @author gerkin
 * @property {ConstrainedTypes.AbsInt0} skip=0 Number of items to skip
 * @property {ConstrainedTypes.AbsIntInf0} limit=Infinity Number of items to get
 * @property {ConstrainedTypes.AbsInt0} page To use with {@link QueryOptions.limit `limit`} and without {@link QueryOptions.skip `skip`}. Skips `page` pages of `limit` elements
 * @property {Boolean} remapInput=true Flag indicating if adapter input should be remapped or not. TODO Remapping doc
 * @property {Boolean} remapOutput=true Flag indicating if adapter output should be remapped or not. TODO Remapping doc
 */

/**
 * @typedef {Object} SelectQuery
 * @memberof QueryLanguage
 * @public
 * @instance
 * @author gerkin
 * @property {Any|SelectQueryCondition} * Fields to search. If not providing an object, find items with a property value that equals this value
 */

/**
 * @typedef {Object} SelectQueryCondition
 * @description By default, all conditions in a single SelectQueryCondition are combined with an `AND` operator
 * @memberof QueryLanguage
 * @public
 * @instance
 * @author gerkin
 * @property {Any} $equals Match if item value is equal to this. Objects and array are compared deeply. **Alias: `==`**
 * @property {Any} $diff Match if item value is different to this. Objects and array are compared deeply. **Alias: `!=`** **NOT IMPLEMENTED YET**
 * @property {Boolean} $exists If `true`, match items where this prop is defined. If `false`, match when prop is null or not set. **Alias: `~`** **NOT IMPLEMENTED YET**
 * @property {Integer} $less Match if item value is less than this. **Alias: `<`** **NOT IMPLEMENTED YET**
 * @property {Integer} $lessEqual Match if item value is less than this or equals to this. **Alias: `<=`** **NOT IMPLEMENTED YET**
 * @property {Integer} $greater Match if item value is greater than this. **Alias: `>`** **NOT IMPLEMENTED YET**
 * @property {Integer} $greaterEqual Match if item value is greater than this or equals to this. **Alias: `>=`** **NOT IMPLEMENTED YET** 
 * @property {QueryLanguage#SelectQueryOrCondition[]} $or Match if *one of* the conditions in the array is true. **Alias: `||`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition[]} $and Match if *all* the conditions in the array are true. Optional, because several conditions in a single SelectQueryCondition are combined with an `AND` operator. **Alias: `&&`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition[]} $xor Match if *a single* of the conditions in the array is true. **Alias: `^^`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition} $not Invert the condition **Alias: `!`** **NOT IMPLEMENTED YET**
 * @property {String} $contains On *string*, it will check if query is included in item using GLOB. **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition|Any} $contains On *array*, it will check if item contains the query. **NOT IMPLEMENTED YET**
 * @property {Any[]} $in Check if item value is contained (using deep comparaison) in query. **NOT IMPLEMENTED YET**
 */

/**
 * @typedef {QueryLanguage#SelectQuery|QueryLanguage#SelectQueryCondition} SelectQueryOrCondition
 * @memberof QueryLanguage
 * @public
 * @instance
 * @author gerkin
 */

/**
 * @namespace Adapters
 */

/**
 * @constructor DiasporaAdapter
 * @classdesc DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @memberof Adapters
 * @author gerkin
 */
class DiasporaAdapter extends SequentialEvent {
	/**
	 * @description Create a new instance of adapter. This base class should be used by all other adapters.
	 * @memberof Adapters
	 * @public
	 * @author gerkin
	 * @param {DataStoreEntities.DataStoreEntity} classEntity Entity spawned by this adapter.
	 */
	constructor( classEntity ) {
		super();
		this.remaps = {};
		this.remapsInverted = {};
		this.filters = {};
		this.classEntity = classEntity;
		this.on( 'ready', () => {
			this.state = 'ready';
		}).on( 'error', err => {
			this.state = 'error';
			this.error = err;
		});
	}
	
	/**
	 * @event Adapters.DiasporaAdapter#ready
	 * @description Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
	 * @type {undefined}
	 * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
	 */
	
	/**
	 * @event Adapters.DiasporaAdapter#error
	 * @description Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`
	 * @type {Error}
	 * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
	 */

	/**
	 * @method configureCollection
	 * @description Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} tableName Name of the table (usually, model name)
	 * @param {Object} remaps    Associative hash that links entity field names with data source field names
	 * @param {Object} [filters = {}]   Not used yet...
	 * @returns {undefined}
	 */
	configureCollection( tableName, remaps, filters = {}) {
		this.remaps[tableName] = remaps;
		this.remapsInverted[tableName] = _.invert( remaps );
		this.filters = filters || {};
	}

	// -----
	// ### Utils

	/**
	 * @method waitReady
	 * @description Returns a promise resolved once adapter state is ready
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured
	 */
	waitReady() {
		return new Promise(( resolve, reject ) => {
			if ( 'ready' === this.state ) {
				return resolve( this );
			} else if ( 'error' === this.state ) {
				return reject( this.error );
			}
			this.on( 'ready', () => {
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}

	/**
	 * @method remapFields
	 * @description Cast entity field names to table field name, or the opposite.
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} tableName Name of the table we are remapping for
	 * @param   {Object} query Hash representing the raw query to remap
	 * @param   {Boolean} [invert = false] `false` to cast to `table` field names, `true` to cast to `entity` field name
	 * @returns {Object} Remapped object.
	 */
	remapFields( tableName, query, invert = false ) {
		const keysMap = ( invert ? this.remapsInverted : this.remaps )[tableName];
		if ( _.isNil( keysMap )) {
			return query;
		}
		return _.mapKeys( query, ( value, key ) => {
			if ( keysMap.hasOwnProperty( key )) {
				return keysMap[key];
			}
			return key;
		});
	}

	/**
	 * @method remapInput
	 * @description TODO
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see TODO remapping
	 * @param   {String} tableName  Name of the table for which we remap
	 * @param   {Object} query Hash representing the entity to remap
	 * @returns {Object} Remapped object
	 */
	remapInput( tableName, query ) {
		if ( _.isNil( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( this.filters.input.hasOwnProperty( key )) {
				return this.filters.input[key]( value );
			}
			return value;
		});
		const remaped = _.mapKeys( filtered, ( value, key ) => {
			if ( this.remaps.hasOwnProperty( key )) {
				return this.remaps[key];
			}
			return key;
		});
		return remaped;
	}

	/**
	 * @method remapOutput
	 * @description TODO
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @see TODO remapping
	 * @param   {String} tableName  Name of the table for which we remap
	 * @param   {Object} query Hash representing the entity to remap
	 * @returns {Object} Remapped object
	 */
	remapOutput( tableName, query ) {
		if ( _.isNil( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( this.filters.output.hasOwnProperty( key )) {
				return this.filters.output[key]( value );
			}
			return value;
		});
		const remaped = _.mapKeys( filtered, ( value, key ) => {
			if ( this.remapsInverted.hasOwnProperty( key )) {
				return this.remapsInverted[key];
			}
			return key;
		});
		return remaped;
	}

	/**
	 * @method setIdHash
	 * @description Refresh the `idHash` with current adapter's `id` injected
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object}   entity          Object containing attributes of the entity
	 * @param   {String} propName = 'id' Name of the `id` field
	 * @returns {Object} Modified entity (for chaining)
	 */
	setIdHash( entity, propName = 'id' ) {
		entity.idHash = _.assign({}, entity.idHash, {
			[this.name]: entity[propName],
		});
		return entity;
	}

	/**
	 * @method matchEntity
	 * @description Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage.SelectQuery} query  Query to match against
	 * @param   {Object} entity Entity to test
	 * @returns {Boolean}  `true` if query matches, `false` otherwise
	 */
	matchEntity( query, entity ) {
		const matchResult = _.every( _.toPairs( query ), ([ key, desc ]) => {
			if ( _.isObject( desc )) {
				const entityVal = entity[key];
				return _.every( desc, ( val, operation ) => {
					switch ( operation ) {
						case '$exists': {
							return val === !_.isUndefined( entityVal );
						}

						case '$equal': {
							return !_.isUndefined( entityVal ) && entityVal === val;
						}

						case '$diff': {
							return !_.isUndefined( entityVal ) && entityVal !== val;
						}

						case '$less': {
							return !_.isUndefined( entityVal ) && entityVal < val;
						}

						case '$lessEqual': {
							return !_.isUndefined( entityVal ) && entityVal <= val;
						}

						case '$greater': {
							return !_.isUndefined( entityVal ) && entityVal > val;
						}

						case '$greaterEqual': {
							return !_.isUndefined( entityVal ) && entityVal >= val;
						}
					}
					return false;
				});
			}
			return false;
		});
		return matchResult;
	}

	/**
	 * @method applyUpdateEntity
	 * @description Merge update query with the entity. This operation allows to delete fields.
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @param {Object} update Hash representing modified values. A field with an `undefined` value deletes this field from the entity
	 * @param {Object} entity Entity to update
	 * @returns {Object} Entity modified
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
	}

	/**
	 * @method normalizeOptions
	 * @description Transform options to their canonical form. This function must be applied before calling adapters' methods
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @throws {TypeError} Thrown if an option does not have an acceptable type
	 * @throws {ReferenceError} Thrown if a required option is not present
	 * @throws {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs) 
	 * @param   {Object}   [opts={}] Options to transform
	 * @returns {Object} Transformed options (also called `canonical options`)
	 */
	normalizeOptions( opts = {}) {
		opts = _.cloneDeep( opts );
		if ( opts.hasOwnProperty( 'limit' )) {
			let limitOpt = opts.limit;
			if ( _.isString( limitOpt )) {
				limitOpt = parseInt( limitOpt );
			}
			if ( !( _.isInteger( limitOpt ) || Infinity === limitOpt ) || limitOpt < 0 ) {
				throw new TypeError( `Expect "options.limit" to be an integer equal to or above 0, have ${ limitOpt }` );
			}
			opts.limit = limitOpt;
		}
		if ( opts.hasOwnProperty( 'skip' )) {
			let skipOpt = opts.skip;
			if ( _.isString( skipOpt )) {
				skipOpt = parseInt( skipOpt );
			}
			if ( !_.isInteger( skipOpt ) || skipOpt < 0 || !isFinite( skipOpt )) {
				throw new TypeError( `Expect "options.skip" to be a finite integer equal to or above 0, have ${ skipOpt }` );
			}
			opts.skip = skipOpt;
		}
		if ( opts.hasOwnProperty( 'page' )) {
			if ( !opts.hasOwnProperty( 'limit' )) {
				throw new ReferenceError( 'Usage of "options.page" requires "options.limit" to be defined.' );
			}
			if ( !isFinite( opts.limit )) {
				throw new ReferenceError( 'Usage of "options.page" requires "options.limit" to not be infinite' );
			}
			if ( opts.hasOwnProperty( 'skip' )) {
				throw new Error( 'Use either "options.page" or "options.skip"' );
			}
			let pageOpt = opts.page;
			if ( _.isString( pageOpt )) {
				pageOpt = parseInt( pageOpt );
			}
			if ( !_.isInteger( pageOpt ) || pageOpt < 0 ) {
				throw new TypeError( `Expect "options.page" to be an integer equal to or above 0, have ${ pageOpt }` );
			}
			opts.skip = pageOpt * opts.limit;
			delete opts.page;
		}
		_.defaults( opts, {
			skip:        0,
			remapInput:  true,
			remapOutput: true,
		});
		return opts;
	}

	/**
	 * @method normalizeQuery
	 * @description Transform a search query to its canonical form, replacing aliases or shorthands by full query.
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @param {QueryLanguage.SelectQueryOrCondition} originalQuery Query to cast to its canonical form
	 * @param {QueryLanguage.Options} options       Options for this query
	 * @returns {QueryLanguage.SelectQueryOrCondition} Query in its canonical form
	 */
	normalizeQuery( originalQuery, options ) {
		const canonicalOperations = {
			'~':  '$exists',
			'==': '$equal',
			'!=': '$diff',
			'<':  '$less',
			'<=': '$lessEqual',
			'>':  '$greater',
			'>=': '$greaterEqual',
		};
		const normalizedQuery = true === options.remapInput ? _( _.cloneDeep( originalQuery )).mapValues( attrSearch => {
			if ( !( !_.isNil( attrSearch ) && attrSearch instanceof Object )) {
				if ( !_.isNil( attrSearch )) {
					return {
						$equal: attrSearch,
					};
				} else {
					return {
						$exists: false,
					};
				}
			} else {
				// Replace operations alias by canonical expressions
				_.forEach( canonicalOperations, ( canon, alias ) => {
					// If the currently checked alias is in the search hash...
					if ( attrSearch.hasOwnProperty( alias )) {
						// ... check for conflict with canonical operation name...
						if ( attrSearch.hasOwnProperty( canon )) {
							throw new Error( `Search can't have both "${ alias }" and "${ canon }" keys, as they are synonyms` );
						} else {
							// ... and replace alias by canonical
							attrSearch[canon] = attrSearch[alias];
							delete attrSearch[alias];
						}
					}
				});
				// For arithmetic comparison, check if values are numeric (TODO later: support date)
				_.forEach([ '$less', '$lessEqual', '$greater', '$greaterEqual' ], operation => {
					if ( attrSearch.hasOwnProperty( operation ) && !_.isNumber( attrSearch[operation])) {
						throw new TypeError( `Expect "${ operation }" in ${ JSON.stringify( attrSearch ) } to be a numeric value` );
					}
				});
				return attrSearch;
			}
		}).value() : _.cloneDeep( originalQuery );
		return normalizedQuery;
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter
	 * @description Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}* entity)
	 */
	insertOne( table, entity ) {
		return this.insertMany( table, [ entity ]).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method insertMany
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter
	 * @description Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object[]} entities Array of hashs representing the entities to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}[]* entities)
	 */
	insertMany( table, entities ) {
		return Promise.mapSeries( entities, entity => this.insertOne( table, entity || {}));
	}

	// -----
	// ### Find

	/**
	 * @method findOne
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
	 * @description Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.findMany( table, queryFind, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method findMany
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
	 * @description Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	findMany( table, queryFind, options = {}) {
		const foundEntities = [];
		options = this.normalizeOptions( options );
		let foundCount = 0;
		let origSkip = options.skip;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if ( _.isNil( found )) {
				return Promise.resolve( foundEntities );
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if ( found !== true ) {
				foundEntities.push( found );
			}
			// If we found enough items, return them
			if ( foundCount === options.limit ) {
				return Promise.resolve( foundEntities );
			}
			options.skip = origSkip + foundCount;
			// Next time we'll skip 1 more item
			foundCount++;
			// Do the query & loop
			return this.findOne( table, queryFind, options ).then( loopFind );
		};
		return loopFind( true );
	}

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
	 * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		options.limit = 1;
		return this.updateMany( table, queryFind, update, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * @method updateMany
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
	 * @description Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	updateMany( table, queryFind, update, options = {}) {
		const foundEntities = [];
		let skip = 0;

		// We are going to loop until we find enough items
		const loopFind = found => {
			// If the search returned nothing, then just finish the findMany
			if ( _.isNil( found )) {
				return Promise.resolve( foundEntities );
				// Else, if this is a value and not the initial `true`, add it to the list
			} else if ( found !== true ) {
				foundEntities.push( found );
			}
			// If we found enough items, return them
			if ( skip === options.limit ) {
				return Promise.resolve( foundEntities );
			}
			options.skip = skip;
			// Next time we'll skip 1 more item
			skip++;
			// Do the query & loop
			return this.updateOne( table, queryFind, update, options ).then( loopFind );
		};
		return loopFind( true );
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter
	 * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing the entities to find
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
	 */
	deleteOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.deleteMany( table, queryFind, options );
	}

	/**
	 * @method deleteMany
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter
	 * @description Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself
	 * @memberof Adapters.DiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind Hash representing the entities to find
	 * @param   {QueryLanguage#QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
	 */
	deleteMany( table, queryFind, options = {}) {
		let count = 0;

		// We are going to loop until we find enough items
		const loopFind = () => {
			// First, search for the item.
			return this.findOne( table, queryFind, options ).then( found => {
				// If the search returned nothing, then just finish the findMany
				if ( _.isNil( found )) {
					return Promise.resolve();
					// Else, if this is a value and not the initial `true`, add it to the list
				}
				// If we found enough items, return them
				if ( count === options.limit ) {
					return Promise.resolve();
				}
				// Increase our counter
				count++;
				// Do the deletion & loop
				return this.deleteOne( table, queryFind, options ).then( loopFind );
			});
		};
		return loopFind( true );
	}
}

module.exports = DiasporaAdapter;

},{"lib/dependencies":8}],3:[function(require,module,exports){
(function (global){
'use strict';

const {
	_, Promise,
} = require( 'lib/dependencies' );

const DiasporaAdapter = require( 'lib/adapters/baseAdapter.js' );
const InMemoryEntity = require( 'lib/dataStoreEntities/inMemoryEntity.js' );

/**
 * @class InMemoryDiasporaAdapter
 * @classdesc This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class InMemoryDiasporaAdapter extends DiasporaAdapter {
	/**
	 * @description Create a new instance of in memory adapter
	 * @memberof Adapters
	 * @public
	 * @author gerkin
	 */
	constructor() {
		super( InMemoryEntity );
		this.state = 'ready';
		this.store = {};
	}

	/**
	 * @method configureCollection
	 * @description Create the data store and call {@link Adapters.DiasporaAdapter.configureCollection}
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} tableName Name of the table (usually, model name)
	 * @param {Object} remaps    Associative hash that links entity field names with data source field names
	 * @returns {undefined}
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
	}

	// -----
	// ### Utils

	/**
	 * @method generateUUID
	 * @description Create a new unique id for this store's entity
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {String} Generated unique id
	 */
	generateUUID() {
		let d = new Date().getTime();
		// Use high-precision timer if available
		if ( global.performance && 'function' === typeof global.performance.now ) {
			d += global.performance.now();
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	/**
	 * @method ensureCollectionExists
	 * @description Get or create the store hash
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table
	 * @returns {DataStoreTable} In memory table to use
	 */
	ensureCollectionExists( table ) {
		if ( this.store.hasOwnProperty( table )) {
			return this.store[table];
		} else {
			return this.store[table] = {
				items: [],
			};
		} 
	}

	/**
	 * @method applyOptionsToSet
	 * @description Reduce, offset or sort provided set
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} set  Objects retrieved from memory store
	 * @param   {Object} options Options to apply to the set
	 * @returns {Object[]} Set with options applied
	 */
	static applyOptionsToSet( set, options ) {
		_.defaults( options, {
			limit: Infinity,
			skip:  0,
		});
		set = set.slice( options.skip );
		if ( set.length > options.limit ) {
			set = set.slice( 0, options.limit );
		}
		return set;
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @description Insert a single entity in the memory store.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity );
		const storeTable = this.ensureCollectionExists( table );
		entity.id = this.generateUUID();
		this.setIdHash( entity );
		storeTable.items.push( entity );
		return Promise.resolve( new this.classEntity( entity, this ));
	}

	// -----
	// ### Find

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @description Retrieve a single entity from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( reducedMatches.length > 0 ? new this.classEntity( _.first( reducedMatches ), this ) : undefined );
	}

	/**
	 * @method findMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
	 * @description Retrieve several entities from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to retrieve data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`)
	 */
	findMany( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity( entity, this )));
	}

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @description Update a single entity in the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options = {}) {
		return this.findOne( table, queryFind, options ).then( found => {
			if ( !_.isNil( found )) {
				const storeTable = this.ensureCollectionExists( table );
				const match = _.find( storeTable.items, {
					id: found.id,
				});
				this.applyUpdateEntity( update, match );
				return Promise.resolve( new this.classEntity( match, this ));
			} else {
				return Promise.resolve();
			}
		});
	}

	/**
	 * @method updateMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
	 * @description Update several entities in the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`)
	 */
	updateMany( table, queryFind, update, options = {}) {
		return this.findMany( table, queryFind, options ).then( found => {
			if ( !_.isNil( found ) && found.length > 0 ) {
				const storeTable = this.ensureCollectionExists( table );
				const foundIds = _.map( found, 'id' );
				const matches = _.filter( storeTable.items, item => -1 !== foundIds.indexOf( item.id ));
				return Promise.resolve( _.map( matches, item => {
					this.applyUpdateEntity( update, item );
					return new this.classEntity( item, this );
				}));
			} else {
				return Promise.resolve();
			}
		});
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @description Delete a single entity from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			return Promise.resolve();
		});
	}

	/**
	 * @method deleteMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
	 * @description Delete several entities from the memory.
	 * @memberof Adapters.InMemoryDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*)
	 */
	deleteMany( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
			const entitiesIds = _.map( entitiesToDelete, entity => _.get( entity, `idHash.${ this.name }` ));
			storeTable.items = _.reject( storeTable.items, entity => {
				return _.includes( entitiesIds, entity.id );
			});
			return Promise.resolve();
		});
	}
}

module.exports = InMemoryDiasporaAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lib/adapters/baseAdapter.js":2,"lib/dataStoreEntities/inMemoryEntity.js":6,"lib/dependencies":8}],4:[function(require,module,exports){
(function (global){
'use strict';

const {
	_, Promise,
} = require( 'lib/dependencies' );
const DiasporaAdapter = require( 'lib/adapters/baseAdapter.js' );
const LocalStorageEntity = require( 'lib/dataStoreEntities/localStorageEntity.js' );

/**
 * @class LocalStorageDiasporaAdapter
 * @classdesc This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class LocalStorageDiasporaAdapter extends DiasporaAdapter {
	/**
	 * @description Create a new instance of local storage adapter
	 * @memberof Adapters
	 * @public
	 * @author gerkin
	 * @param {Object} config Configuration object
	 * @param {Boolean} [config.session = false] Set to true to use sessionStorage instead of localStorage
	 */
	constructor( config ) {
		super( LocalStorageEntity );
		_.defaults( config, {
			session: false,
		});
		this.state = 'ready';
		this.source = ( true === config.session ? global.sessionStorage : global.localStorage );
	}

	/**
	 * @method configureCollection
	 * @description Create the collection index and call {@link Adapters.DiasporaAdapter.configureCollection}
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} tableName Name of the table (usually, model name)
	 * @param {Object} remaps    Associative hash that links entity field names with data source field names
	 * @returns {undefined}
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
	}

	// -----
	// ### Utils

	/**
	 * @method generateUUID
	 * @description Create a new unique id for this store's entity
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @returns {String} Generated unique id
	 */
	generateUUID() {
		let d = new Date().getTime();
		if ( global.performance && 'function' === typeof global.performance.now ) {
			d += global.performance.now(); //use high-precision timer if available
		}
		const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
			const r = ( d + Math.random() * 16 ) % 16 | 0;
			d = Math.floor( d / 16 );
			return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
		});
		return uuid;
	}

	/**
	 * @method ensureCollectionExists
	 * @description Create the table key if it does not exist
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table
	 * @returns {String[]} Index of the collection
	 */
	ensureCollectionExists( table ) {
		let index = this.source.getItem( table );
		if ( _.isNil( index )) {
			index = [];
			this.source.setItem( table, JSON.stringify( index ));
		} else {
			index = JSON.parse( index );
		}
		return index;
	}

	/**
	 * @method applyOptionsToSet
	 * @description Reduce, offset or sort provided set
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} set  Objects retrieved from memory store
	 * @param   {Object} options Options to apply to the set
	 * @returns {Object[]} Set with options applied
	 */
	static applyOptionsToSet( set, options ) {
		_.defaults( options, {
			limit: Infinity,
			skip:  0,
		});
		set = set.slice( options.skip );
		if ( set.length > options.limit ) {
			set = set.slice( 0, options.limit );
		}
		return set;
	}

	/**
	 * @method getItemName
	 * @description Deduce the item name from table name and item ID
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to construct name for
	 * @param   {String} id Id of the item to find
	 * @returns {String} Name of the item
	 */
	getItemName( table, id ) {
		return `${ table }.id=${ id }`;
	}

	// -----
	// ### Insert

	/**
	 * @method insertOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
	 * @description Insert a single entity in the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object} entity Hash representing the entity to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity || {});
		entity.id = this.generateUUID();
		this.setIdHash( entity );
		try {
			const tableIndex = this.ensureCollectionExists( table );
			tableIndex.push( entity.id );
			this.source.setItem( table, JSON.stringify( tableIndex ));
			this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
		} catch ( error ) {
			return Promise.reject( error );
		}
		return Promise.resolve( new this.classEntity( entity, this ));
	}

	/**
	 * @method insertMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
	 * @description Insert several entities in the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to insert data in
	 * @param   {Object[]} entities Array of hashes representing entities to insert
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link LocalStorageEntity[Ø]}* `entities`)
	 */
	insertMany( table, entities ) {
		entities = _.cloneDeep( entities );
		try {
			const tableIndex = this.ensureCollectionExists( table );
			entities = entities.map(( entity = {}) => {
				entity.id = this.generateUUID();
				this.setIdHash( entity );
				tableIndex.push( entity.id );
				this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
				return new this.classEntity( entity, this );
			});
			this.source.setItem( table, JSON.stringify( tableIndex ));
		} catch ( error ) {
			return Promise.reject( error );
		}
		return Promise.resolve( entities );
	}

	// -----
	// ### Find

	/**
	 * @method findOneById
	 * @description Find a single local storage entity using its id
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table Name of the collection to search entity in
	 * @param   {String} id    Id of the entity to search
	 * @returns {DataStoreEntities.LocalStorageEntity|undefined} Found entity, or undefined if not found
	 */
	findOneById( table, id ) {
		const item = this.source.getItem( this.getItemName( table, id ));
		if ( !_.isNil( item )) {
			return Promise.resolve( new this.classEntity( JSON.parse( item ), this ));
		}
		return Promise.resolve();
	}

	/**
	 * @method findOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
	 * @description Retrieve a single entity from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the model to retrieve data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`)
	 */
	findOne( table, queryFind, options = {}) {
		_.defaults( options, {
			skip: 0,
		});
		if ( !_.isObject( queryFind )) {
			return this.findOneById( table, queryFind );
		} else if ( _.isEqual( _.keys( queryFind ), [ 'id' ]) && _.isEqual( _.keys( queryFind.id ), [ '$equal' ])) {
			return this.findOneById( table, queryFind.id.$equal );
		}
		const items = this.ensureCollectionExists( table );
		let returnedItem;
		let matched = 0;
		_.each( items, itemId => {
			const item = JSON.parse( this.source.getItem( this.getItemName( table, itemId )));
			if ( this.matchEntity( queryFind, item )) {
				matched++;
				// If we matched enough items
				if ( matched > options.skip ) {
					returnedItem = item;
					return false;
				}
			}
		});
		return Promise.resolve( !_.isNil( returnedItem ) ? new this.classEntity( returnedItem, this ) : undefined );
	}

	// -----
	// ### Update

	/**
	 * @method updateOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
	 * @description Update a single entity in the memory.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to update data in
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {Object} update Object properties to set
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link LocalStorageEntity}* `entity`)
	 */
	updateOne( table, queryFind, update, options ) {
		_.defaults( options, {
			skip: 0,
		});
		return this.findOne( table, queryFind, options ).then( entity => {
			if ( _.isNil( entity )) {
				return Promise.resolve();
			}
			this.applyUpdateEntity( update, entity );
			try {
				this.source.setItem( this.getItemName( table, entity.id ), JSON.stringify( entity ));
				return Promise.resolve( entity );
			} catch ( error ) {
				return Promise.reject( error );
			}
		});
	}

	// -----
	// ### Delete

	/**
	 * @method deleteOne
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
	 * @description Delete a single entity from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*)
	 */
	deleteOne( table, queryFind, options = {}) {
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			try {
				const tableIndex = this.ensureCollectionExists( table );
				_.pull( tableIndex, entityToDelete.id );
				this.source.setItem( table, JSON.stringify( tableIndex ));
				this.source.removeItem( this.getItemName( table, entityToDelete.id ));
			} catch ( error ) {
				return Promise.reject( error );
			}
			return Promise.resolve();
		});
	}

	/**
	 * @method deleteMany
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
	 * @description Delete several entities from the local storage.
	 * @memberof Adapters.LocalStorageDiasporaAdapter
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {String} table  Name of the table to delete data from
	 * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
	 * @param   {QueryOptions} [options={}] Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*)
	 */
	deleteMany( table, queryFind, options = {}) {
		try {
			return this.findMany( table, queryFind, options ).then( entitiesToDelete => {
				const tableIndex = this.ensureCollectionExists( table );
				_.pullAll( tableIndex, _.map( entitiesToDelete, 'id' ));
				this.source.setItem( table, JSON.stringify( tableIndex ));
				_.forEach( entitiesToDelete, entityToDelete => {
					this.source.removeItem( this.getItemName( table, entityToDelete.id ));
				});
				return Promise.resolve();
			});
		} catch ( error ) {
			return Promise.reject( error );
		}
	}
}

module.exports = LocalStorageDiasporaAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lib/adapters/baseAdapter.js":2,"lib/dataStoreEntities/localStorageEntity.js":7,"lib/dependencies":8}],5:[function(require,module,exports){
'use strict';

const {
	_,
} = require( 'lib/dependencies' );

/**
 * @namespace DataStoreEntities
 */

class DataStoreEntity {
	/**
	 * @class DataStoreEntity
	 * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
	 * @memberof DataStoreEntities
	 * @description Construct a new data source entity with specified content & parent
	 * @public
	 * @author gerkin
	 * @param {Object}                   entity     Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
	 * @param {Adapters.DiasporaAdapter} dataSource Adapter that spawn this entity
	 */
	constructor( entity, dataSource ) {
		if ( _.isNil( entity )) {
			return undefined;
		}
		if ( _.isNil( dataSource )) {
			throw new TypeError( `Expect 2nd argument to be the parent of this entity, have "${ dataSource }"` );
		}
		Object.defineProperties( this, {
			dataSource: {
				value:        dataSource,
				enumerable:   false,
				configurable: false,
			},
		});
		_.assign( this, entity );
	}
	
	/**
	 * @method toObject
	 * @description Returns a plain object corresponding to this entity attributes
	 * @memberof DataStoreEntities.DataStoreEntity
	 * @public
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity
	 */
	toObject() {
		return _.omit( this, [ 'dataSource', 'id' ]);
	}
}

module.exports = DataStoreEntity;

},{"lib/dependencies":8}],6:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity.js' );

class InMemoryEntity extends DataStoreEntity {
	/**
	 * @class InMemoryEntity
	 * @classdesc Entity stored in {@link InMemoryDiasporaAdapter the in-memory adapter}.
	 * @extends DataStoreEntity
	 * @description Construct a in memory entity with specified content & parent
	 * @memberof DataStoreEntities
	 * @public
	 * @author gerkin
	 * @param {Object} entity Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
	 * @param {Adapters.DiasporaAdapter} dataSource Adapter that spawn this entity
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = InMemoryEntity;

},{"lib/dataStoreEntities/baseEntity.js":5}],7:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity.js' );

class LocalStorageEntity extends DataStoreEntity {
	/**
	 * @class LocalStorageEntity
	 * @classdesc Entity stored in {@link LocalStorageDiasporaAdapter the local storage adapter}.
	 * @extends DataStoreEntity
	 * @description Construct a local storage entity with specified content & parent
	 * @memberof DataStoreEntities
	 * @public
	 * @author gerkin
	 * @param {Object} entity Object containing attributes to inject in this entity. The only **reserved key** is `dataSource``
	 * @param {Adapters.DiasporaAdapter} dataSource Adapter that spawn this entity
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = LocalStorageEntity;

},{"lib/dataStoreEntities/baseEntity.js":5}],8:[function(require,module,exports){
(function (global){
'use strict';

module.exports = {
	_: (() => { 
		return global._ || require( 'lodash' );
	})(),
	SequentialEvent: (() => { 
		return global.SequentialEvent || require( 'sequential-event' );
	})(),
	Promise: (() => { 
		return global.Promise && global.Promise.version ? global.Promise : require( 'bluebird' );
	})(),
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"bluebird":undefined,"lodash":undefined,"sequential-event":undefined}],9:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );
const DiasporaAdapter = require( 'lib/adapters/baseAdapter.js' );

const adapters = {
	'in-memory':    require( 'lib/adapters/inMemoryAdapter' ),
	'localstorage': require( 'lib/adapters/localStorageAdapter' ),
};
const dataSources = {};
const models = {};

const wrapDataSourceAction = ( callback, queryType, adapter ) => {
	return ( table, ...args ) => {
		// Filter our results
		const filterResults = entity => {
			// Remap fields
			entity = adapter.remapFields( table, entity, true );
			// Force results to be class instances
			if ( !( entity instanceof adapter.classEntity ) && !_.isNil( entity )) {
				return new adapter.classEntity( entity, adapter );
			}
			return entity;
		};

		// Transform arguments for find, update & delete
		let optIndex = false;
		let upd = false;
		if ([ 'find', 'delete' ].indexOf( queryType.query ) >= 0 ) {
			// For find & delete, options are 3rd argument (so 2nd item in `args`)
			optIndex = 1;
		} else if ( 'update' === queryType.query ) {
			// For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
			optIndex = 2;
			upd = true;
		}
		try {
			//console.log('Before query transformed', args[0]);
			if ( false !== optIndex ) {
				// Options to canonical
				args[optIndex] = adapter.normalizeOptions( args[optIndex]);
				// Remap input objects
				if ( true === args[optIndex].remapInput ) {
					args[0] = adapter.remapFields( table, args[0], false );

					if ( true === upd ) {
						args[1] = adapter.remapFields( table, args[1], false );
					}
				}
				// Query search to cannonical
				args[0] = adapter.normalizeQuery( args[0], args[optIndex]);
				args[optIndex].remapInput = false;
			} else if ( 'insert' === queryType.query ) {
				// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
				if ( 'many' === queryType.number ) {
					// If inserting *several* entities, map the array to remap each entity objects...
					args[0] = _.map( args[0], insertion => adapter.remapFields( table, insertion, false ));
				} else {
					// ... or we are inserting a *single* one. We still need to remap entity.
					args[0] = adapter.remapFields( table, args[0], false );
				}
			}
			//console.log('Query transformed:', args[0]);
		} catch ( err ) {
			return Promise.reject( err );
		}

		// Hook after promise resolution
		const queryPromise = callback.call( adapter, table, ...args );
		return queryPromise.then( results => {
			if ( _.isArrayLike( results )) {
				results = _.map( results, filterResults );
			} else if ( !_.isNil( results )) {
				results = filterResults( results );
			}
			return Promise.resolve( results );
		});
	};
};
/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
const Diaspora = {
	/**
	 * @function check
	 * @description Check if the value matches the field description provided, thus verify if it is valid
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @param   {Object} entity    Entity to check
	 * @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
	 * @returns {Error[]} Array of errors
	 */
	check( entity, modelDesc = {}) {
		// Apply method `checkField` on each field described
		const checkResults = _( modelDesc )
			.mapValues(( fieldDesc, field ) => this.checkField.call( this, entity[field], fieldDesc, _.concat([], [ field ])))
			.omitBy( _.isEmpty )
			.value();
		return checkResults;
	},

	/**
	 * @function checkField
	 * @description Check if the value matches the field description provided, thus verify if it is valid
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @param {Any} value   Value to check
	 * @param {module:ModelExtension.FieldDescriptor} fieldDesc Description of the field to check with
	 * @param {String[]} keys Array of keys from highest ancestor to this property
	 * @returns {Object} Hash describing errors
	 */
	checkField( value, fieldDesc, keys ) {
		if ( !_.isObject( fieldDesc )) {
			return;
		}
		_.defaults( fieldDesc, {
			required: false,
		});

		const error = {};

		// It the field has a `validate` property, try to use it
		if ( fieldDesc.validate ) {
			if ( !fieldDesc.validate.call( this, value, fieldDesc )) {
				error.validate = `${ keys.join( '.' ) } custom validation failed`;
			}
		}

		// Check the type and the required status
		if ( !_.isNil( fieldDesc.type ) && !_.isNil( fieldDesc.model )) {
			error.spec =  `${ keys.join( '.' ) } spec can't have both a type and a model`;
			// Apply the `required` modifier
		} else if ( true === fieldDesc.required && _.isNil( value )) {
			error.required = `${ keys.join( '.' ) } is a required property of type "${ fieldDesc.type }"`;
		} else if ( !_.isNil( value )) {
			if ( _.isString( fieldDesc.type )) {
				switch ( fieldDesc.type ) {
					case 'string': {
						if ( !_.isString( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						}
					} break;

					case 'integer': {
						if ( !_.isInteger( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						}
					} break;

					case 'float': {
						if ( !_.isNumber( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						}
					} break;

					case 'date': {
						if ( !_.isDate( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						}
					} break;

					case 'object': {
						if ( !_.isObject( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						} else {
							const deepTest = _.isObject( 
								fieldDesc.attributes 
							) ? _( value ).mapValues( 
									( propVal, propName ) => this.checkField( 
										propVal, 
										fieldDesc.attributes[propName], 
										_.concat( keys, [ propName ]) 
									) 
								)
									.omitBy( _.isEmpty )
									.value() : {};
							if ( !_.isEmpty( deepTest )) {
								error.children = deepTest;
							}
						}
					} break;

					case 'array': {
						if ( !_.isArray( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
						} else {
							const deepTest = _.isObject( 
								fieldDesc.of 
							) ? _( value ).map( 
									( propVal, propName ) => { 
										if ( _.isArrayLike( fieldDesc.of )) { 
											const subErrors = _( fieldDesc.of ).map( desc => this.checkField( propVal, desc, _.concat( keys, [ propName ]))); 
											if ( !_.find( subErrors, v => 0 === v.length )) { 
												return subErrors; 
											} 
										} else { 
											return this.checkField( propVal, fieldDesc.of, _.concat( keys, [ propName ])); 
										} 
									} 
								)
									.omitBy( _.isEmpty )
									.value() : {};
							if ( !_.isEmpty( deepTest )) {
								error.children = deepTest;
							}
						}
					} break;

					case 'any': {
						if ( !_.stubTrue( value )) {
							error.type =  `${ keys.join( '.' ) } expected to be assigned with any type`;
						}
					} break;

					default: {
						error.type =  `${ keys.join( '.' ) } requires to be unhandled type "${ fieldDesc.type }"`;
					} break;
				}
			} else {
				error.spec =  `${ keys.join( '.' ) } spec "type" must be a string`;
			}
		}

		// Check enum values
		if ( !_.isNil( fieldDesc.enum )) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( enumVal instanceof RegExp ) {
					return null !== value.match( enumVal );
				} else {
					return value === enumVal;
				}
			});
			if ( false === result ) {
				error.enum = `${ keys.join( '.' ) } expected to have one of enumerated values "${ JSON.stringify( fieldDesc.enum ) }"`;
			}
		}
		if ( !_.isEmpty( error )) {
			error.value = value;
			return error;
		} else {
			return undefined;
		}
	},

	/**
	* @function default
	* @description Set default values if required
	* @memberof Diaspora
	* @public
	* @author gerkin
	* @param   {Object} entity    Entity to set defaults in
	* @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
	* @returns {Object} Entity merged with default values
	*/
	default( entity, modelDesc ) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.mapValues(
				modelDesc,
				( fieldDesc, field ) => this.defaultField(
					entity[field],
					fieldDesc
				)
			)
		);
	},

	/**
	* @function defaultField
	* @description Set the default on a single field according to its description
	* @memberof Diaspora
	* @public
	* @author gerkin
	* @param {Any} value   Value to default
	* @param {module:ModelExtension.FieldDescriptor} fieldDesc Description of the field to default
	* @returns {Any} Defaulted value
	*/
	defaultField( value, fieldDesc ) {
		let out;
		if ( !_.isUndefined( value )) {
			out = value;
		} else {
			out = _.isFunction( fieldDesc.default ) ? fieldDesc.default() : fieldDesc.default;
		}
		if ( 'object' === fieldDesc.type && _.isObject( fieldDesc.attributes ) && _.keys( fieldDesc.attributes ).length > 0 && !_.isNil( out )) {
			return this.default( out, fieldDesc.attributes );
		} else {
			return out;
		}
	},

	createDataSource( adapter, config ) {
		if ( !adapters.hasOwnProperty( adapter )) {
			throw new Error( `Unknown adapter "${ adapter }". Available currently are ${ Object.keys( adapters ).join( ', ' ) }` );
		}
		const baseAdapter = new adapters[adapter]( config );
		const newDataSource = new Proxy( baseAdapter, {
			get( target, key ) {
				// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
				if ( _.isString( key )) {
					let method = key.match( /^(find|update|insert|delete)(Many|One)$/ );
					if ( null !== method ) {
						method[2] = method[2].toLowerCase();
						method = _.mapKeys( method.slice( 0, 3 ), ( val, key ) => {
							return [ 'full', 'query', 'number' ][key];
						});
						return wrapDataSourceAction( target[key], method, target );
					}
				}
				return target[key];
			},
		});
		return newDataSource;
	},

	/**
	* @method registerDataSource
	* @description Stores the data source with provided label
	* @memberof Diaspora
	* @public
	* @author gerkin
	* @throws {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
	* @param {String}          moduleName Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
	* @param {String}          name       Name associated with this datasource
	* @param {DiasporaAdapter} dataSource Datasource itself
	* @returns {undefined}
	*/
	registerDataSource( moduleName, name, dataSource ) {
		if ( !_.isString( moduleName ) && moduleName.length > 0 ) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( dataSources.hasOwnProperty( name )) {
			throw new Error( `DataSource name already used, had "${ name }"` );
		}
		if ( !( dataSource instanceof DiasporaAdapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}
		dataSource.name = name;
		_.merge( dataSources, {
			[moduleName]: {
				[name]: dataSource,
			},
		});
	},

	/**
	* @method declareModel
	* @description Create a new Model with provided description
	* @memberof Diaspora
	* @public
	* @author gerkin
	* @throws {Error} Thrown if parameters are incorrect
	* @param {String} moduleName       Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
	* @param {String} name       Name associated with this datasource
	* @param {Object} modelDesc Description of the model to define
	* @returns {Model} Model created
	*/
	declareModel( moduleName, name, modelDesc ) {
		if ( !_.isString( moduleName ) && moduleName.length > 0 ) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( !_.isObject( modelDesc )) {
			throw new Error( '"modelDesc" must be an object' );
		}
		const model = new Model( moduleName, name, modelDesc );
		_.assign( models, {
			[moduleName]: {},
		});
		models[moduleName][name] = model;
		return model;
	},

	models,
	dataSources,
	adapters,
	dependencies: {
		lodash:             _,
		bluebird:           Promise,
		'sequential-event': SequentialEvent,
	},
};

module.exports = Diaspora;

// Load Model class after, so that Model requires Diaspora once it is declared
const Model = require( './model' );

},{"./model":11,"lib/adapters/baseAdapter.js":2,"lib/adapters/inMemoryAdapter":3,"lib/adapters/localStorageAdapter":4,"lib/dependencies":8}],10:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );
const Diaspora = require( './diaspora' );
const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity' );
const ValidationError = require( 'lib/validationError' );
const Utils = require( 'lib/utils' );

function EntityFactory( name, modelAttrs, model ) {
	const modelAttrsKeys = _.keys( modelAttrs );

	/**
	 * @classdesc An entity is a document in the population of all your datas of the same type
	 * @public
	 * @author gerkin
	 */
	class Entity extends SequentialEvent {
		/**
		 * @constructs Entity
		 * @description Create a new entity
		 * @public
		 * @author gerkin
		 * @param {Object} [source = {}] Hash with properties to copy on the new object
		 */
		constructor( source = {}) {
			super();

			// Stores the object state
			let state = 'orphan';
			let lastDataSource = null;
			const dataSources = Object.seal( _.mapValues( model.dataSources, () => undefined ));

			const entityPrototype = {
				/**
				 * @property {Object} dataSources Hash that links each data source with its name
				 * @memberof Entity
				 * @instance
				 * @public
				 * @author gerkin
				 */
				dataSources: {
					value: dataSources,
				},
				/**
				 * @method toObject
				 * @description Returns a copy of this entity attributes
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {Object} Attributes of this entity
				 */
				toObject: () => {
					return _.omit( attributes, entityPrototypeProperties ); 
				}, 
				/**
				 * @method persist
				 * @description Save this entity in specified data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to persist entity in
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`
				 */
				persist: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeUpdate' );
					}
					return promise.then(() => {
						let promise;
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							promise = dataSource.insertOne( this.table( sourceName ), this.toObject());
						} else {
							promise = dataSource.updateOne( this.table( sourceName ), this.uidQuery( dataSource ), this.toObject());
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterUpdate' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * @method fetch
				 * @description Reload this entity from specified data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to fetch entity from
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`
				 */
				fetch: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeFind' );
					}
					return promise.then(() => {
						let promise;
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							promise = Promise.reject( 'Can\'t fetch an orphan entity' );
						} else {
							promise = dataSource.findOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterFind' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * @method destroy
				 * @description Delete this entity from the specified data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to delete entity from
				 * @param {Object} [options] Hash of options for this query
				 * @param {Boolean} [options.skipEvents=false] If true, won't trigger events `beforeUpdate` and `afterUpdate`
				 * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`
				 */
				destroy: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';
					let promise;
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforeDelete' );
					}
					return promise.then(() => {
						let promise;
						if ( 'orphan' === beforeState ) {
							promise = Promise.reject( new Error( 'Can\'t destroy an orphan entity' ));
						} else {
							promise = dataSource.deleteOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
						lastDataSource = dataSource.name;
						return promise;
					}).then( dataStoreEntity => {
						// If this was our only data source, then go back to orphan state
						if ( 0 === _.without( model.dataSources, dataSource.name ).length ) {
							state = 'orphan';
						} else {
							state = 'sync';
							delete attributes.idHash[dataSource.name];
						}
						entityDefined.dataSources[dataSource.name] = undefined;
						dataStoreEntity = null;
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterDelete' ).then(() => Promise.resolve( entityProxied ));
						}
					});
				}, 
				/**
				 * @method getState
				 * @description Return entity's current state.
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {Entity.State} State of this entity
				 */
				state: {
					get() {
						return state; 
					},
				},
				/**
				 * @method getLastDataSource
				 * @description Return entity's last data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @returns {String} Name of the last data source used
				 */
				lastDataSource: {
					get() {
						return lastDataSource; 
					},
				},
				/**
				 * @method getUidQuery
				 * @description Generate the query to get this unique entity in the desired data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @param {Adapters.DiasporaAdapter} dataSource 
				 * @returns {Object} Query to find this entity
				 */
				uidQuery( dataSource ) {
					return {
						id: attributes.idHash[dataSource.name],
					};
				},
				/**
				 * @method getTable
				 * @description Return the table of this entity in the specified data source
				 * @memberof Entity
				 * @public
				 * @instance
				 * @author gerkin
				 * @param {String} sourceName Name of the data source to persist entity in
				 * @returns {String} Name of the table
				 */
				table( sourceName ) {
					return name;
				},
			};
			const entityPrototypeProperties = _.keys( entityPrototype );

			// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
			if ( source instanceof DataStoreEntity ) {
				state = 'sync';
				lastDataSource = source.dataSource.name;
				dataSources[lastDataSource] = source;
				source = _.omit( source.toObject(), [ 'id' ]);
			}
			// Check keys provided in source
			const sourceKeys = _.keys( source );
			// Check if there is an intersection with reserved, and have differences with model attributes
			const sourceUReserved = _.intersection( source, entityPrototypeProperties );
			if ( 0 !== sourceUReserved.length ) {
				throw new Error( `Source has reserved keys: ${ JSON.stringify( sourceUReserved ) } in ${ JSON.stringify( source ) }` );
			}
			const sourceDModel = _.difference( source, modelAttrsKeys );
			if ( 0 !== sourceDModel.length ) { // Later, add a criteria for schemaless models
				throw new Error( `Source has unknown keys: ${ JSON.stringify( sourceDModel ) } in ${ JSON.stringify( source ) }` );
			}
			// Now we know that the source is valid. First, deeply clone to detach object values from entity
			let attributes = _.cloneDeep( source );
			// Free the source
			source = null;
			// Default model attributes with our model desc
			Diaspora.default( attributes, modelAttrs );

			this.on( 'beforeUpdate', () => {
				const validationErrors = Diaspora.check( attributes, modelAttrs );
				if ( !_.isEmpty( validationErrors )) {
					throw new ValidationError( validationErrors, 'Validation failed' );
				}
			});

			// Define getters & setters
			const entityDefined = Utils.defineEnumerableProperties( this, entityPrototype );
			const entityProxied = new Proxy( entityDefined, {
				get: ( obj, key ) => {
					if ( 'constructor' === key ) {
						return entityDefined[key];
					}
					if ( key in entityDefined ) {
						return entityDefined[key];
					}
					return attributes[key];
				},
				set: ( obj, key, value ) => {
					if ( key in entityDefined && !super.hasOwnProperty( key )) {
						console.warn( `Trying to define read-only key ${ key }.` );
						return value;
					}
					return attributes[key] = value;
				},
				enumerate: obj => {
					return _.keys( attributes );
				},
				ownKeys: obj => {
					return _( attributes ).keys().concat( entityPrototypeProperties ).value();
				},
				has: ( obj, key ) => {
					return attributes.hasOwnProperty( key );
				},
			});

			return entityProxied;
		}
	}
	const EntityWrapped = Object.defineProperties( Entity, {
		/**
		 * @property {String} name Name of the class
		 * @memberof Entity
		 * @static
		 * @public
		 * @author gerkin
		 */
		name: {
			value:      `${ name  }Entity`,
			writable:   false,
			enumerable: true, 
		},
		/**
		 * @property {Model} model Reference to this entity's model
		 * @memberof Entity
		 * @static
		 * @public
		 * @author gerkin
		 */
		model: {
			value:      model,
			writable:   false,
			enumerable: true, 
		},
	});
	return EntityWrapped;

	entityGenericConstructor = Entity;
}

module.exports = EntityFactory;

},{"./diaspora":9,"lib/dataStoreEntities/baseEntity":5,"lib/dependencies":8,"lib/utils":13,"lib/validationError":14}],11:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( 'lib/dependencies' );
const EntityFactory = require( 'lib/entityFactory' );
const Diaspora = require( 'lib/diaspora' );
const Set = require( 'lib/set' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @classdesc The model class is used to interact with the population of all data of the same type.
 */
class Model {
	/**
	 * @description Create a new Model that is allowed to interact with all entities of data sources tables selected
	 * @public
	 * @author gerkin
	 * @param {String}           namespace Namespace of the model. This may be used for scope or inheriting mechanisms
	 * @param {String}           name      Name of the model
	 * @param {ModelDescription} modelDesc Hash representing the configuration of the model
	 */
	constructor( namespace, name, modelDesc ) {
		const reservedPropIntersect = _.intersection( entityPrototypeProperties, _.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		}
		if ( !modelDesc.hasOwnProperty( 'sources' ) || !( _.isArrayLike( modelDesc.sources ) || _.isObject( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = _.isArrayLike( modelDesc.sources ) ? _.zipObject( modelDesc.sources, _.times( modelDesc.sources.length, _.constant({}))) : _.mapValues( modelDesc.sources, ( remap, dataSourceName ) => {
			if ( true === remap ) {
				return {};
			} else if ( _.isObject( remap )) {
				return remap;
			} else {
				throw new TypeError( `Datasource "${ dataSourceName }" value is invalid: expect \`true\` or a remap hash, but have ${ JSON.stringify( remap ) }` );
			}
		});
		// List sources required by this model
		const sourceNames = _.keys( sourcesNormalized );
		// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
		const scopeAvailableSources = Diaspora.dataSources[namespace];
		const modelSources = _.pick( scopeAvailableSources, sourceNames );
		const missingSources = _.difference( sourceNames, _.keys( modelSources ));
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${ missingSources.map( v => `"${ v }"` ).join( ', ' ) }` );
		}

		// Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.
		_.forEach( sourcesNormalized, ( remap, sourceName ) => {
			const sourceConfiguring = modelSources[sourceName];
			sourceConfiguring.configureCollection( name, remap );
		});
		this.dataSources = modelSources;
		this.defaultDataSource = sourceNames[0];
		this.name = name;
		this.entityFactory = EntityFactory( name, modelDesc.attributes, this );
	}

	/**
	 * @method getDataSource
	 * @description Create a new Model that is allowed to interact with all entities of data sources tables selected
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @throws {Error} Thrown if requested source name does not exists
	 * @param   {String} [sourceName=Model.defaultDataSource] Name of the source to get. It corresponds to one of the sources you set in Model#modelDesc.sources
	 * @returns {Adapters.DiasporaAdapter} Source adapter with requested name
	 */
	getDataSource( sourceName ) {
		if ( _.isNil( sourceName )) {
			sourceName = this.defaultDataSource;
		} else if ( !this.dataSources.hasOwnProperty( sourceName )) {
			throw new Error( `Unknown data source "${ sourceName }" in model "${ this.name }", available are ${ _.keys( this.dataSources ).map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		return this.dataSources[sourceName];
	}

	/**
	 * @method spawn
	 * @description Create a new *orphan* {@link Entity entity}
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} source Object to copy attributes from
	 * @returns {Entity} New *orphan* entity
	 */
	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	/**
	 * @method spawnMulti
	 * @description Create multiple new *orphan* {@link Entity entities}
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} sources Array of objects to copy attributes from
	 * @returns {Set} Set with new *orphan* entities
	 */
	spawnMulti( sources ) {
		return new Set( this, _.map( sources, source => this.spawn( source )));
	}

	/**
	 * @method insert
	 * @description Insert a raw source object in the data store
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} source Object to copy attributes from
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to insert in
	 * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}
	 */
	insert( source, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertOne( this.name, source ).then( entity => {
			return Promise.resolve( new this.entityFactory( entity ));
		});
	}

	/**
	 * @method insertMany
	 * @description Insert multiple raw source objects in the data store
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object[]} sources Array of object to copy attributes from
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to insert in
	 * @returns {Promise} Promise resolved with a {@link Set collection} containing new *sync* entities
	 */
	insertMany( sources, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertMany( this.name, sources ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method find
	 * @description Retrieve a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entity
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state
	 */
	find( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( _.isString( queryFind ) && !!_.isNil( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findOne( this.name, queryFind, options ).then( dataSourceEntity => {
			if ( _.isNil( dataSourceEntity )) {
				return Promise.resolve();
			}
			const newEntity = new this.entityFactory( dataSourceEntity );
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	/**
	 * @method findMany
	 * @description Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with a {@link Set collection} of found entities in *sync* state
	 */
	findMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( _.isString( queryFind ) && !!_.isNil( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findMany( this.name, queryFind, options ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method update
	 * @description Update a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind      Query to get desired entity
	 * @param   {Object} update Attributes to update on matched set
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state
	 */
	update( queryFind, update, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateOne( this.name, queryFind, update, options ).then( dataSourceEntity => {
			if ( _.isNil( dataSourceEntity )) {
				return Promise.resolve();
			}
			const newEntity = new this.entityFactory( dataSourceEntity );
			return Promise.resolve( newEntity );
		});
	}

	/**
	 * @method updateMany
	 * @description Update multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {Object} update Attributes to update on matched set
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with the {@link Set collection} of found entities in *sync* state
	 */
	updateMany( queryFind, update, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateMany( this.name, queryFind, update, options ).then( entities => {
			const newEntities = _.map( entities, entity => new this.entityFactory( entity ));
			const collection = new Set( this, newEntities );
			return Promise.resolve( collection );
		});
	}

	/**
	 * @method delete
	 * @description Delete a single entity from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entity
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entity from
	 * @returns {Promise} Promise resolved with `undefined`
	 */
	delete( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteOne( this.name, queryFind, options );
	}

	/**
	 * @method deleteMany
	 * @description Delete multiple entities from specified data source that matches provided `queryFind` and `options`
	 * @memberof Model
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]      Query to get desired entities
	 * @param   {QueryLanguage#QueryOptions} [options={}]        Options for this query
	 * @param   {String} [dataSourceName=Model.defaultDataSource] Name of the data source to get entities from
	 * @returns {Promise} Promise resolved with `undefined`
	 */
	deleteMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.deleteMany( this.name, queryFind, options );
	}
}

module.exports = Model;

},{"lib/dependencies":8,"lib/diaspora":9,"lib/entityFactory":10,"lib/set":12}],12:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );
const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity' );
const Utils = require( 'lib/utils' );

/**
 * @class Set
 * @classdesc Collections are used to manage multiple entities at the same time
 */
class Set {
	/**
	 * @lends Set
	 * @constructs
	 * @description Create a new set, managing provided `entities` that must be generated from provided `model`
	 * @member {Model} model Model that generated those `entities`
	 * @member {Lodash} entities Entities member of this collection
	 * @param {Model} model       Model describing entities managed by this set
	 * @param {Entity|Entity[]} entities Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	constructor( model, ...entities ) {
		// Flatten arguments
		entities = _( entities ).flatten();
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( entities.value(), model );

		const defined = Utils.defineEnumerableProperties( this, {
			entities: entities,
			model:    model,
			length:   {
				get() {
					return this.entities.size();
				},
			},
		});

		return new Proxy( defined, {
			get( target, prop ) {
				if ( prop in target ) {
					return target[prop];
				} else if ( prop in target.entities ) {
					return target.entities[prop];
				} else if ( 'string' === typeof prop && prop.match( /^-?\d+$/ ) && target.entities.nth( parseInt( prop ))) {
					return target.entities.nth( parseInt( prop ));
				}
			},
			set( target, prop, val ) {
				if ( 'model' === prop ) {
					return new Error( 'Can\'t assign to read-only property "model".' );
				} else if ( 'entities' === prop ) {
					Set.checkEntitiesFromModel( val, target.model );
					target.entities = _( val );
				}
			},
		});
	}

	static checkEntitiesFromModel( entities, model ) {
		entities.forEach(( entity, index ) => {
			if ( entity.constructor.model !== model ) {
				throw new TypeError( `Provided entity n°${ index } ${ entity } is not from model ${ model } (${ model.modelName })` );
			}
		});
	}

	/**
	 * @method persist
	 * @description Persist all entities of this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Data source name to persist in
	 * @returns {Promise} Promise resolved once all items are persisted
	 * @see {@link Entity#persist}
	 */
	persist( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeUpdate' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.persist( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterUpdate' )));
		}).then(() => this );
	}

	/**
	 * @method fetch
	 * @description Reload all entities of this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Data source name to reload entities from
	 * @returns {Promise} Promise resolved once all items are reloaded
	 * @see {@link Entity#fetch}
	 */
	fetch( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeFind' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.fetch( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterFind' )));
		}).then(() => this );
	}

	/**
	 * @method destroy
	 * @description Destroy all entities from this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Name of the data source to delete entities from
	 * @returns {Promise} Promise resolved once all items are destroyed
	 * @see {@link Entity#destroy}
	 */
	destroy( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeDelete' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.destroy( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterDelete' )));
		}).then(() => this );
	}

	/**
	 * @method update
	 * @description Update all entities in the set with given object
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} newData Attributes to change in each entity of the collection
	 * @returns {Collection} `this`
	 */
	update( newData ) {
		this.entities.forEach( entity => {
			_.forEach( newData, ( val, key ) => {
				if ( _.isUndefined( val )) {
					delete entity[key];
				} else {
					entity[key] = val;
				}
			});
		});
		return this;
	}
}

module.exports = Set;

},{"lib/dataStoreEntities/baseEntity":5,"lib/dependencies":8,"lib/utils":13}],13:[function(require,module,exports){
'use strict';

const {
	_,
} = require( 'lib/dependencies' );

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
};

},{"lib/dependencies":8}],14:[function(require,module,exports){
'use strict';

const {
	_,
} = require( 'lib/dependencies' );

const stringifyValidationObject = validationErrors => {
	return _( validationErrors ).mapValues(( error, key ) => {
		return `${ key } => ${ JSON.stringify( error.value ) }
* ${ _( error ).omit([ 'value' ]).values().map( _.identity ).value() }`;
	}).values().join( '\n* ' );
};

class ValidationError extends Error {
	/**
	 * @class ValidationError
	 * @classdesc This class represents an error related to validation
	 * @extends Error
	 * @description Construct a new validation error
	 * @public
	 * @author gerkin
	 * @see Diaspora.check
	 * @param {Object} validationErrors Object describing validation errors, usually returned by {@link Diaspora.check}
	 * @param {String} message          Message of this error
	 * @param {*} errorArgs...        Arguments to transfer to parent Error
	 */
	constructor( validationErrors, message, ...errorArgs ) {
		message += `
${ stringifyValidationObject( validationErrors ) }`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
		if ( Error.captureStackTrace ) {
			Error.captureStackTrace( this, this.constructor );
		}
	}
}

module.exports = ValidationError;

},{"lib/dependencies":8}]},{},[1])(1)
});