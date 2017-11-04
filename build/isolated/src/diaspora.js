(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Diaspora = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

const Diaspora = require( './lib/diaspora' );

module.exports = Diaspora;

},{"./lib/diaspora":10}],2:[function(require,module,exports){
'use strict';

const {_} = require( '../../dependencies' );

module.exports = {
	OPERATORS: {
		$exists:       ( entityVal, targetVal ) => targetVal === !_.isUndefined( entityVal ),
		$equal:        ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal === targetVal,
		$diff:         ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal !== targetVal,
		$less:         ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal < targetVal,
		$lessEqual:    ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal <= targetVal,
		$greater:      ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal > targetVal,
		$greaterEqual: ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal >= targetVal,
	},
	CANONICAL_OPERATORS: {
		'~':  '$exists',
		'==': '$equal',
		'!=': '$diff',
		'<':  '$less',
		'<=': '$lessEqual',
		'>':  '$greater',
		'>=': '$greaterEqual',
	},
	QUERY_OPTIONS_TRANSFORMS: {
		limit( opts ) {
			let limitOpt = opts.limit;
			if ( _.isString( limitOpt )) {
				limitOpt = parseInt( limitOpt );
			}
			if ( !( _.isInteger( limitOpt ) || Infinity === limitOpt ) || limitOpt < 0 ) {
				throw new TypeError( `Expect "options.limit" to be an integer equal to or above 0, have ${ limitOpt }` );
			}
			opts.limit = limitOpt;
		},
		skip( opts ) {
			let skipOpt = opts.skip;
			if ( _.isString( skipOpt )) {
				skipOpt = parseInt( skipOpt );
			}
			if ( !_.isInteger( skipOpt ) || skipOpt < 0 || !isFinite( skipOpt )) {
				throw new TypeError( `Expect "options.skip" to be a finite integer equal to or above 0, have ${ skipOpt }` );
			}
			opts.skip = skipOpt;
		},
		page( opts ) {
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
		},
	},
};

},{"../../dependencies":9}],3:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( '../../dependencies' );

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

const iterateLimit = ( options, query ) => {
	const foundEntities = [];
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
		return query( options ).then( loopFind );
	};
	return loopFind;
};

const {
	OPERATORS, CANONICAL_OPERATORS, QUERY_OPTIONS_TRANSFORMS,
} = require( './adapter-utils' );

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
	 * @param   {boolean} [invert=false] - Set to `false` to cast to `table` field names, `true` to cast to `entity` field name.
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
	 * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
	 * @param   {string} tableName - Name of the table for which we remap.
	 * @param   {Object} query     - Hash representing the entity to remap.
	 * @returns {Object} Remapped object.
	 */
	remapInput( tableName, query ) {
		return this.remapIO( tableName, query, true );
	}

	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @see {@link Adapters.DiasporaAdapter#remapIO remapIO}
	 * @param   {string} tableName - Name of the table for which we remap.
	 * @param   {Object} query     - Hash representing the entity to remap.
	 * @returns {Object} Remapped object.
	 */
	remapOutput( tableName, query ) {
		return this.remapIO( tableName, query, false );
	}

	/**
	 * TODO.
	 *
	 * @author gerkin
	 * @see TODO remapping.
	 * @param   {string}  tableName - Name of the table for which we remap.
	 * @param   {Object}  query     - Hash representing the entity to remap.
	 * @param   {boolean} input     - Set to `true` if handling input, `false`to output.
	 * @returns {Object} Remapped object.
	 */
	remapIO( tableName, query, input ) {
		if ( _.isNil( query )) {
			return query;
		}
		const direction = true === input ? 'input' : 'output';
		const filtered = _.mapValues( query, ( value, key ) => {
			if ( _.isObject( _.get( this, [ 'filters', direction ])) && this.filters[direction].hasOwnProperty( key )) {
				return this.filters.output[key]( value );
			}
			return value;
		});
		const remaps = true === input ? this.remaps : this.remapsInverted;
		const remaped = _.mapKeys( filtered, ( value, key ) => {
			if ( remaps.hasOwnProperty( key )) {
				return remaps[key];
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
	 * @returns {boolean} Returns `true` if query matches, `false` otherwise.
	 */
	matchEntity( query, entity ) {
		const matchResult = _.every( _.toPairs( query ), ([ key, desc ]) => {
			if ( _.isObject( desc )) {
				const entityVal = entity[key];
				return _.every( desc, ( val, operation ) => {
					if ( OPERATORS.hasOwnProperty( operation )) {
						return OPERATORS[operation]( entityVal, val );
					} else {
						return false;
					}
				});
			}
			return false;
		});
		return matchResult;
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

		_.forEach( QUERY_OPTIONS_TRANSFORMS, ( transform, optionName ) => {
			if ( opts.hasOwnProperty( optionName )) {
				QUERY_OPTIONS_TRANSFORMS[optionName]( opts );
			}
		});

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
		const normalizedQuery = true === options.remapInput ? _( _.cloneDeep( originalQuery )).mapValues( attrSearch => {
			if ( _.isUndefined( attrSearch )) {
				return { $exists: false };
			} else if ( !( attrSearch instanceof Object )) {
				return { $equal: attrSearch };
			} else {
				// Replace operations alias by canonical expressions
				attrSearch = _.mapKeys( attrSearch, ( val, operator, obj ) => {
					if ( CANONICAL_OPERATORS.hasOwnProperty( operator )) {
						// ... check for conflict with canonical operation name...
						if ( obj.hasOwnProperty( CANONICAL_OPERATORS[operator])) {
							throw new Error( `Search can't have both "${ operator }" and "${ CANONICAL_OPERATORS[operator] }" keys, as they are synonyms` );
						}
						return CANONICAL_OPERATORS[operator];
					}
					return operator;
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
		options = this.normalizeOptions( options );
		return iterateLimit( options, _.partial( this.findOne, table, queryFind, _ ))( true );
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
		options = this.normalizeOptions( options );
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
		options = this.normalizeOptions( options );
		return iterateLimit( options, _.partial( this.updateOne, table, queryFind, update, _ ))( true );
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

},{"../../dependencies":9,"./adapter-utils":2}],4:[function(require,module,exports){
'use strict';

const {
	_,
} = require( '../../dependencies' );

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

},{"../../dependencies":9}],5:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );
const Utils = require( '../../utils' );

const DiasporaAdapter = require( '../base/adapter' );
const InMemoryEntity = require( './entity.js' );

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
		entity.id = Utils.generateUUID();
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
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
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
		const reducedMatches = Utils.applyOptionsToSet( matches, options );
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
				Utils.applyUpdateEntity( update, match );
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
					Utils.applyUpdateEntity( update, item );
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

},{"../../dependencies":9,"../../utils":18,"../base/adapter":3,"./entity.js":6}],6:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( '../base/entity.js' );

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

},{"../base/entity.js":4}],7:[function(require,module,exports){
(function (global){
'use strict';

const {
	_, Promise,
} = require( '../../dependencies' );
const Utils = require( '../../utils' );

const DiasporaAdapter = require( '../base/adapter' );
const WebStorageEntity = require( './entity' );

/**
 * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
 * 
 * @extends Adapters.DiasporaAdapter
 * @memberof Adapters
 */
class WebStorageDiasporaAdapter extends DiasporaAdapter {
	/**
	 * Create a new instance of local storage adapter.
	 * 
	 * @author gerkin
	 * @param {Object}  config                 - Configuration object.
	 * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
	 */
	constructor( config ) {
		/**
		 * Link to the WebStorageEntity.
		 * 
		 * @name classEntity
		 * @type {DataStoreEntities.WebStorageEntity}
		 * @memberof Adapters.WebStorageDiasporaAdapter
		 * @instance
		 * @author Gerkin
		 */
		super( WebStorageEntity );
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
		 * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
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
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
	 */
	insertOne( table, entity ) {
		entity = _.cloneDeep( entity || {});
		entity.id = Utils.generateUUID();
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
	 * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link DataStoreEntities.WebStorageEntity}[]* `entities`).
	 */
	insertMany( table, entities ) {
		entities = _.cloneDeep( entities );
		try {
			const tableIndex = this.ensureCollectionExists( table );
			entities = entities.map(( entity = {}) => {
				entity.id = Utils.generateUUID();
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
	 * @returns {DataStoreEntities.WebStorageEntity|undefined} Found entity, or undefined if not found.
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
	 * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
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
	 * @returns {Promise} Promise resolved once update is done. Called with (*{@link DataStoreEntities.WebStorageEntity}* `entity`).
	 */
	updateOne( table, queryFind, update, options ) {
		_.defaults( options, {
			skip: 0,
		});
		return this.findOne( table, queryFind, options ).then( entity => {
			if ( _.isNil( entity )) {
				return Promise.resolve();
			}
			Utils.applyUpdateEntity( update, entity );
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

module.exports = WebStorageDiasporaAdapter;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../dependencies":9,"../../utils":18,"../base/adapter":3,"./entity":8}],8:[function(require,module,exports){
'use strict';

const DataStoreEntity = require( '../base/entity.js' );

/**
 * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
 * 
 * @extends DataStoreEntities.DataStoreEntity
 * @memberof DataStoreEntities
 */
class WebStorageEntity extends DataStoreEntity {
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

module.exports = WebStorageEntity;

},{"../base/entity.js":4}],9:[function(require,module,exports){
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
},{"bluebird":undefined,"lodash":undefined,"sequential-event":undefined}],10:[function(require,module,exports){
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

/**
 * @module Diaspora
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

const ensureAllEntities = ( adapter, table ) => {
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

	return results => {
		if ( _.isArrayLike( results )) {
			return Promise.resolve( _.map( results, filterResults ));
		} else {
			return Promise.resolve( filterResults( results ));
		}
	};
};

const remapArgs = ( args, optIndex, update, queryType, remapFunction ) => {
	if ( false !== optIndex ) {
		// Remap input objects
		if ( true === args[optIndex].remapInput ) {
			args[0] = remapFunction( args[0]);

			if ( true === update ) {
				args[1] = remapFunction( args[1]);
			}
		}
		args[optIndex].remapInput = false;
	} else if ( 'insert' === queryType.query ) {
		// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
		if ( 'many' === queryType.number ) {
			// If inserting *several* entities, map the array to remap each entity objects...
			args[0] = _.map( args[0], insertion => remapFunction( insertion ));
		} else {
			// ... or we are inserting a *single* one. We still need to remap entity.
			args[0] = remapFunction( args[0]);
		}
	}
};

const getRemapFunction = ( adapter, table ) => {
	return entity => {
		return adapter.remapFields( table, entity, false );
	};
};

const wrapDataSourceAction = ( callback, queryType, adapter ) => {
	return ( table, ...args ) => {

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
			if ( false !== optIndex ) {
				// Options to canonical
				args[optIndex] = adapter.normalizeOptions( args[optIndex]);
				// Query search to cannonical
				args[0] = adapter.normalizeQuery( args[0], args[optIndex]);
			}
			remapArgs( args, optIndex, upd, queryType, getRemapFunction( adapter, table ));
		} catch ( err ) {
			return Promise.reject( err );
		}

		// Hook after promise resolution
		return callback.call( adapter, table, ...args ).then( ensureAllEntities( adapter, table ));
	};
};

const ERRORS = {
	NON_EMPTY_STR: _.template( '<%= c %> <%= p %> must be a non empty string, had "<%= v %>"' ),
};

const requireName = ( classname, value ) => {
	if ( !_.isString( value ) && value.length > 0 ) {
		throw new Error( ERRORS.NON_EMPTY_STR({
			c: classname,
			p: 'name',
			v: value,
		}));
	}
};

/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
const Diaspora = {
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
		requireName( 'DataSource', name );
		if ( dataSources.hasOwnProperty( name )) {
			throw new Error( `DataSource name already used, had "${ name }"` );
		}
		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
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
	 * @param   {string} sourceName   - Name associated with this datasource.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createNamedDataSource( sourceName, adapterLabel, configHash ) {
		const dataSource = Diaspora.createDataSource( adapterLabel, configHash );
		Diaspora.registerDataSource( sourceName, dataSource );
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
			requireName( 'Model', name );
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
		if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
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
	EntityFactory: require( './entityFactory' ),
	Entity:        require( './entityFactory' ).Entity,
	Set:           require( './set' ),
	Model:         require( './model' ),
	Validator:     require( './validator' ),
	Errors:        {
		ExtendableError:       require( './errors/extendableError' ),
		EntityValidationError: require( './errors/entityValidationError' ),
		SetValidationError:    require( './errors/setValidationError' ),
		EntityStateError:      require( './errors/entityStateError' ),
	},
	Adapters: {
		Adapter: require( './adapters/base/adapter' ),
		Entity:  require( './adapters/base/entity' ),
	},
};

// Register available built-in adapters
Diaspora.registerAdapter( 'inMemory', require( './adapters/inMemory/adapter' ));
// Register webStorage only if in browser
if ( process.browser ) {
	Diaspora.registerAdapter( 'webStorage', require( './adapters/webStorage/adapter' ));
}

}).call(this,require('_process'))
},{"./adapters/base/adapter":3,"./adapters/base/entity":4,"./adapters/inMemory/adapter":5,"./adapters/webStorage/adapter":7,"./dependencies":9,"./entityFactory":11,"./errors/entityStateError":12,"./errors/entityValidationError":13,"./errors/extendableError":14,"./errors/setValidationError":15,"./model":16,"./set":17,"./validator":19,"_process":20,"winston":undefined}],11:[function(require,module,exports){
'use strict';

const {
	_, Promise, SequentialEvent,
} = require( './dependencies' );
const Diaspora = require( './diaspora' );
const DataStoreEntity = require( './adapters/base/entity' );
const EntityStateError = require( './errors/entityStateError' );

/**
 * @module EntityFactory
 */

const DEFAULT_OPTIONS = { skipEvents: false };
const PRIVATE = Symbol( 'PRIVATE' );

const maybeEmit = ( entity, options, eventsArgs, events ) => {
	events = _.castArray( events );
	if ( options.skipEvents ) {
		return Promise.resolve( entity );
	} else {
		return entity.emit( events[0], ...eventsArgs ).then(() => {
			if ( events.length > 1 ) {
				return maybeEmit( entity, options, eventsArgs, _.slice( events, 1 ));
			} else {
				return Promise.resolve( entity );
			}
		});
	}
};
const maybeThrowInvalidEntityState = ( entity, beforeState, dataSource, method ) => {
	return () => {
		// Depending on state, we are going to perform a different operation
		if ( 'orphan' === beforeState ) {
			return Promise.reject( new EntityStateError( 'Can\'t fetch an orphan entity.' ));
		} else {
			entity[PRIVATE].lastDataSource = dataSource.name;
			return dataSource[method]( entity.table( dataSource.name ), entity.uidQuery( dataSource ));
		}
	};
};

const entityCtrSteps = {
	bindLifecycleEvents( entity, modelDesc ) {
		// Bind lifecycle events
		_.forEach( modelDesc.lifecycleEvents, ( eventFunctions, eventName ) => {
			// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
			_.forEach( _.castArray( eventFunctions ), eventFunction => {
				entity.on( eventName, eventFunction );
			});
		});
	},
	loadSource( _entity, source ) {
		// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
		if ( source instanceof DataStoreEntity ) {
			_.assign( _entity, {
				state:          'sync',
				lastDataSource: source.dataSource.name, 
			});
			_entity.dataSources[_entity.lastDataSource] = source;
			source = _.omit( source.toObject(), [ 'id' ]);
		}
		return source;
	},
};

/**
 * The entity is the class you use to manage a single document in all data sources managed by your model.
 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
 * 
 * @extends SequentialEvent
 */
class Entity extends SequentialEvent {
	/**
	 * Create a new entity.
	 *
	 * @author gerkin
	 * @param {string}                                   name        - Name of this model.
	 * @param {ModelDescription}                         modelDesc   - Model configuration that generated the associated `model`.
	 * @param {Model}                                    model       - Model that will spawn entities.
	 * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
	 *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
	 */
	constructor( name, modelDesc, model, source = {}) {
		const modelAttrsKeys = _.keys( modelDesc.attributes );
		super();

		// ### Init defaults
		const dataSources = Object.seal( _.mapValues( model.dataSources, () => undefined ));
		const _this = {
			state:          'orphan',
			lastDataSource: null,
			dataSources,
			name,
			modelDesc,
			model, 
		};
		this[PRIVATE] = _this;
		// ### Load datas from source
		source = entityCtrSteps.loadSource( _this, source );
		// ### Final validation
		// Check keys provided in source
		const sourceDModel = _.difference( source, modelAttrsKeys );
		if ( 0 !== sourceDModel.length ) { // Later, add a criteria for schemaless models
			throw new Error( `Source has unknown keys: ${ JSON.stringify( sourceDModel ) } in ${ JSON.stringify( source ) }` );
		}
		// ### Generate prototype & attributes
		// Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
		_this.attributes = Diaspora.default( _.cloneDeep( source ), modelDesc.attributes );
		source = null;

		// ### Load events
		entityCtrSteps.bindLifecycleEvents( this, modelDesc );
	}

	/**
	 * Generate the query to get this unique entity in the desired data source.
	 *
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
	 * @returns {Object} Query to find this entity.
	 */
	uidQuery( dataSource ) {
		return {
			id: this[PRIVATE].attributes.idHash[dataSource.name],
		};
	}

	/**
	 * Return the table of this entity in the specified data source.
	 *
	 * @author gerkin
	 * @returns {string} Name of the table.
	 */
	table( /*sourceName*/ ) {
		// Will be used later
		return this[PRIVATE].name;
	}

	/**
	 * Check if the entity matches model description.
	 *
	 * @author gerkin
	 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
	 * @returns {undefined} This function does not return anything.
	 * @see Validator.Validator#validate
	 */
	validate() {
		this.constructor.model.validator.validate( this[PRIVATE].attributes );
	}

	/**
	 * Remove all editable properties & replace them with provided object.
	 *
	 * @author gerkin
	 * @param   {Object} [newContent={}] - Replacement content.
	 * @returns {module:EntityFactory~Entity} Returns `this`.
	 */
	replaceAttributes( newContent = {}) {
		newContent.idHash = this[PRIVATE].attributes.idHash;
		this[PRIVATE].attributes = newContent;
		return this;
	}

	/**
	 * Generate a diff update query by checking deltas with last source interaction.
	 *
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
	 * @returns {Object} Diff query.
	 */
	getDiff( dataSource ) {
		const dataStoreEntity = this[PRIVATE].dataSources[dataSource.name];
		const dataStoreObject = dataStoreEntity.toObject();

		const keys = _( this[PRIVATE].attributes ).keys().concat( _.keys( dataStoreObject )).uniq().difference([ 'idHash' ]).value();
		const values = _( keys ).filter( key => {
			return this[PRIVATE].attributes[key] !== dataStoreObject[key];
		}).map( key => {
			return this[PRIVATE].attributes[key];
		}).value();
		const diff = _.zipObject( keys, values );
		return diff;
	}

	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @author gerkin
	 * @returns {Object} Attributes of this entity.
	 */
	toObject() {
		return this[PRIVATE].attributes;
	}

	/**
	 * Save this entity in specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to persist entity in.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
	 * @returns {Promise} Promise resolved once entity is saved. Resolved with `this`.
	 */
	persist( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );

		// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
		const suffix = 'orphan' === beforeState ? 'Create' : 'Update';
		return _maybeEmit([ 'beforePersist', 'beforeValidate' ])
			.then(() => this.validate())
			.then(() => _maybeEmit([ 'afterValidate', `beforePersist${ suffix }` ]))
			.then(() => {
				this[PRIVATE].lastDataSource = dataSource.name;
				// Depending on state, we are going to perform a different operation
				if ( 'orphan' === beforeState ) {
					return dataSource.insertOne( this.table( sourceName ), this.toObject());
				} else {
					return dataSource.updateOne( this.table( sourceName ), this.uidQuery( dataSource ), this.getDiff( dataSource ));
				}
			})
			.then( dataStoreEntity => {
				this[PRIVATE].state = 'sync';
				this[PRIVATE].attributes = dataStoreEntity.toObject();
				this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

				return _maybeEmit([ `afterPersist${ suffix }`, 'afterPersist' ]);
			});
	}

	/**
	 * Reload this entity from specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
	 * @returns {Promise} Promise resolved once entity is reloaded. Resolved with `this`.
	 */
	fetch( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );
		return _maybeEmit( 'beforeFetch' )
			.then( maybeThrowInvalidEntityState( this, beforeState, dataSource, 'findOne' ))
			.then( dataStoreEntity => {
				this[PRIVATE].state = 'sync';
				this[PRIVATE].attributes = dataStoreEntity.toObject();
				this[PRIVATE].dataSources[dataSource.name] = dataStoreEntity;

				return _maybeEmit( 'afterFetch' );
			});
	}

	/**
	 * Delete this entity from the specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to delete entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
	 * @returns {Promise} Promise resolved once entity is destroyed. Resolved with `this`.
	 */
	destroy( sourceName, options = {}) {
		_.defaults( options, DEFAULT_OPTIONS );
		// Change the state of the entity
		const beforeState = this[PRIVATE].state;
		this[PRIVATE].state = 'syncing';
		// Generate events args
		const dataSource = this.constructor.model.getDataSource( sourceName );
		const eventsArgs = [ dataSource.name ];
		const _maybeEmit = _.partial( maybeEmit, this, options, eventsArgs );
		return _maybeEmit( 'beforeDestroy' )
			.then( maybeThrowInvalidEntityState( this, beforeState, dataSource, 'deleteOne' ))
			.then(() => {
			// If this was our only data source, then go back to orphan state
				if ( 0 === _.without( this[PRIVATE].model.dataSources, dataSource.name ).length ) {
					this[PRIVATE].state = 'orphan';
				} else {
					this[PRIVATE].state = 'sync';
					delete this[PRIVATE].attributes.idHash[dataSource.name];
				}
				this[PRIVATE].dataSources[dataSource.name] = undefined;
				return _maybeEmit( 'afterDestroy' );
			});
	}

	/**
	 * Hash that links each data source with its name. This object is prepared with keys from model sources, and sealed.
	 *
	 * @type {Object}
	 * @author gerkin
	 */
	get dataSources() {
		return this[PRIVATE].dataSources;
	}

	/**
	 * TODO.
	 *
	 * @type {TODO}
	 * @author gerkin
	 */
	get attributes() {
		return this[PRIVATE].attributes;
	}

	/**
	 * Get entity's current state.
	 *
	 * @type {Entity.State}
	 * @author gerkin
	 */
	get state() {
		return this[PRIVATE].state;
	}

	/**
	 * Get entity's last data source.
	 *
	 * @type {null|string}
	 * @author gerkin
	 */
	get lastDataSource() {
		return this[PRIVATE].lastDataSource;
	}
}

/**
 * This factory function generate a new class constructor, prepared for a specific model.
 *
 * @method EntityFactory
 * @public
 * @static
 * @param   {string}           name       - Name of this model.
 * @param   {ModelDescription} modelDesc  - Model configuration that generated the associated `model`.
 * @param   {Model}            model      - Model that will spawn entities.
 * @returns {module:EntityFactory~Entity} Entity constructor to use with this model.
 * @property {module:EntityFactory~Entity} Entity Entity constructor
 */
const EntityFactory = ( name, modelDesc, model ) => {
	/**
	 * @ignore
	 */
	class SubEntity extends Entity {
		/**
		 * Name of the class.
		 *
		 * @type {string}
		 * @author gerkin
		 */
		static get name() {
			return `${ name  }Entity`;
		}
		/**
		 * Reference to this entity's model.
		 *
		 * @type {Model}
		 * @author gerkin
		 */
		static get model() {
			return model;
		}
	}
	// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
	// Extend prototype with methods in our model description
	_.forEach( modelDesc.methods, ( methodName, method ) => {
		SubEntity.__proto__[methodName] = method;
	});
	// Add static methods
	_.forEach( modelDesc.staticMethods, ( staticMethodName, staticMethod ) => {
		SubEntity[staticMethodName] = staticMethod;
	});
	return SubEntity.bind( Entity, name, modelDesc, model );
};
EntityFactory.Entity = Entity;
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

},{"./adapters/base/entity":4,"./dependencies":9,"./diaspora":10,"./errors/entityStateError":12}],12:[function(require,module,exports){
'use strict';

const ExtendableError = require( './extendableError' );

/**
 * @module Errors/EntityStateError
 */

/**
 * This class represents an error related to validation.
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class EntityStateError extends ExtendableError {
	/**
	 * Construct a new error related to an invalide state of the entity.
	 * 
	 * @author gerkin
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( ...errorArgs ) {
		super( ...errorArgs );
	}
}

module.exports = EntityStateError;

},{"./extendableError":14}],13:[function(require,module,exports){
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
 * @module Errors/EntityValidationError
 */

/**
 * This class represents an error related to validation.
 *
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class EntityValidationError extends ExtendableError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
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

},{"../dependencies":9,"./extendableError":14}],14:[function(require,module,exports){
'use strict';

/**
 * @module Errors/ExtendableError
 */

/**
 * This class is the base class for custom Diaspora errors
 * 
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

},{}],15:[function(require,module,exports){
'use strict';

const {
	_,
} = require( '../dependencies' );
const ExtendableError = require( './extendableError' );

/**
 * @module Errors/SetValidationError
 */

/**
 * This class represents an error related to validation on a set.
 *
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class SetValidationError extends ExtendableError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @param {string}                                                      message          - Message of this error.
	 * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
	 * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
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

},{"../dependencies":9,"./extendableError":14}],16:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const EntityFactory = require( './entityFactory' );
const Diaspora = require( './diaspora' );
const Set = require( './set' );
const Validator = require( './validator' );

const {
	entityPrototypeProperties,
} = EntityFactory;

/**
 * @module Model
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

const findArgs = ( model, queryFind = {}, options = {}, dataSourceName ) => {
	let ret;
	if ( _.isString( options ) && !!_.isNil( dataSourceName )) {
		ret = {
			dataSourceName: options,
			options:        {},
		};
	} else if ( _.isString( queryFind ) && !!_.isNil( options ) && !!_.isNil( dataSourceName )) {
		ret = {
			dataSourceName: queryFind,
			queryFind:      {},
			options:        {},
		};
	} else {
		ret = {
			queryFind,
			options,
			dataSourceName,
		};
	}
	ret.dataSource = model.getDataSource( ret.dataSourceName );
	return ret;
};

const makeSet = model => {
	return dataSourceEntities => {
		const newEntities = _.map( dataSourceEntities, dataSourceEntity => new model.entityFactory( dataSourceEntity ));
		const set = new Set( model, newEntities );
		return Promise.resolve( set );
	};
};
const makeEntity = model => {
	return dataSourceEntity => {
		if ( _.isNil( dataSourceEntity )) {
			return Promise.resolve();
		}
		const newEntity = new model.entityFactory( dataSourceEntity );
		return Promise.resolve( newEntity );
	};
};

const doDelete = ( methodName, model ) => {
	return ( queryFind = {}, options = {}, dataSourceName ) => {
		const args = findArgs( model, queryFind, options, dataSourceName );
		return args.dataSource[methodName]( model.name, args.queryFind, args.options );
	};
};

const doFindUpdate = ( model, plural, queryFind, options, dataSourceName, update ) => {
	const queryComponents = findArgs( model, queryFind, options, dataSourceName );
	const args = _([ model.name, queryComponents.queryFind ]).push( update ).push( queryComponents.options ).compact().value();
	return queryComponents.dataSource[( update ? 'update' : 'find' ) + ( plural ? 'Many' : 'One' )]( ...args )
		.then(( plural ? makeSet : makeEntity )( model ));
};

const normalizeRemaps = ( remap, dataSourceName ) => {
	if ( true === remap ) {
		return {};
	} else if ( _.isObject( remap )) {
		return remap;
	} else {
		throw new TypeError( `Datasource "${ dataSourceName }" value is invalid: expect \`true\` or a remap hash, but have ${ JSON.stringify( remap ) }` );
	}
};

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
		// Check model configuration
		const reservedPropIntersect = _.intersection( entityPrototypeProperties, _.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		} else if ( !modelDesc.hasOwnProperty( 'sources' ) || !( _.isArrayLike( modelDesc.sources ) || _.isObject( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
		const sourcesNormalized = _.isArrayLike( modelDesc.sources ) ? _.zipObject( modelDesc.sources, _.times( modelDesc.sources.length, _.constant({}))) : _.mapValues( modelDesc.sources, normalizeRemaps );
		// List sources required by this model
		const [ sourceNames, scopeAvailableSources ] = [ _.keys( sourcesNormalized ), Diaspora.dataSources ];
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
		_.assign( this, {
			dataSources:       modelSources,
			defaultDataSource: sourceNames[0],
			name,
			entityFactory:     EntityFactory( name, modelDesc, this ),
			validator:         new Validator( modelDesc.attributes ),
		});
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
	spawnMany( sources ) {
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
		return dataSource.insertMany( this.name, sources ).then( makeSet( this ));
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
	find( queryFind, options, dataSourceName ) {
		return doFindUpdate( this, false, queryFind, options, dataSourceName );
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
	findMany( queryFind, options, dataSourceName ) {
		return doFindUpdate( this, true, queryFind, options, dataSourceName );
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
		return doFindUpdate( this, false, queryFind, options, dataSourceName, update );
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
		return doFindUpdate( this, true, queryFind, options, dataSourceName, update );
	}

	/**
	 * Delete a single entity from specified data source that matches provided `queryFind` and `options`.
	 * 
	 * @author gerkin
	 * @param   {QueryLanguage#SelectQueryOrCondition} [queryFind]                           - Query to get desired entity.
	 * @param   {QueryLanguage#QueryOptions}           [options={}]                             - Options for this query.
	 * @param   {string}                               [dataSourceName=Model.defaultDataSource] - Name of the data source to get entity from.
	 * @returns {Promise} Promise resolved with `undefined`.
	 */
	delete( queryFind, options = {}, dataSourceName ) {
		return doDelete( 'deleteOne', this )( queryFind, options, dataSourceName );
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
		return doDelete( 'deleteMany', this )( queryFind, options, dataSourceName );
	}
}

module.exports = Model;

},{"./dependencies":9,"./diaspora":10,"./entityFactory":11,"./set":17,"./validator":19}],17:[function(require,module,exports){
'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const Utils = require( './utils' );
const SetValidationError = require( './errors/setValidationError' );

/**
 * @module Set
 */

/**
 * Get the verb of the action (either the `verb` param or the string at the `index` position in `verb` array).
 * 
 * @author Gerkin
 * @inner
 * @param   {string|string[]} verb - Verbs to get item from.
 * @param   {integer} index        - Index of the verb to pick.
 * @returns {string} Verb for this index's item.
 */
const getVerb = ( verb, index ) => _.isArray( verb ) ? verb[index] : verb;

/**
 * Emit events on each entities.
 * 
 * @author Gerkin
 * @inner
 * @param   {SequentialEvent[]} entities - Items to iterate over.
 * @param   {string|string[]}   verb     - Verb of the action to emit.
 * @param   {string}            prefix   - Prefix to prepend to the verb.
 * @returns {Promise} Promise resolved once all promises are done.
 */
const allEmit = ( entities, verb, prefix ) => Promise.all( entities.map(( entity, index ) => entity.emit( `${ prefix }${ getVerb( verb, index ) }` )));

/**
 * Emit `before` & `after` events around the entity action. `this` must be bound to the calling {@link Set}.
 * 
 * @author Gerkin
 * @inner
 * @this Set
 * @param   {string} sourceName    - Name of the data source to interact with.
 * @param   {string} action        - Name of the entity function to apply.
 * @param   {string|string[]} verb - String or array of strings to map for events suffix.
 * @returns {Promise} Promise resolved once events are finished.
 */
function wrapEventsAction( sourceName, action, verb ) {
	const _allEmit = _.partial( allEmit, this.entities, verb );
	return _allEmit( 'before' ).then(() => {
		return Promise.all( this.entities.map( entity => entity[action]( sourceName, {
			skipEvents: true,
		})));
	}).then(() => _allEmit( 'after' ));
}

const setProxyProps = {
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
};

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

		return new Proxy( defined, setProxyProps );
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
		const _allEmit = _.partial( allEmit, this.entities );
		return _allEmit( 'Persist', 'before' )
			.then(() => _allEmit( 'Validate', 'before' ))
			.then(() => {
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
			})
			.then(() => _allEmit( 'Validate', 'after' ))
			.then(() => wrapEventsAction.call( this, sourceName, 'persist', _.map( suffixes, suffix => `Persist${ suffix }` )))
			.then(() => _allEmit( 'Persist', 'after' )).then(() => this );
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
		return wrapEventsAction.call( this, sourceName, 'fetch', 'Fetch' ).then(() => this );
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
		return wrapEventsAction.call( this, sourceName, 'destroy', 'Destroy' ).then(() => this );
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
			Utils.applyUpdateEntity( newData, entity );
		});
		return this;
	}

	/**
	 * Returns a POJO representation of this set's data.
	 *
	 * @author gerkin
	 * @returns {Object} POJO representation of set & children.
	 */
	toObject() {
		return this.entities.map( entity => entity.toObject());
	}
}

module.exports = Set;

},{"./dependencies":9,"./errors/setValidationError":15,"./utils":18}],18:[function(require,module,exports){
(function (global){
'use strict';

const {
	_,
} = require( './dependencies' );

/**
 * @module Utils
 */

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
	},

	/**
	 * Reduce, offset or sort provided set.
	 * 
	 * @author gerkin
	 * @param   {Object[]} set     - Objects retrieved from memory store.
	 * @param   {Object}   options - Options to apply to the set.
	 * @returns {Object[]} Set with options applied.
	 */
	applyOptionsToSet( set, options ) {
		_.defaults( options, {
			limit: Infinity,
			skip:  0,
		});
		set = set.slice( options.skip );
		if ( set.length > options.limit ) {
			set = set.slice( 0, options.limit );
		}
		return set;
	},
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./dependencies":9}],19:[function(require,module,exports){
'use strict';

const dependencies = require( './dependencies' );
const EntityValidationError = require( './errors/entityValidationError' );
const { _ } = dependencies;

/**
 * @module Validator
 */

/**
 * Execute the simple tester and return an error component if it returns falsey.
 *
 * @param   {Function} tester - The test function to invoke.
 * @returns {module:Validator~Checker} Function to execute to validate the type.
 */
const validateWrongType = tester => {
	return ( keys, fieldDesc, value ) => {
		if ( !tester( value )) {
			return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
		}
	};
};

/**
 * Prepare the check of each items in the array.
 *
 * @param   {module:Validator~Validator} validator - Validator instance that do this call.
 * @param   {Object}                     fieldDesc - Description of the field to check.
 * @param   {module:Validator~PathStack} keys      - Keys so far.
 * @returns {Function} Function to execute to validate array items.
 */
const validateArrayItems = ( validator, fieldDesc, keys ) => {
	return ( propVal, index ) => {
		if ( fieldDesc.hasOwnProperty( 'of' )) {
			const ofArray = _.castArray( fieldDesc.of );
			const subErrors = _( ofArray ).map(( desc, subIndex ) => validator.check(
				propVal,
				keys.clone().pushValidationProp( 'of', _.isArray( fieldDesc.of ) ? subIndex : undefined ).pushEntityProp( index ),
				{getProps: false}
			));
			if ( !_.isArray( fieldDesc.of )) {
				return subErrors.get( 0 );
			} else if ( subErrors.compact().value().length === ofArray.length ) {
				return subErrors.toPlainObject().omitBy( _.isNil ).value();
			}
		}
		return {};
	};
};

/**
 * A checker is a function that can return an error component with provided standard args.
 *
 * @callback Checker
 * @param   {module:Validator~PathStack} keys      - Pathstack so far.
 * @param   {Object}                     fieldDesc - Description of the field.
 * @param   {Any}                        value     - Value to check.
 * @returns {Object} Error component.
 */

/**
 * Store for validation functions.
 *
 * @type {object}
 * @property {object<string, module:Validator~Checker>} TYPE - Type checkers.
 * @property {module:Validator~Checker} TYPE.string - String type checker.
 * @property {module:Validator~Checker} TYPE.integer - Integer type checker.
 * @property {module:Validator~Checker} TYPE.float - Float type checker.
 * @property {module:Validator~Checker} TYPE.date - Date type checker.
 * @property {module:Validator~Checker} TYPE.object - Object type checker.
 * @property {module:Validator~Checker} TYPE.array - Array type checker.
 * @property {module:Validator~Checker} TYPE.any - Type checker for type 'any'.
 * @property {module:Validator~Checker} TYPE._ - Default function for unhandled type.
 */
const VALIDATIONS = {
	TYPE: {
		string:  validateWrongType( _.isString ),
		integer: validateWrongType( _.isInteger ),
		float:   validateWrongType( _.isNumber ),
		date:    validateWrongType( _.isDate ),
		object( keys, fieldDesc, value ) {
			if ( !_.isObject( value )) {
				return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
			} else {
				const deepTest = _.isObject(
					fieldDesc.attributes
				) ? _( _.assign({}, fieldDesc.attributes, value )).mapValues(
						( pv, propName ) => {
							const propVal = value[propName];
							return this.check(
								propVal,
								keys.clone().pushValidationProp( 'attributes' ).pushProp( propName ),
								{getProps: false}
							);
						}
					)
						.omitBy( _.isEmpty )
						.value() : {};
				if ( !_.isEmpty( deepTest )) {
					return {children: deepTest};
				}
			}
		},
		array( keys, fieldDesc, value ) {
			if ( !_.isArray( value )) {
				return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
			} else {
				const deepTest = _.isObject(
					fieldDesc.of
				) ? _( value ).map( validateArrayItems( this, fieldDesc, keys ))
						.omitBy( _.isEmpty )
						.value() : {};
				if ( !_.isEmpty( deepTest )) {
					return {children: deepTest};
				}
			}
		},
		any( keys, fieldDesc, value ) {
			if ( !_.stubTrue( value )) {
				return {type: `${ keys.toValidatePath() } expected to be assigned with any type`};
			}
		},
		_( keys, fieldDesc ) {
			return {type: `${ keys.toValidatePath() } requires to be unhandled type "${ fieldDesc.type }"`};
		},
	},
};

/**
 * Standard function that can be used to add steps to the validation process..
 *
 * @callback ValidationStep
 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Object of arguments.
 * @returns {undefined} This function returns nothing.
 */

/**
 * This object can be passed through each validation steps.
 *
 * @typedef  {Object} ValidationStepsArgs
 * @property {Object}                     error     - Error object to extend.
 * @property {Object}                     fieldDesc - Description of the field.
 * @property {module:Validator~PathStack} keys      - Pathstack representing keys so far.
 * @property {*}                          value     - Value to check.
 */


const VALIDATION_STEPS = ([
	/**
	 * Apply the custom `validate` function or function array, if it exists.
	 *
	 * @function module:Validator~checkCustoms
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkCustoms( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// It the field has a `validate` property, try to use it
		const validateFcts = _( fieldDesc.validate ).castArray().compact();
		validateFcts.forEach( validateFct => {
			if ( !validateFct.call( this, value, fieldDesc )) {
				error.validate = `${ keys.toValidatePath() } custom validation failed`;
			}
		});
	},
	/**
	 * Check if the type & the existence matches the `type` & `required` specifications.
	 *
	 * @function module:Validator~checkTypeRequired
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkTypeRequired( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// Check the type and the required status
		if ( !_.isNil( fieldDesc.type ) && !_.isNil( fieldDesc.model )) {
			error.spec =  `${ keys.toValidatePath() } spec can't have both a type and a model`;
			// Apply the `required` modifier
		} else if ( true === fieldDesc.required && _.isNil( value )) {
			error.required = `${ keys.toValidatePath() } is a required property of type "${ fieldDesc.type }"`;
		} else if ( !_.isNil( value )) {
			if ( _.isString( fieldDesc.type )) {
				const tester = _.get( VALIDATIONS, [ 'TYPE', fieldDesc.type ], fieldDesc.type._ );
				_.assign( error, tester.call( this, keys, fieldDesc, value ));
			} else {
				error.spec =  `${ keys.toValidatePath() } spec "type" must be a string`;
			}
		}
	},
	/**
	 * Verify if the value correspond to a value in the `enum` property.
	 *
	 * @function module:Validator~checkEnum
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkEnum( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// Check enum values
		if ( !_.isNil( value ) && !_.isNil( fieldDesc.enum )) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( enumVal instanceof RegExp ) {
					return null !== value.match( enumVal );
				} else {
					return value === enumVal;
				}
			});
			if ( false === result ) {
				error.enum = `${ keys.toValidatePath() } expected to have one of enumerated values "${ JSON.stringify( fieldDesc.enum ) }"`;
			}
		}
	},
]);
/**
 * Those validation steps are called one after one during the validation of a single field.
 *
 * @const VALIDATION_STEPS
 * @type {module:Validator~ValidationStep[]}
 * @property {module:Validator~checkCustoms}      '0' - Check for `validate` field.
 * @property {module:Validator~checkTypeRequired} '1' - Check for `type` & `required` fields.
 * @property {module:Validator~checkEnum}         '2' - Check for `enum` field.
 */

const PRIVATE = Symbol( 'PRIVATE' );

/**
 * The PathStack class allows model validation to follow different paths in model description & entity.
 */
class PathStack {
	/**
	 * Constructs a pathstack.
	 *
	 * @author gerkin
	 * @param {string[]} [segmentsEntity=[]]     - Keys to follow in entity.
	 * @param {string[]} [segmentsValidation=[]] - Keys to follow in model description.
	 */
	constructor( segmentsEntity = [], segmentsValidation = []) {
		_.assign( this, {
			segmentsEntity,
			segmentsValidation,
		});
	}

	/**
	 * Add a path segment for entity navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushEntityProp( ...prop ) {
		this.segmentsEntity = _( this.segmentsEntity ).concat( prop ).filter( _.isNil ).value();
		return this;
	}

	/**
	 * Add a path segment for model description navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushValidationProp( ...prop ) {
		this.segmentsValidation = _( this.segmentsValidation ).concat( prop ).filter( val => !_.isNil( val )).value();
		return this;
	}

	/**
	 * Add a path segment for both entity & model description navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushProp( ...prop ) {
		return this.pushEntityProp( ...prop ).pushValidationProp( ...prop );
	}

	/**
	 * Get a string version of entity segments.
	 *
	 * @returns {string} String representation of path in entity.
	 */
	toValidatePath() {
		return this.segmentsEntity.join( '.' );
	}

	/**
	 * Cast this PathStack to its representing arrays.
	 *
	 * @returns {Array<Array<string>>} Array of paths. The first path represents the entity segments, second represents model description segments.
	 */
	toArray() {
		return [
			this.segmentsEntity.slice(),
			this.segmentsValidation.slice(),
		];
	}

	/**
	 * Duplicate this PathStack, detaching its state from the new.
	 *
	 * @returns {module:Validator~PathStack} Clone of caller PathStack.
	 */
	clone() {
		return new PathStack( ...this.toArray());
	}
}

/**
 * The Validator class is used to check an entity or its fields against a model description.
 */
class Validator {
	/**
	 * Construct a Validator configured for the provided model.
	 *
	 * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
	 */
	constructor( modelDesc ) {
		const _this = {modelDesc};
		this[PRIVATE] = _this;
	}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Object} entity - Entity to check.
	 * @returns {Error[]} Array of errors.
	 */
	validate( entity ) {
		// Apply method `checkField` on each field described
		const checkResults = _( this[PRIVATE].modelDesc )
			.mapValues(( fieldDesc, field ) => this.check( entity[field], new PathStack().pushProp( field ), {getProps: false}))
			.omitBy( _.isEmpty )
			.value();
		if ( !_.isNil( checkResults ) && !_.isEmpty( checkResults )) {
			throw new EntityValidationError( checkResults, 'Validation failed' );
		}
	}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Any}                        value                  - Value to check.
	 * @param   {module:Validator~PathStack} keys                   - Pathstack representing path to this validation.
	 * @param   {Object}                     [options=(})]          - Hash of options.
	 * @param   {boolean}                    options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
	 * @returns {Object} Hash describing errors.
	 */
	check( value, keys, options = {}) {
		_.defaults( options, { getProps: true });
		if ( !( keys instanceof PathStack )) {
			keys = new PathStack( keys );
		}

		const val = options.getProps ? _.get( value, keys.segmentsEntity ) : value;
		const fieldDesc = _.get( this[PRIVATE].modelDesc, keys.segmentsValidation );
		if ( !_.isObject( fieldDesc )) {
			return;
		}
		_.defaults( fieldDesc, { required: false });

		const error = {};

		const stepsArgs = {
			error,
			fieldDesc,
			keys,
			value: val,
		};

		_.forEach( VALIDATION_STEPS, validationStep => {
			validationStep.call( this, stepsArgs );
		});

		if ( !_.isEmpty( error )) {
			error.value = value;
			return error;
		} else {
			return null;
		}
	}

	/**
	 * Get the model description provided in constructor.
	 *
	 * @readonly
	 * @type {ModelConfiguration.AttributesDescriptor}
	 */
	get modelDesc() {
		return _.cloneDeep( this[PRIVATE].modelDesc );
	}

	/**
	 * Get the PathStack constructor.
	 *
	 * @readonly
	 * @type {module:Validator~PathStack}
	 */
	static get PathStack() {
		return PathStack;
	}
}

module.exports = Validator;

},{"./dependencies":9,"./errors/entityValidationError":13}],20:[function(require,module,exports){
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