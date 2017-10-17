(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Diaspora = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const Diaspora = require( './lib/diaspora' );

module.exports = Diaspora;

},{"./lib/diaspora":9}],2:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( '../dependencies' );

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
 * By default, all conditions in a single SelectQueryCondition are combined with an `AND` operator.
 *
 * @typedef {Object} QueryLanguage.SelectQueryCondition
 * @author gerkin
 * @property {Any}                                      $equals       - Match if item value is equal to this. Objects and array are compared deeply. **Alias: `==`**
 * @property {Any}                                      $diff         - Match if item value is different to this. Objects and array are compared deeply. **Alias: `!=`**
 * @property {boolean}                                  $exists       - If `true`, match items where this prop is defined. If `false`, match when prop is null or not set. **Alias: `~`**
 * @property {integer}                                  $less         - Match if item value is less than this. **Alias: `<`**
 * @property {integer}                                  $lessEqual    - Match if item value is less than this or equals to this. **Alias: `<=`**
 * @property {integer}                                  $greater      - Match if item value is greater than this. **Alias: `>`**
 * @property {integer}                                  $greaterEqual - Match if item value is greater than this or equals to this. **Alias: `>=`**
 * @property {QueryLanguage#SelectQueryOrCondition[]}   $or           - Match if *one of* the conditions in the array is true. **Alias: `||`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition[]}   $and          - Match if *all* the conditions in the array are true. Optional, because several conditions in a single SelectQueryCondition are combined with an `AND` operator. **Alias: `&&`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition[]}   $xor          - Match if *a single* of the conditions in the array is true. **Alias: `^^`** **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition}     $not          - Invert the condition **Alias: `!`** **NOT IMPLEMENTED YET**
 * @property {string}                                   $contains     - On *string*, it will check if query is included in item using GLOB. **NOT IMPLEMENTED YET**
 * @property {QueryLanguage#SelectQueryOrCondition|Any} $contains     - On *array*, it will check if item contains the query. **NOT IMPLEMENTED YET**
 * @property {Any[]}                                    $in           - Check if item value is contained (using deep comparaison) in query. **NOT IMPLEMENTED YET**
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
 * DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
 * @extends SequentialEvent
 * @memberof Adapters
 * @author gerkin
 */
class DiasporaAdapter extends SequentialEvent {

	// -----
	// ### Initialization

	/**
	 * Create a new instance of adapter. This base class should be used by all other adapters.
	 *
	 * @public
	 * @author gerkin
	 * @param {DataStoreEntities.DataStoreEntity} classEntity - Entity to spawn with this adapter.
	 */
	constructor( classEntity ) {
		super();
		/**
		 * Describe current adapter status.
		 *
		 * @type {string}
		 * @author Gerkin
		 */
		this.state = 'preparing';
		/**
		 * Hash to transform entity fields to data store fields.
		 *
		 * @type {Object}
		 * @property {string} * - Data store field associated with this entity field.
		 * @author Gerkin
		 */
		this.remaps = {};
		/**
		 * Hash to transform data store fields to entity fields.
		 *
		 * @type {Object}
		 * @property {string} * - Entity field associated with this data store field.
		 * @author Gerkin
		 */
		this.remapsInverted = {};
		/**
		 * Hash of functions to cast data store values to JSON standard values in entity.
		 *
		 * @type {Object}
		 * @property {Function} * - Filter to execute to get standard JSON value.
		 * @author Gerkin
		 */
		this.filters = {};
		/**
		 * Link to the constructor of the class generated by this adapter.
		 *
		 * @type {DataStoreEntities.DataStoreEntity}
		 * @author Gerkin
		 */
		this.classEntity = classEntity;
		/**
		 * Error triggered by adapter initialization.
		 *
		 * @type {Error}
		 * @author Gerkin
		 */
		this.error = undefined;

		// Bind events
		this.on( 'ready', () => {
			this.state = 'ready';
		}).on( 'error', err => {
			this.state = 'error';
			this.error = err;
		});
	}

	/**
	 * Saves the remapping table, the reversed remapping table and the filter table in the adapter. Those tables will be used later when manipulating models & entities.
	 *
	 * @author gerkin
	 * @param   {string} tableName    - Name of the table (usually, model name).
	 * @param   {Object} remaps       - Associative hash that links entity field names with data source field names.
	 * @param   {Object} [filters={}] - Not used yet...
	 * @returns {undefined} This function does not return anything.
	 */
	configureCollection( tableName, remaps, filters = {}) {
		this.remaps[tableName] = remaps;
		this.remapsInverted[tableName] = _.invert( remaps );
		this.filters = filters || {};
	}

	// -----
	// ### Events

	/**
	 * Fired when the adapter is ready to use. You should not try to use the adapter before this event is emitted.
	 *
	 * @event Adapters.DiasporaAdapter#ready
	 * @type {undefined}
	 * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
	 */

	/**
	 * Fired if the adapter failed to initialize or changed to `error` state. Called with the triggering `error`.
	 *
	 * @event Adapters.DiasporaAdapter#error
	 * @type {Error}
	 * @see {@link Adapters.DiasporaAdapter#waitReady waitReady} Convinience method to wait for state change.
	 */

	// -----
	// ### Utils

	/**
	 * Returns a promise resolved once adapter state is ready.
	 *
	 * @author gerkin
	 * @listens Adapters.DiasporaAdapter#error
	 * @listens Adapters.DiasporaAdapter#ready
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured.
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
	 * Cast entity field names to table field name, or the opposite.
	 *
	 * @author gerkin
	 * @param   {string}  tableName      - Name of the table we are remapping for.
	 * @param   {Object}  query          - Hash representing the raw query to remap.
	 * @param   {boolean} [invert=false] - `false` to cast to `table` field names, `true` to cast to `entity` field name.
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
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @param   {string} tableName - Name of the table for which we remap.
	 * @param   {Object} query     - Hash representing the entity to remap.
	 * @returns {Object} Remapped object.
	 */
	remapInput( tableName, query ) {
		if ( _.isNil( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( _.isObject( _.get( this, 'filters.input' )) && this.filters.input.hasOwnProperty( key )) {
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
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @param   {string} tableName - Name of the table for which we remap.
	 * @param   {Object} query     - Hash representing the entity to remap.
	 * @returns {Object} Remapped object.
	 */
	remapOutput( tableName, query ) {
		if ( _.isNil( query )) {
			return query;
		}
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( _.isObject( _.get( this, 'filters.output' )) && this.filters.output.hasOwnProperty( key )) {
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
	 * Refresh the `idHash` with current adapter's `id` injected.
	 *
	 * @author gerkin
	 * @param   {Object} entity          - Object containing attributes of the entity.
	 * @param   {string} [propName='id'] - Name of the `id` field.
	 * @returns {Object} Modified entity (for chaining).
	 */
	setIdHash( entity, propName = 'id' ) {
		entity.idHash = _.assign({}, entity.idHash, {
			[this.name]: entity[propName],
		});
		return entity;
	}

	/**
	 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQuery} query  - Query to match against.
	 * @param   {Object}                    entity - Entity to test.
	 * @returns {boolean} `true` if query matches, `false` otherwise.
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
	}

	/**
	 * Transform options to their canonical form. This function must be applied before calling adapters' methods.
	 *
	 * @author gerkin
	 * @throws  {TypeError} Thrown if an option does not have an acceptable type.
	 * @throws  {ReferenceError} Thrown if a required option is not present.
	 * @throws  {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs) .
	 * @param   {Object} [opts={}] - Options to transform.
	 * @returns {Object} Transformed options (also called `canonical options`).
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
	 * Transform a search query to its canonical form, replacing aliases or shorthands by full query.
	 *
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} originalQuery - Query to cast to its canonical form.
	 * @param   {QueryLanguage#Options}                options       - Options for this query.
	 * @returns {QueryLanguage#SelectQueryOrCondition} Query in its canonical form.
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
	 * Insert a single entity in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertOne` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}* entity).
	 */
	insertOne( table, entity ) {
		return this.insertMany( table, [ entity ]).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * Insert several entities in the data store. This function is a default polyfill if the inheriting adapter does not provide `insertMany` itself.
	 *
	 * @summary At least one of {@link insertOne} or {@link insertMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}   table    - Name of the table to insert data in.
	 * @param   {Object[]} entities - Array of hashs representing the entities to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntity}[]* entities).
	 */
	insertMany( table, entities ) {
		return Promise.mapSeries( entities, entity => this.insertOne( table, entity || {}));
	}

	// -----
	// ### Find

	/**
	 * Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
	 */
	findOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.findMany( table, queryFind, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself.
	 *
	 * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
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
	 * Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
	 */
	updateOne( table, queryFind, update, options = {}) {
		options.limit = 1;
		return this.updateMany( table, queryFind, update, options ).then( entities => Promise.resolve( _.first( entities )));
	}

	/**
	 * Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself.
	 *
	 * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
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
	 * Delete a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`).
	 */
	deleteOne( table, queryFind, options = {}) {
		options.limit = 1;
		return this.deleteMany( table, queryFind, options );
	}

	/**
	 * Delete several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteMany` itself.
	 *
	 * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`).
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

},{"../dependencies":8}],3:[function(require,module,exports){
(function (global){
'use strict';

const {
	_, Promise,
} = require( '../dependencies' );
const DiasporaAdapter = require( './baseAdapter.js' );
const BrowserStorageEntity = require( '../dataStoreEntities/browserStorageEntity.js' );

/**
 * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
 * 
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class BrowserStorageDiasporaAdapter extends DiasporaAdapter {
	/**
	 * Create a new instance of local storage adapter.
	 * 
	 * @author gerkin
	 * @param {Object}  config                 - Configuration object.
	 * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
	 */
	constructor( config ) {
		/**
		 * Link to the BrowserStorageEntity.
		 * 
		 * @name classEntity
		 * @type {DataStoreEntities.BrowserStorageEntity}
		 * @memberof Adapters.BrowserStorageDiasporaAdapter
		 * @instance
		 * @author Gerkin
		 */
		super( BrowserStorageEntity );
		_.defaults( config, {
			session: false,
		});
		this.state = 'ready';
		/**
		 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
		 * 
		 * @type {Storage}
		 * @author Gerkin
		 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
		 * @see {@link Adapters.BrowserStorageDiasporaAdapter}:config.session parameter.
		 */
		this.source = ( true === config.session ? global.sessionStorage : global.localStorage );
	}

	/**
	 * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
	 * 
	 * @author gerkin
	 * @param {string} tableName - Name of the table (usually, model name).
	 * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
	 * @returns {undefined} This function does not return anything.
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
	}

	// -----
	// ### Utils

	/**
	 * Create a new unique id for this store's entity.
	 * 
	 * @author gerkin
	 * @returns {string} Generated unique id.
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
	 * Create the table key if it does not exist.
	 * 
	 * @author gerkin
	 * @param   {string} table - Name of the table.
	 * @returns {string[]} Index of the collection.
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
	 * Reduce, offset or sort provided set.
	 * 
	 * @author gerkin
	 * @param   {Object[]} set     - Objects retrieved from memory store.
	 * @param   {Object}   options - Options to apply to the set.
	 * @returns {Object[]} Set with options applied.
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
	 * Deduce the item name from table name and item ID.
	 * 
	 * @author gerkin
	 * @param   {string} table - Name of the table to construct name for.
	 * @param   {string} id    - Id of the item to find.
	 * @returns {string} Name of the item.
	 */
	getItemName( table, id ) {
		return `${ table }.id=${ id }`;
	}

	// -----
	// ### Insert

	/**
	 * Insert a single entity in the local storage.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.BrowserStorageEntity}* `entity`).
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
	 * Insert several entities in the local storage.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string}   table    - Name of the table to insert data in.
	 * @param   {Object[]} entities - Array of hashes representing entities to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.BrowserStorageEntity}[]* `entities`).
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
	 * Find a single local storage entity using its id.
	 * 
	 * @author gerkin
	 * @param   {string} table - Name of the collection to search entity in.
	 * @param   {string} id    - Id of the entity to search.
	 * @returns {DataStoreEntities.BrowserStorageEntity|undefined} Found entity, or undefined if not found.
	 */
	findOneById( table, id ) {
		const item = this.source.getItem( this.getItemName( table, id ));
		if ( !_.isNil( item )) {
			return Promise.resolve( new this.classEntity( JSON.parse( item ), this ));
		}
		return Promise.resolve();
	}

	/**
	 * Retrieve a single entity from the local storage.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the model to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntities.BrowserStorageEntity}* `entity`).
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
	 * Update a single entity in the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link DataStoreEntities.BrowserStorageEntity}* `entity`).
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
	 * Delete a single entity from the local storage.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is deleted. Called with (*undefined*).
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
	 * Delete several entities from the local storage.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for local storage or session storage interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
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

module.exports = BrowserStorageDiasporaAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../dataStoreEntities/browserStorageEntity.js":6,"../dependencies":8,"./baseAdapter.js":2}],4:[function(require,module,exports){
(function (global){
'use strict';

const {
	_, Promise,
} = require( '../dependencies' );

const DiasporaAdapter = require( './baseAdapter.js' );
const InMemoryEntity = require( '../dataStoreEntities/inMemoryEntity.js' );

/**
 * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
 * 
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class InMemoryDiasporaAdapter extends DiasporaAdapter {
	/**
	 * Create a new instance of in memory adapter.
	 * 
	 * @author gerkin
	 */
	constructor() {
		/**
		 * Link to the InMemoryEntity.
		 * 
		 * @name classEntity
		 * @type {DataStoreEntities.InMemoryEntity}
		 * @memberof Adapters.InMemoryDiasporaAdapter
		 * @instance
		 * @author Gerkin
		 */
		super( InMemoryEntity );
		this.state = 'ready';
		/**
		 * Plain old javascript object used as data store.
		 * 
		 * @author Gerkin
		 */
		this.store = {};
	}

	/**
	 * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
	 * 
	 * @author gerkin
	 * @param   {string} tableName - Name of the table (usually, model name).
	 * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
	 * @returns {undefined} This function does not return anything.
	 */
	configureCollection( tableName, remaps ) {
		super.configureCollection( tableName, remaps );
		this.ensureCollectionExists( tableName );
	}

	// -----
	// ### Utils

	/**
	 * Create a new unique id for this store's entity.
	 * 
	 * @author gerkin
	 * @returns {string} Generated unique id.
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
	 * Get or create the store hash.
	 * 
	 * @author gerkin
	 * @param   {string} table - Name of the table.
	 * @returns {DataStoreTable} In memory table to use.
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
	 * Reduce, offset or sort provided set.
	 * 
	 * @author gerkin
	 * @param   {Object[]} set     - Objects retrieved from memory store.
	 * @param   {Object}   options - Options to apply to the set.
	 * @returns {Object[]} Set with options applied.
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
	 * Insert a single entity in the memory store.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string} table  - Name of the table to insert data in.
	 * @param   {Object} entity - Hash representing the entity to insert.
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link InMemoryEntity}* `entity`).
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
	 * Retrieve a single entity from the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
	 */
	findOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		const matches = _.filter( storeTable.items, _.partial( this.matchEntity, queryFind ));
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( reducedMatches.length > 0 ? new this.classEntity( _.first( reducedMatches ), this ) : undefined );
	}

	/**
	 * Retrieve several entities from the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to retrieve data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
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
	 * Update a single entity in the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
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
	 * Update several entities in the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to update data in.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {Object}                               update       - Object properties to set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
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
	 * Delete a single entity from the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
	 */
	deleteOne( table, queryFind, options = {}) {
		const storeTable = this.ensureCollectionExists( table );
		return this.findOne( table, queryFind, options ).then( entityToDelete => {
			storeTable.items = _.reject( storeTable.items, entity => entity.id === entityToDelete.idHash[this.name]);
			return Promise.resolve();
		});
	}

	/**
	 * Delete several entities from the memory.
	 * 
	 * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for in-memory interactions.
	 * @author gerkin
	 * @param   {string}                               table        - Name of the table to delete data from.
	 * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
	 * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
	 * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
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
},{"../dataStoreEntities/inMemoryEntity.js":7,"../dependencies":8,"./baseAdapter.js":2}],5:[function(require,module,exports){
'use strict';

const {
	_,
} = require( '../dependencies' );

/**
 * @namespace DataStoreEntities
 */

/**
 * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 * @memberof DataStoreEntities
 */
class DataStoreEntity {
	/**
	 * Construct a new data source entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
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
	 * Returns a plain object corresponding to this entity attributes.
	 * 
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity.
	 */
	toObject() {
		return _.omit( this, [ 'dataSource', 'id' ]);
	}
}

module.exports = DataStoreEntity;

},{"../dependencies":8}],6:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * Entity stored in {@link Adapters.BrowserStorageDiasporaAdapter the local storage adapter}.
 * 
 * @extends DataStoreEntities.DataStoreEntity
 * @memberof DataStoreEntities
 */
class BrowserStorageEntity extends DataStoreEntity {
	/**
	 * Construct a local storage entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = BrowserStorageEntity;

},{"./baseEntity.js":5}],7:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( './baseEntity.js' );

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 * @extends DataStoreEntities.DataStoreEntity
 * @memberof DataStoreEntities
 */
class InMemoryEntity extends DataStoreEntity {
	/**
	 * Construct a in memory entity with specified content & parent.
	 * 
	 * @author gerkin
	 * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
	 * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
	 */
	constructor( entity, dataSource ) {
		super( entity, dataSource );
	}
}

module.exports = InMemoryEntity;

},{"./baseEntity.js":5}],8:[function(require,module,exports){
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
(function (process){
'use strict';

const dependencies = require( './dependencies' );
const {
	_, Promise,
} = dependencies;

/**
 * Event emitter that can execute async handlers in sequence
 *
 * @typedef {Object} SequentialEvent
 * @author Gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */
const logger = (() => {
	if ( !process.browser ) {
		const winston = require( 'winston' );
		const log = winston.createLogger({
			level:      'silly',
			format:     winston.format.json(),
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
			],
		});

		//
		// If we're not in production then log to the `console` with the format:
		// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
		//
		if ( process.env.NODE_ENV !== 'production' ) {
			log.add( new winston.transports.Console({
				format: winston.format.simple(),
			}));
		}
		return log;
	} else {
		return console;
	}
})();

const adapters = {};
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
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Object}                               entity    - Entity to check.
	 * @param   {module:ModelExtension.ModelPrototype} modelDesc - Model description.
	 * @returns {Error[]} Array of errors.
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
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Any}                                   value     - Value to check.
	 * @param   {module:ModelExtension.FieldDescriptor} fieldDesc - Description of the field to check with.
	 * @param   {String[]}                              keys      - Array of keys from highest ancestor to this property.
	 * @returns {Object} Hash describing errors.
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
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   {Object}         entity    - Entity to set defaults in.
	 * @param   {ModelPrototype} modelDesc - Model description.
	 * @returns {Object} Entity merged with default values.
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
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   {Any}             value     - Value to default.
	 * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
	 * @returns {Any} Defaulted value.
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

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createDataSource( adapterLabel, config ) {
		if ( !adapters.hasOwnProperty( adapterLabel )) {
			throw new Error( `Unknown adapter "${ adapterLabel }". Available currently are ${ Object.keys( adapters ).join( ', ' ) }` );
		}
		const baseAdapter = new adapters[adapterLabel]( config );
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
	 * Stores the data source with provided label.
	 *
	 * @author gerkin
	 * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
	 * @param   {string}          name       - Name associated with this datasource.
	 * @param   {DiasporaAdapter} dataSource - Datasource itself.
	 * @returns {undefined} This function does not return anything.
	 */
	registerDataSource( name, dataSource ) {
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( dataSources.hasOwnProperty( name )) {
			throw new Error( `DataSource name already used, had "${ name }"` );
		}
		if ( !( dataSource instanceof Diaspora.components.DiasporaAdapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}
		dataSource.name = name;
		_.merge( dataSources, {
			[name]: dataSource,
		});
	},

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} name         - Name associated with this datasource.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createNamedDataSource( name, adapterLabel, config ) {
		const dataSource = Diaspora.createDataSource( adapterLabel, config );
		Diaspora.registerDataSource( name, dataSource );
	},

	/**
	 * Create a new Model with provided description.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if parameters are incorrect.
	 * @param   {string} name      - Name associated with this datasource.
	 * @param   {Object} modelDesc - Description of the model to define.
	 * @returns {Model} Model created.
	 */
	declareModel( name, modelDesc ) {
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( !_.isObject( modelDesc )) {
			throw new Error( '"modelDesc" must be an object' );
		}
		const model = new Diaspora.components.Model( name, modelDesc );
		_.assign( models, {
			[name]: model,
		});
		return model;
	},

	/**
	 * Register a new adapter and make it available to use by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if an adapter already exists with same label.
	 * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
	 * @param   {string}                   label   - Label of the adapter to register.
	 * @param   {Adapters.DiasporaAdapter} adapter - The adapter to register.
	 * @returns {undefined} This function does not return anything.
	 */
	registerAdapter( label, adapter ) {
		if ( adapters[label]) {
			throw new Error( `Adapter with label "${ label }" already exists.` );
		}
		// Check inheritance of adapter
		if ( !( adapter.prototype instanceof Diaspora.components.DiasporaAdapter )) {
			throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
		}
		adapters[label] = adapter;
	},

	/**
	 * Hash containing all available models.
	 *
	 * @type {Object}
	 * @property {Model} * - Model associated with that name.
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @see Use {@link Diaspora.declareModel} to add models.
	 */
	models,
	/**
	 * Hash containing all available data sources.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter} * - Instances of adapters declared.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
	 */
	dataSources,
	/**
	 * Hash containing all available adapters. The only universal adapter is `inMemory`.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter}        *        - Adapter constructor. Those constructors must be subclasses of DiasporaAdapter.
	 * @property {Adapters.InMemorDiasporaAdapter} inMemory - InMemoryDiasporaAdapter constructor.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.registerAdapter} to add adapters.
	 */
	adapters,
	/**
	 * Dependencies of Diaspora.
	 *
	 * @type {Object}
	 * @property {Bluebird}        Promise          - Bluebird lib.
	 * @property {Lodash}          _                - Lodash lib.
	 * @property {SequentialEvent} sequential-event - SequentialEvent lib.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 */
	dependencies: dependencies,
	/**
	 * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
	 *
	 * @type {Winston|Console}
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 */
	logger,
};

module.exports = Diaspora;

// Load components after export, so requires of Diaspora returns a complete object
/**
 * Hash of components exposed by Diaspora.
 *
 * @type {Object}
 * @memberof Diaspora
 * @private
 * @author gerkin
 */
Diaspora.components = {
	Entity: require( './entityFactory' )( null, {}, null ),
	Set:    require( './set' ),
	Model:  require( './model' ),
	Errors: {
		EntityValidationError: require( './errors/entityValidationError' ),
		SetValidationError:    require( './errors/setValidationError' ),
		EntityStateError:      require( './errors/entityStateError' ),
	},
	DiasporaAdapter: require( './adapters/baseAdapter' ),
	DataStoreEntity: require( './dataStoreEntities/baseEntity' ),
};

// Register available built-in adapters
Diaspora.registerAdapter( 'inMemory', require( './adapters/inMemoryAdapter' ));
// Register browserStorage only if in browser
if ( process.browser ) {
	Diaspora.registerAdapter( 'browserStorage', require( './adapters/browserStorageAdapter' ));
}

}).call(this,require('_process'))
},{"./adapters/baseAdapter":2,"./adapters/browserStorageAdapter":3,"./adapters/inMemoryAdapter":4,"./dataStoreEntities/baseEntity":5,"./dependencies":8,"./entityFactory":10,"./errors/entityStateError":11,"./errors/entityValidationError":12,"./errors/setValidationError":14,"./model":15,"./set":16,"_process":18,"winston":undefined}],10:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( './dependencies' );
const Diaspora = require( './diaspora' );
const DataStoreEntity = require( './dataStoreEntities/baseEntity' );
const EntityValidationError = require( './errors/entityValidationError' );
const EntityStateError = require( './errors/entityStateError' );
const Utils = require( './utils' );

/**
 * @namespace EntityFactory
 */

/**
 * This factory function generate a new class constructor, prepared for a specific model.
 *
 * @memberof EntityFactory
 * @param   {string}           name       - Name of this model.
 * @param   {ModelDescription} modelDesc  - Model configuration that generated the associated `model`.
 * @param   {Model}            model      - Model that will spawn entities.
 * @returns {Entity} Entity constructor to use with this model.
 */
function EntityFactory( name, modelDesc, model ) {
	const modelAttrsKeys = _.keys( modelDesc.attributes );

	/**
	 * The entity is the class you use to manage a single document in all data sources managed by your model.
	 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
	 * @summary An entity is a document in the population of all your datas of the same type
	 * @extends SequentialEvent
	 * @memberof EntityFactory
	 */
	class Entity extends SequentialEvent {
		/**
		 * Create a new entity.
		 *
		 * @author gerkin
		 * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
		 *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
		 */
		constructor( source = {}) {
			super();

			// Stores the object state
			let state = 'orphan';
			let lastDataSource = null;
			const dataSources = Object.seal( _.mapValues( model.dataSources, () => undefined ));

			const entityPrototype = {
				/**
				 * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
				 *
				 * @name dataSources
				 * @readonly
				 * @type {Object}
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 */
				dataSources: {
					value: dataSources,
				},
				/**
				 * Returns a copy of this entity attributes.
				 *
				 * @method toObject
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 * @returns {Object} Attributes of this entity.
				 */
				toObject: () => {
					return _.omit( attributes, entityPrototypeProperties );
				},
				/**
				 * Save this entity in specified data source.
				 *
				 * @method persist
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @fires EntityFactory.Entity#beforeUpdate
				 * @fires EntityFactory.Entity#afterUpdate
				 * @author gerkin
				 * @param   {string}  sourceName                 - Name of the data source to persist entity in.
				 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
				 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
				 * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`.
				 */
				persist: ( sourceName, options = {}) => {
					_.defaults( options, {
						skipEvents: false,
					});
					const dataSource = this.constructor.model.getDataSource( sourceName );
					const beforeState = state;
					state = 'syncing';

					// Args are always the same.
					const eventsArgs = [ sourceName ];
					let promise;

					// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
					const suffix = 'orphan' === beforeState ? 'Create' : 'Update';
					if ( options.skipEvents ) {
						promise = Promise.resolve();
					} else {
						promise = this.emit( 'beforePersist', ...eventsArgs ).then(() => {
							return this.emit( 'beforeValidate', ...eventsArgs );
						}).then(() => {
							this.validate();
							return this.emit( 'afterValidate', ...eventsArgs );
						}).then(() => {
							return this.emit( `beforePersist${  suffix }`, ...eventsArgs );
						});
					}
					return promise.then(() => {
						lastDataSource = dataSource.name;
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							return dataSource.insertOne( this.table( sourceName ), this.toObject());
						} else {
							return dataSource.updateOne( this.table( sourceName ), this.uidQuery( dataSource ), this.toObject());
						}
					}).then( dataStoreEntity => {
						if ( options.skipEvents ) {
							return Promise.resolve( dataStoreEntity );
						} else {
							return this.emit( `afterPersist${  suffix }`, ...eventsArgs ).then(() => {
								return this.emit( 'afterPersist', ...eventsArgs );
							}).then(() => {
								return Promise.resolve( dataStoreEntity );
							});
						}
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						return  Promise.resolve( entityProxied );
					});
				},
				/**
				 * Reload this entity from specified data source.
				 *
				 * @method fetch
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @fires EntityFactory.Entity#beforeFind
				 * @fires EntityFactory.Entity#afterFind
				 * @author gerkin
				 * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
				 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
				 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
				 * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`.
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
						promise = this.emit( 'beforeFetch', sourceName );
					}
					return promise.then(() => {
						// Depending on state, we are going to perform a different operation
						if ( 'orphan' === beforeState ) {
							return Promise.reject( new EntityStateError( 'Can\'t fetch an orphan entity.' ));
						} else {
							lastDataSource = dataSource.name;
							return dataSource.findOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
					}).then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterFetch', sourceName ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * Delete this entity from the specified data source.
				 *
				 * @method destroy
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @fires EntityFactory.Entity#beforeDelete
				 * @fires EntityFactory.Entity#afterDelete
				 * @author gerkin
				 * @param   {string}  sourceName                 - Name of the data source to delete entity from.
				 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
				 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
				 * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`.
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
						promise = this.emit( 'beforeDestroy', sourceName );
					}
					return promise.then(() => {
						if ( 'orphan' === beforeState ) {
							return Promise.reject( new EntityStateError( 'Can\'t fetch an orphan entity.' ));
						} else {
							lastDataSource = dataSource.name;
							return dataSource.deleteOne( this.table( sourceName ), this.uidQuery( dataSource ));
						}
					}).then(() => {
						// If this was our only data source, then go back to orphan state
						if ( 0 === _.without( model.dataSources, dataSource.name ).length ) {
							state = 'orphan';
						} else {
							state = 'sync';
							delete attributes.idHash[dataSource.name];
						}
						entityDefined.dataSources[dataSource.name] = undefined;
						if ( options.skipEvents ) {
							return  Promise.resolve( entityProxied );
						} else {
							return this.emit( 'afterDestroy', sourceName ).then(() => Promise.resolve( entityProxied ));
						}
					});
				},
				/**
				 * Get entity's current state.
				 *
				 * @name dataSources
				 * @readonly
				 * @type {Entity.State}
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 */
				state: {
					get() {
						return state;
					},
				},
				/**
				 * Get entity's last data source.
				 *
				 * @name dataSources
				 * @readonly
				 * @type {null|string}
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 */
				lastDataSource: {
					get() {
						return lastDataSource;
					},
				},
				/**
				 * Generate the query to get this unique entity in the desired data source.
				 *
				 * @method uidQuery
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
				 * @returns {Object} Query to find this entity.
				 */
				uidQuery( dataSource ) {
					return {
						id: attributes.idHash[dataSource.name],
					};
				},
				/**
				 * Return the table of this entity in the specified data source.
				 *
				 * @method table
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 * @returns {string} Name of the table.
				 */
				table( /*sourceName*/ ) {
					// Will be used later
					return name;
				},
				/**
				 * Check if the entity matches model description.
				 *
				 * @memberof EntityFactory.Entity
				 * @instance
				 * @author gerkin
				 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
				 * @returns {undefined} This function does not return anything.
				 * @see Diaspora.check
				 */
				validate() {
					const validationErrors = Diaspora.check( attributes, modelDesc.attributes );
					if ( !_.isEmpty( validationErrors )) {
						throw new EntityValidationError( validationErrors, 'Validation failed' );
					}
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
			const sourceUReserved = _.intersection( sourceKeys, entityPrototypeProperties );
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
			Diaspora.default( attributes, modelDesc.attributes );

			// Bind lifecycle events
			_.forEach( modelDesc.lifecycleEvents, ( eventFunctions, eventName ) => {
				// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
				_.forEach( _.castArray( eventFunctions ), eventFunction => {
					this.on( eventName, eventFunction );
				});
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
				enumerate: () => {
					return _.keys( attributes );
				},
				ownKeys: () => {
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
		 * Name of the class.
		 *
		 * @type {string}
		 * @readonly
		 * @memberof EntityFactory.Entity
		 * @static
		 * @author gerkin
		 */
		name: {
			value:      `${ name  }Entity`,
			writable:   false,
			enumerable: true,
		},
		/**
		 * Reference to this entity's model.
		 *
		 * @type {Model}
		 * @readonly
		 * @memberof EntityFactory.Entity
		 * @static
		 * @author gerkin
		 */
		model: {
			value:      model,
			writable:   false,
			enumerable: true,
		},
	});

	// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
	// Extend prototype with methods in our model description
	_.forEach( modelDesc.methods, ( methodName, method ) => {
		Entity.prototype[methodName] = method;
	});
	// Add static methods
	_.forEach( modelDesc.staticMethods, ( staticMethodName, staticMethod ) => {
		Entity[staticMethodName] = staticMethod;
	});
	return EntityWrapped;
}

// =====
// ## Lifecycle Events

// -----
// ### Persist

/**
 * @event EntityFactory.Entity#beforePersist
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforeValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersist
 * @type {String}
 */

// -----
// ### Find

/**
 * @event EntityFactory.Entity#beforeFind
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterFind
 * @type {String}
 */

// -----
// ### Destroy

/**
 * @event EntityFactory.Entity#beforeDestroy
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterDestroy
 * @type {String}
 */

module.exports = EntityFactory;

},{"./dataStoreEntities/baseEntity":5,"./dependencies":8,"./diaspora":9,"./errors/entityStateError":11,"./errors/entityValidationError":12,"./utils":17}],11:[function(require,module,exports){
'use strict';

const ExtendableError = require( './extendableError' );

/**
 * This class represents an error related to validation.
 * @extends Error
 */
class EntityStateError extends ExtendableError {
	/**
	 * Construct a new error related to an invalide state of the entity.
	 * 
	 * @author gerkin
	 * @memberof Errors
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( ...errorArgs ) {
		super( ...errorArgs );
	}
}

module.exports = EntityStateError;

},{"./extendableError":13}],12:[function(require,module,exports){
'use strict';

const {
	_,
} = require( '../dependencies' );
const ExtendableError = require( './extendableError' );

const stringifyValidationObject = validationErrors => {
	return _( validationErrors ).mapValues(( error, key ) => {
		return `${ key } => ${ JSON.stringify( error.value ) }
* ${ _( error ).omit([ 'value' ]).values().map( _.identity ).value() }`;
	}).values().join( '\n* ' );
};

/**
 * This class represents an error related to validation.
 *
 * @extends Error
 * @memberof Errors
 */
class EntityValidationError extends ExtendableError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @memberof Errors
	 * @param {Object} validationErrors - Object describing validation errors, usually returned by {@link Diaspora.check}.
	 * @param {string} message          - Message of this error.
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( validationErrors, message, ...errorArgs ) {
		message += `
${ stringifyValidationObject( validationErrors ) }`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
	}
}

module.exports = EntityValidationError;

},{"../dependencies":8,"./extendableError":13}],13:[function(require,module,exports){
'use strict';

/**
 * @namespace Errors
 */

/**
 * This class is the base class for custom Diaspora errors
 * @extends Error
 */
class ExtendableError extends Error {
	/**
	 * Construct a new extendable error.
	 * 
	 * @author gerkin
	 * @param {string} message          - Message of this error.
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( message, ...errorArgs ) {
		super( message, ...errorArgs );
		this.constructor = super.target;
		if ( 'function' === typeof Error.captureStackTrace ) {
			Error.captureStackTrace( this, super.target );
		} else { 
			this.stack = ( new Error( message )).stack; 
		}
	}
}

module.exports = ExtendableError;

},{}],14:[function(require,module,exports){
'use strict';

const {
	_,
} = require( '../dependencies' );
const ExtendableError = require( './extendableError' );


/**
 * This class represents an error related to validation on a set.
 *
 * @extends Error
 * @memberof Errors
 */
class SetValidationError extends ExtendableError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @memberof Errors
	 * @param {string}                         message          - Message of this error.
	 * @param {Errors.EntityValidationError[]} validationErrors - Array of validation errors.
	 * @param {*}                              errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( message, validationErrors, ...errorArgs ) {
		message += `[\n${ _( validationErrors ).map(( error, index ) => {
			if ( _.isNil( error )) {
				return false;
			} else {
				return `${ index  }: ${  error.message.replace( /\n/g, '\n	' ) }`;
			}
		}).filter( _.identity ).join( ',\n' ) }\n]`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
	}
}

module.exports = SetValidationError;

},{"../dependencies":8,"./extendableError":13}],15:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const EntityFactory = require( './entityFactory' );
const Diaspora = require( './diaspora' );
const Set = require( './set' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @namespace ModelConfiguration
 */

/**
 * Object describing a model.
 * 
 * @typedef  {Object} ModelConfiguration.ModelDescription
 * @author gerkin
 * @property {ModelConfiguration.SourcesDescriptor}    sources         - List of sources to use with this model.
 * @property {ModelConfiguration.AttributesDescriptor} attributes      - Attributes of the model.
 * @property {Object<string, Function>}                methods         - Methods to add to entities prototype.
 * @property {Object<string, Function>}                staticMethods   - Static methods to add to entities.
 * @property {Object<string, Function|Function[]>}     lifecycleEvents - Events to bind on entities.
 */

/**
 * The model class is used to interact with the population of all data of the same type.
 */
class Model {
	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 * 
	 * @author gerkin
	 * @param {string}                              name      - Name of the model.
	 * @param {ModelConfiguration.ModelDescription} modelDesc - Hash representing the configuration of the model.
	 */
	constructor( name, modelDesc ) {
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
		const scopeAvailableSources = Diaspora.dataSources;
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
		this.entityFactory = EntityFactory( name, modelDesc, this );
	}

	/**
	 * Create a new Model that is allowed to interact with all entities of data sources tables selected.
	 * 
	 * @author gerkin
	 * @throws  {Error} Thrown if requested source name does not exists.
	 * @param   {string} [sourceName=Model.defaultDataSource] - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.sources.
	 * @returns {Adapters.DiasporaAdapter} Source adapter with requested name.
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
	 * Create a new *orphan* {@link Entity entity}.
	 * 
	 * @author gerkin
	 * @param   {Object} source - Object to copy attributes from.
	 * @returns {Entity} New *orphan* entity.
	 */
	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	/**
	 * Create multiple new *orphan* {@link Entity entities}.
	 * 
	 * @author gerkin
	 * @param   {Object[]} sources - Array of objects to copy attributes from.
	 * @returns {Set} Set with new *orphan* entities.
	 */
	spawnMulti( sources ) {
		return new Set( this, _.map( sources, source => this.spawn( source )));
	}

	/**
	 * Insert a raw source object in the data store.
	 * 
	 * @author gerkin
	 * @param   {Object} source                                   - Object to copy attributes from.
	 * @param   {string} [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
	 * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}.
	 */
	insert( source, dataSourceName ) {
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.insertOne( this.name, source ).then( entity => {
			return Promise.resolve( new this.entityFactory( entity ));
		});
	}

	/**
	 * Insert multiple raw source objects in the data store.
	 * 
	 * @author gerkin
	 * @param   {Object[]} sources                                  - Array of object to copy attributes from.
	 * @param   {string}   [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
	 * @returns {Promise} Promise resolved with a {@link Set set} containing new *sync* entities.
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
	 * Retrieve a single entity from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with the found {@link Entity entity} in *sync* state.
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
	 * Retrieve multiple entities from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with a {@link Set set} of found entities in *sync* state.
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
	 * Update a single entity from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
	 * @param   {Object}                               update                                   - Attributes to update on matched set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with the updated {@link Entity entity} in *sync* state.
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
	 * Update multiple entities from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {Object}                               update                                   - Attributes to update on matched set.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with the {@link Set set} of found entities in *sync* state.
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
	 * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entity.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with `undefined`.
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
	 * Delete multiple entities from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind={}]                           - Query to get desired entities.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entities from.
	 * @returns {Promise} Promise resolved with `undefined`.
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

},{"./dependencies":8,"./diaspora":9,"./entityFactory":10,"./set":16}],16:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const Utils = require( './utils' );
const SetValidationError = require( './errors/setValidationError' );

/**
 * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
 */
class Set {
	/**
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @param {Model}           model    - Model describing entities managed by this set.
	 * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	constructor( model, ...entities ) {
		// Flatten arguments
		entities = _( entities ).flatten();
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( entities.value(), model );

		const defined = Utils.defineEnumerableProperties( this, {
			/**
			 * List entities of this set.
			 *
			 * @name entities
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {LodashWrapper<Entity>}
			 * @author Gerkin
			 */
			entities: entities,
			/**
			 * Model that generated this set.
			 *
			 * @name model
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {Model}
			 * @author Gerkin
			 */
			model:    model,
			/**
			 * Number of entities in this set.
			 *
			 * @name length
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {Integer}
			 * @author Gerkin
			 */
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

	/**
	 * Check if all entities in the first argument are from the expected model.
	 *
	 * @author gerkin
	 * @throws {TypeError} Thrown if one of the entity is not from provided `model`.
	 * @param {Entity[]} entities - Array of entities to check.
	 * @param {Model}    model    - Model expected to be the source of all entities.
	 * @returns {undefined} This function does not return anything.
	 */
	static checkEntitiesFromModel( entities, model ) {
		entities.forEach(( entity, index ) => {
			if ( entity.constructor.model !== model ) {
				throw new TypeError( `Provided entity n°${ index } ${ entity } is not from model ${ model } (${ model.modelName })` );
			}
		});
	}

	/**
	 * Persist all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param {string} sourceName - Data source name to persist in.
	 * @returns {Promise} Promise resolved once all items are persisted.
	 * @see {@link EntityFactory.Entity#persist}
	 */
	persist( sourceName ) {
		const suffixes = this.entities.map( entity => 'orphan' === entity.state ? 'Create' : 'Update' ).value();
		return Promise.all( this.entities.map( entity => entity.emit( 'beforePersist' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'beforeValidate' )));
		}).then(() => {
			let errors = 0;
			const validationResults = this.entities.map( entity => {
				try {
					entity.validate();
					return undefined;
				} catch ( e ) {
					errors++;
					return e;
				}
			}).value();
			if ( errors > 0 ) {
				return Promise.reject( new SetValidationError( `Set validation failed for ${ errors } elements (on ${ this.length }): `, validationResults ));
			} else {
				return Promise.resolve();
			}
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterValidate' )));
		}).then(() => {
			return Promise.all( this.entities.map(( entity, index ) => entity.emit( `beforePersist${  suffixes[index] }` )));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.persist( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map(( entity, index ) => entity.emit( `afterPersist${  suffixes[index] }` )));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterPersist' )));
		}).then(() => this );
	}

	/**
	 * Reload all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param {string} sourceName - Data source name to reload entities from.
	 * @returns {Promise} Promise resolved once all items are reloaded.
	 * @see {@link EntityFactory.Entity#fetch}
	 */
	fetch( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeFetch' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.fetch( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterFetch' )));
		}).then(() => this );
	}

	/**
	 * Destroy all entities from this collection.
	 *
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param {string} sourceName - Name of the data source to delete entities from.
	 * @returns {Promise} Promise resolved once all items are destroyed.
	 * @see {@link EntityFactory.Entity#destroy}
	 */
	destroy( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeDestroy' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.destroy( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterDestroy' )));
		}).then(() => this );
	}

	/**
	 * Update all entities in the set with given object.
	 *
	 * @author gerkin
	 * @param   {Object} newData - Attributes to change in each entity of the collection.
	 * @returns {Collection} `this`.
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

},{"./dependencies":8,"./errors/setValidationError":14,"./utils":17}],17:[function(require,module,exports){
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
};

},{"./dependencies":8}],18:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1])(1)
});