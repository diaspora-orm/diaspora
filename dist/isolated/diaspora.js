/**
* @file diaspora
*
* Multi-Layer ORM for Javascript Client+Server
* Isolated build compiled on 2017-10-30 03:01:21
*
* @license GPL-3.0
* @version 0.2.0-rc.3
* @author Gerkin
*/
var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (f) {
	if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
		module.exports = f();
	} else if (typeof define === "function" && define.amd) {
		define([], f);
	} else {
		var g;if (typeof window !== "undefined") {
			g = window;
		} else if (typeof global !== "undefined") {
			g = global;
		} else if (typeof self !== "undefined") {
			g = self;
		} else {
			g = this;
		}g.Diaspora = f();
	}
})(function () {
	var define, module, exports;return function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
				}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];return s(n ? n : e);
				}, l, l.exports, e, t, n, r);
			}return n[o].exports;
		}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
			s(r[o]);
		}return s;
	}({ 1: [function (require, module, exports) {
			'use strict';

			var Diaspora = require('./lib/diaspora');

			module.exports = Diaspora;
		}, { "./lib/diaspora": 9 }], 2: [function (require, module, exports) {
			'use strict';

			var _require = require('../dependencies'),
			    _ = _require._,
			    Promise = _require.Promise,
			    SequentialEvent = _require.SequentialEvent;

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


			var DiasporaAdapter = function (_SequentialEvent) {
				_inherits(DiasporaAdapter, _SequentialEvent);

				// -----
				// ### Initialization

				/**
     * Create a new instance of adapter. This base class should be used by all other adapters.
     *
     * @public
     * @author gerkin
     * @param {DataStoreEntities.DataStoreEntity} classEntity - Entity to spawn with this adapter.
     */
				function DiasporaAdapter(classEntity) {
					_classCallCheck(this, DiasporaAdapter);

					/**
      * Describe current adapter status.
      *
      * @type {string}
      * @author Gerkin
      */
					var _this = _possibleConstructorReturn(this, (DiasporaAdapter.__proto__ || Object.getPrototypeOf(DiasporaAdapter)).call(this));

					_this.state = 'preparing';
					/**
      * Hash to transform entity fields to data store fields.
      *
      * @type {Object}
      * @property {string} * - Data store field associated with this entity field.
      * @author Gerkin
      */
					_this.remaps = {};
					/**
      * Hash to transform data store fields to entity fields.
      *
      * @type {Object}
      * @property {string} * - Entity field associated with this data store field.
      * @author Gerkin
      */
					_this.remapsInverted = {};
					/**
      * Hash of functions to cast data store values to JSON standard values in entity.
      *
      * @type {Object}
      * @property {Function} * - Filter to execute to get standard JSON value.
      * @author Gerkin
      */
					_this.filters = {};
					/**
      * Link to the constructor of the class generated by this adapter.
      *
      * @type {DataStoreEntities.DataStoreEntity}
      * @author Gerkin
      */
					_this.classEntity = classEntity;
					/**
      * Error triggered by adapter initialization.
      *
      * @type {Error}
      * @author Gerkin
      */
					_this.error = undefined;

					// Bind events
					_this.on('ready', function () {
						_this.state = 'ready';
					}).on('error', function (err) {
						_this.state = 'error';
						_this.error = err;
					});
					return _this;
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


				_createClass(DiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(tableName, remaps) {
						var filters = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						this.remaps[tableName] = remaps;
						this.remapsInverted[tableName] = _.invert(remaps);
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

				}, {
					key: "waitReady",
					value: function waitReady() {
						var _this2 = this;

						return new Promise(function (resolve, reject) {
							if ('ready' === _this2.state) {
								return resolve(_this2);
							} else if ('error' === _this2.state) {
								return reject(_this2.error);
							}
							_this2.on('ready', function () {
								return resolve(_this2);
							}).on('error', function (err) {
								return reject(err);
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

				}, {
					key: "remapFields",
					value: function remapFields(tableName, query) {
						var invert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

						var keysMap = (invert ? this.remapsInverted : this.remaps)[tableName];
						if (_.isNil(keysMap)) {
							return query;
						}
						return _.mapKeys(query, function (value, key) {
							if (keysMap.hasOwnProperty(key)) {
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

				}, {
					key: "remapInput",
					value: function remapInput(tableName, query) {
						var _this3 = this;

						if (_.isNil(query)) {
							return query;
						}
						var filtered = _.mapValues(query, function (value, key) {
							if (_.isObject(_.get(_this3, 'filters.input')) && _this3.filters.input.hasOwnProperty(key)) {
								return _this3.filters.input[key](value);
							}
							return value;
						});
						var remaped = _.mapKeys(filtered, function (value, key) {
							if (_this3.remaps.hasOwnProperty(key)) {
								return _this3.remaps[key];
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

				}, {
					key: "remapOutput",
					value: function remapOutput(tableName, query) {
						var _this4 = this;

						if (_.isNil(query)) {
							return query;
						}
						var filtered = _.mapValues(query, function (value, key) {
							if (_.isObject(_.get(_this4, 'filters.output')) && _this4.filters.output.hasOwnProperty(key)) {
								return _this4.filters.output[key](value);
							}
							return value;
						});
						var remaped = _.mapKeys(filtered, function (value, key) {
							if (_this4.remapsInverted.hasOwnProperty(key)) {
								return _this4.remapsInverted[key];
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

				}, {
					key: "setIdHash",
					value: function setIdHash(entity) {
						var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';

						entity.idHash = _.assign({}, entity.idHash, _defineProperty({}, this.name, entity[propName]));
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

				}, {
					key: "matchEntity",
					value: function matchEntity(query, entity) {
						var matchResult = _.every(_.toPairs(query), function (_ref) {
							var _ref2 = _slicedToArray(_ref, 2),
							    key = _ref2[0],
							    desc = _ref2[1];

							if (_.isObject(desc)) {
								var entityVal = entity[key];
								return _.every(desc, function (val, operation) {
									switch (operation) {
										case '$exists':
											{
												return val === !_.isUndefined(entityVal);
											}

										case '$equal':
											{
												return !_.isUndefined(entityVal) && entityVal === val;
											}

										case '$diff':
											{
												return !_.isUndefined(entityVal) && entityVal !== val;
											}

										case '$less':
											{
												return !_.isUndefined(entityVal) && entityVal < val;
											}

										case '$lessEqual':
											{
												return !_.isUndefined(entityVal) && entityVal <= val;
											}

										case '$greater':
											{
												return !_.isUndefined(entityVal) && entityVal > val;
											}

										case '$greaterEqual':
											{
												return !_.isUndefined(entityVal) && entityVal >= val;
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

				}, {
					key: "applyUpdateEntity",
					value: function applyUpdateEntity(update, entity) {
						_.forEach(update, function (val, key) {
							if (_.isUndefined(val)) {
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

				}, {
					key: "normalizeOptions",
					value: function normalizeOptions() {
						var opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						opts = _.cloneDeep(opts);
						if (opts.hasOwnProperty('limit')) {
							var limitOpt = opts.limit;
							if (_.isString(limitOpt)) {
								limitOpt = parseInt(limitOpt);
							}
							if (!(_.isInteger(limitOpt) || Infinity === limitOpt) || limitOpt < 0) {
								throw new TypeError("Expect \"options.limit\" to be an integer equal to or above 0, have " + limitOpt);
							}
							opts.limit = limitOpt;
						}
						if (opts.hasOwnProperty('skip')) {
							var skipOpt = opts.skip;
							if (_.isString(skipOpt)) {
								skipOpt = parseInt(skipOpt);
							}
							if (!_.isInteger(skipOpt) || skipOpt < 0 || !isFinite(skipOpt)) {
								throw new TypeError("Expect \"options.skip\" to be a finite integer equal to or above 0, have " + skipOpt);
							}
							opts.skip = skipOpt;
						}
						if (opts.hasOwnProperty('page')) {
							if (!opts.hasOwnProperty('limit')) {
								throw new ReferenceError('Usage of "options.page" requires "options.limit" to be defined.');
							}
							if (!isFinite(opts.limit)) {
								throw new ReferenceError('Usage of "options.page" requires "options.limit" to not be infinite');
							}
							if (opts.hasOwnProperty('skip')) {
								throw new Error('Use either "options.page" or "options.skip"');
							}
							var pageOpt = opts.page;
							if (_.isString(pageOpt)) {
								pageOpt = parseInt(pageOpt);
							}
							if (!_.isInteger(pageOpt) || pageOpt < 0) {
								throw new TypeError("Expect \"options.page\" to be an integer equal to or above 0, have " + pageOpt);
							}
							opts.skip = pageOpt * opts.limit;
							delete opts.page;
						}
						_.defaults(opts, {
							skip: 0,
							remapInput: true,
							remapOutput: true
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

				}, {
					key: "normalizeQuery",
					value: function normalizeQuery(originalQuery, options) {
						var canonicalOperations = {
							'~': '$exists',
							'==': '$equal',
							'!=': '$diff',
							'<': '$less',
							'<=': '$lessEqual',
							'>': '$greater',
							'>=': '$greaterEqual'
						};
						var normalizedQuery = true === options.remapInput ? _(_.cloneDeep(originalQuery)).mapValues(function (attrSearch) {
							if (!(!_.isNil(attrSearch) && attrSearch instanceof Object)) {
								if (!_.isNil(attrSearch)) {
									return {
										$equal: attrSearch
									};
								} else {
									return {
										$exists: false
									};
								}
							} else {
								// Replace operations alias by canonical expressions
								_.forEach(canonicalOperations, function (canon, alias) {
									// If the currently checked alias is in the search hash...
									if (attrSearch.hasOwnProperty(alias)) {
										// ... check for conflict with canonical operation name...
										if (attrSearch.hasOwnProperty(canon)) {
											throw new Error("Search can't have both \"" + alias + "\" and \"" + canon + "\" keys, as they are synonyms");
										} else {
											// ... and replace alias by canonical
											attrSearch[canon] = attrSearch[alias];
											delete attrSearch[alias];
										}
									}
								});
								// For arithmetic comparison, check if values are numeric (TODO later: support date)
								_.forEach(['$less', '$lessEqual', '$greater', '$greaterEqual'], function (operation) {
									if (attrSearch.hasOwnProperty(operation) && !_.isNumber(attrSearch[operation])) {
										throw new TypeError("Expect \"" + operation + "\" in " + JSON.stringify(attrSearch) + " to be a numeric value");
									}
								});
								return attrSearch;
							}
						}).value() : _.cloneDeep(originalQuery);
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

				}, {
					key: "insertOne",
					value: function insertOne(table, entity) {
						return this.insertMany(table, [entity]).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
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

				}, {
					key: "insertMany",
					value: function insertMany(table, entities) {
						var _this5 = this;

						return Promise.mapSeries(entities, function (entity) {
							return _this5.insertOne(table, entity || {});
						});
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

				}, {
					key: "findOne",
					value: function findOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options.limit = 1;
						return this.findMany(table, queryFind, options).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
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

				}, {
					key: "findMany",
					value: function findMany(table, queryFind) {
						var _this6 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var foundEntities = [];
						options = this.normalizeOptions(options);
						var foundCount = 0;
						var origSkip = options.skip;

						// We are going to loop until we find enough items
						var loopFind = function loopFind(found) {
							// If the search returned nothing, then just finish the findMany
							if (_.isNil(found)) {
								return Promise.resolve(foundEntities);
								// Else, if this is a value and not the initial `true`, add it to the list
							} else if (found !== true) {
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
							return _this6.findOne(table, queryFind, options).then(loopFind);
						};
						return loopFind(true);
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

				}, {
					key: "updateOne",
					value: function updateOne(table, queryFind, update) {
						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						options.limit = 1;
						return this.updateMany(table, queryFind, update, options).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
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

				}, {
					key: "updateMany",
					value: function updateMany(table, queryFind, update) {
						var _this7 = this;

						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						var foundEntities = [];
						var skip = 0;

						// We are going to loop until we find enough items
						var loopFind = function loopFind(found) {
							// If the search returned nothing, then just finish the findMany
							if (_.isNil(found)) {
								return Promise.resolve(foundEntities);
								// Else, if this is a value and not the initial `true`, add it to the list
							} else if (found !== true) {
								foundEntities.push(found);
							}
							// If we found enough items, return them
							if (skip === options.limit) {
								return Promise.resolve(foundEntities);
							}
							options.skip = skip;
							// Next time we'll skip 1 more item
							skip++;
							// Do the query & loop
							return _this7.updateOne(table, queryFind, update, options).then(loopFind);
						};
						return loopFind(true);
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

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options.limit = 1;
						return this.deleteMany(table, queryFind, options);
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

				}, {
					key: "deleteMany",
					value: function deleteMany(table, queryFind) {
						var _this8 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var count = 0;

						// We are going to loop until we find enough items
						var loopFind = function loopFind() {
							// First, search for the item.
							return _this8.findOne(table, queryFind, options).then(function (found) {
								// If the search returned nothing, then just finish the findMany
								if (_.isNil(found)) {
									return Promise.resolve();
									// Else, if this is a value and not the initial `true`, add it to the list
								}
								// If we found enough items, return them
								if (count === options.limit) {
									return Promise.resolve();
								}
								// Increase our counter
								count++;
								// Do the deletion & loop
								return _this8.deleteOne(table, queryFind, options).then(loopFind);
							});
						};
						return loopFind(true);
					}
				}]);

				return DiasporaAdapter;
			}(SequentialEvent);

			module.exports = DiasporaAdapter;
		}, { "../dependencies": 8 }], 3: [function (require, module, exports) {
			(function (global) {
				'use strict';

				var _require2 = require('../dependencies'),
				    _ = _require2._,
				    Promise = _require2.Promise;

				var DiasporaAdapter = require('./baseAdapter.js');
				var InMemoryEntity = require('../dataStoreEntities/inMemoryEntity.js');

				/**
     * This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS.
     * 
     * @extends Adapters.DiasporaAdapter
     * @memberof Adapters
     */

				var InMemoryDiasporaAdapter = function (_DiasporaAdapter) {
					_inherits(InMemoryDiasporaAdapter, _DiasporaAdapter);

					/**
      * Create a new instance of in memory adapter.
      * 
      * @author gerkin
      */
					function InMemoryDiasporaAdapter() {
						_classCallCheck(this, InMemoryDiasporaAdapter);

						var _this9 = _possibleConstructorReturn(this, (InMemoryDiasporaAdapter.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter)).call(this, InMemoryEntity));
						/**
       * Link to the InMemoryEntity.
       * 
       * @name classEntity
       * @type {DataStoreEntities.InMemoryEntity}
       * @memberof Adapters.InMemoryDiasporaAdapter
       * @instance
       * @author Gerkin
       */


						_this9.state = 'ready';
						/**
       * Plain old javascript object used as data store.
       * 
       * @author Gerkin
       */
						_this9.store = {};
						return _this9;
					}

					/**
      * Create the data store and call {@link Adapters.DiasporaAdapter#configureCollection}.
      * 
      * @author gerkin
      * @param   {string} tableName - Name of the table (usually, model name).
      * @param   {Object} remaps    - Associative hash that links entity field names with data source field names.
      * @returns {undefined} This function does not return anything.
      */


					_createClass(InMemoryDiasporaAdapter, [{
						key: "configureCollection",
						value: function configureCollection(tableName, remaps) {
							_get(InMemoryDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter.prototype), "configureCollection", this).call(this, tableName, remaps);
							this.ensureCollectionExists(tableName);
						}

						// -----
						// ### Utils

						/**
       * Create a new unique id for this store's entity.
       * 
       * @author gerkin
       * @returns {string} Generated unique id.
       */

					}, {
						key: "generateUUID",
						value: function generateUUID() {
							var d = new Date().getTime();
							// Use high-precision timer if available
							if (global.performance && 'function' === typeof global.performance.now) {
								d += global.performance.now();
							}
							var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
								var r = (d + Math.random() * 16) % 16 | 0;
								d = Math.floor(d / 16);
								return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
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

					}, {
						key: "ensureCollectionExists",
						value: function ensureCollectionExists(table) {
							if (this.store.hasOwnProperty(table)) {
								return this.store[table];
							} else {
								return this.store[table] = {
									items: []
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

					}, {
						key: "insertOne",


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
						value: function insertOne(table, entity) {
							entity = _.cloneDeep(entity);
							var storeTable = this.ensureCollectionExists(table);
							entity.id = this.generateUUID();
							this.setIdHash(entity);
							storeTable.items.push(entity);
							return Promise.resolve(new this.classEntity(entity, this));
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

					}, {
						key: "findOne",
						value: function findOne(table, queryFind) {
							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							var storeTable = this.ensureCollectionExists(table);
							var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
							var reducedMatches = this.constructor.applyOptionsToSet(matches, options);
							return Promise.resolve(reducedMatches.length > 0 ? new this.classEntity(_.first(reducedMatches), this) : undefined);
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

					}, {
						key: "findMany",
						value: function findMany(table, queryFind) {
							var _this10 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							var storeTable = this.ensureCollectionExists(table);
							var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
							var reducedMatches = this.constructor.applyOptionsToSet(matches, options);
							return Promise.resolve(_.map(reducedMatches, function (entity) {
								return new _this10.classEntity(entity, _this10);
							}));
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

					}, {
						key: "updateOne",
						value: function updateOne(table, queryFind, update) {
							var _this11 = this;

							var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

							return this.findOne(table, queryFind, options).then(function (found) {
								if (!_.isNil(found)) {
									var storeTable = _this11.ensureCollectionExists(table);
									var match = _.find(storeTable.items, {
										id: found.id
									});
									_this11.applyUpdateEntity(update, match);
									return Promise.resolve(new _this11.classEntity(match, _this11));
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

					}, {
						key: "updateMany",
						value: function updateMany(table, queryFind, update) {
							var _this12 = this;

							var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

							return this.findMany(table, queryFind, options).then(function (found) {
								if (!_.isNil(found) && found.length > 0) {
									var storeTable = _this12.ensureCollectionExists(table);
									var foundIds = _.map(found, 'id');
									var matches = _.filter(storeTable.items, function (item) {
										return -1 !== foundIds.indexOf(item.id);
									});
									return Promise.resolve(_.map(matches, function (item) {
										_this12.applyUpdateEntity(update, item);
										return new _this12.classEntity(item, _this12);
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

					}, {
						key: "deleteOne",
						value: function deleteOne(table, queryFind) {
							var _this13 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							var storeTable = this.ensureCollectionExists(table);
							return this.findOne(table, queryFind, options).then(function (entityToDelete) {
								storeTable.items = _.reject(storeTable.items, function (entity) {
									return entity.id === entityToDelete.idHash[_this13.name];
								});
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

					}, {
						key: "deleteMany",
						value: function deleteMany(table, queryFind) {
							var _this14 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							var storeTable = this.ensureCollectionExists(table);
							return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
								var entitiesIds = _.map(entitiesToDelete, function (entity) {
									return _.get(entity, "idHash." + _this14.name);
								});
								storeTable.items = _.reject(storeTable.items, function (entity) {
									return _.includes(entitiesIds, entity.id);
								});
								return Promise.resolve();
							});
						}
					}], [{
						key: "applyOptionsToSet",
						value: function applyOptionsToSet(set, options) {
							_.defaults(options, {
								limit: Infinity,
								skip: 0
							});
							set = set.slice(options.skip);
							if (set.length > options.limit) {
								set = set.slice(0, options.limit);
							}
							return set;
						}
					}]);

					return InMemoryDiasporaAdapter;
				}(DiasporaAdapter);

				module.exports = InMemoryDiasporaAdapter;
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "../dataStoreEntities/inMemoryEntity.js": 6, "../dependencies": 8, "./baseAdapter.js": 2 }], 4: [function (require, module, exports) {
			(function (global) {
				'use strict';

				var _require3 = require('../dependencies'),
				    _ = _require3._,
				    Promise = _require3.Promise;

				var DiasporaAdapter = require('./baseAdapter.js');
				var WebStorageEntity = require('../dataStoreEntities/webStorageEntity.js');

				/**
     * This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser.
     * 
     * @extends Adapters.DiasporaAdapter
     * @memberof Adapters
     */

				var WebStorageDiasporaAdapter = function (_DiasporaAdapter2) {
					_inherits(WebStorageDiasporaAdapter, _DiasporaAdapter2);

					/**
      * Create a new instance of local storage adapter.
      * 
      * @author gerkin
      * @param {Object}  config                 - Configuration object.
      * @param {boolean} [config.session=false] - Set to true to use sessionStorage instead of localStorage.
      */
					function WebStorageDiasporaAdapter(config) {
						_classCallCheck(this, WebStorageDiasporaAdapter);

						var _this15 = _possibleConstructorReturn(this, (WebStorageDiasporaAdapter.__proto__ || Object.getPrototypeOf(WebStorageDiasporaAdapter)).call(this, WebStorageEntity));
						/**
       * Link to the WebStorageEntity.
       * 
       * @name classEntity
       * @type {DataStoreEntities.WebStorageEntity}
       * @memberof Adapters.WebStorageDiasporaAdapter
       * @instance
       * @author Gerkin
       */


						_.defaults(config, {
							session: false
						});
						_this15.state = 'ready';
						/**
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/Storage Storage api} where to store data.
       * 
       * @type {Storage}
       * @author Gerkin
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage localStorage} and {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage sessionStorage} on MDN web docs.
       * @see {@link Adapters.WebStorageDiasporaAdapter}:config.session parameter.
       */
						_this15.source = true === config.session ? global.sessionStorage : global.localStorage;
						return _this15;
					}

					/**
      * Create the collection index and call {@link Adapters.DiasporaAdapter#configureCollection}.
      * 
      * @author gerkin
      * @param {string} tableName - Name of the table (usually, model name).
      * @param {Object} remaps    - Associative hash that links entity field names with data source field names.
      * @returns {undefined} This function does not return anything.
      */


					_createClass(WebStorageDiasporaAdapter, [{
						key: "configureCollection",
						value: function configureCollection(tableName, remaps) {
							_get(WebStorageDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(WebStorageDiasporaAdapter.prototype), "configureCollection", this).call(this, tableName, remaps);
							this.ensureCollectionExists(tableName);
						}

						// -----
						// ### Utils

						/**
       * Create a new unique id for this store's entity.
       * 
       * @author gerkin
       * @returns {string} Generated unique id.
       */

					}, {
						key: "generateUUID",
						value: function generateUUID() {
							var d = new Date().getTime();
							if (global.performance && 'function' === typeof global.performance.now) {
								d += global.performance.now(); //use high-precision timer if available
							}
							var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
								var r = (d + Math.random() * 16) % 16 | 0;
								d = Math.floor(d / 16);
								return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
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

					}, {
						key: "ensureCollectionExists",
						value: function ensureCollectionExists(table) {
							var index = this.source.getItem(table);
							if (_.isNil(index)) {
								index = [];
								this.source.setItem(table, JSON.stringify(index));
							} else {
								index = JSON.parse(index);
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

					}, {
						key: "getItemName",


						/**
       * Deduce the item name from table name and item ID.
       * 
       * @author gerkin
       * @param   {string} table - Name of the table to construct name for.
       * @param   {string} id    - Id of the item to find.
       * @returns {string} Name of the item.
       */
						value: function getItemName(table, id) {
							return table + ".id=" + id;
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

					}, {
						key: "insertOne",
						value: function insertOne(table, entity) {
							entity = _.cloneDeep(entity || {});
							entity.id = this.generateUUID();
							this.setIdHash(entity);
							try {
								var tableIndex = this.ensureCollectionExists(table);
								tableIndex.push(entity.id);
								this.source.setItem(table, JSON.stringify(tableIndex));
								this.source.setItem(this.getItemName(table, entity.id), JSON.stringify(entity));
							} catch (error) {
								return Promise.reject(error);
							}
							return Promise.resolve(new this.classEntity(entity, this));
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

					}, {
						key: "insertMany",
						value: function insertMany(table, entities) {
							var _this16 = this;

							entities = _.cloneDeep(entities);
							try {
								var tableIndex = this.ensureCollectionExists(table);
								entities = entities.map(function () {
									var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

									entity.id = _this16.generateUUID();
									_this16.setIdHash(entity);
									tableIndex.push(entity.id);
									_this16.source.setItem(_this16.getItemName(table, entity.id), JSON.stringify(entity));
									return new _this16.classEntity(entity, _this16);
								});
								this.source.setItem(table, JSON.stringify(tableIndex));
							} catch (error) {
								return Promise.reject(error);
							}
							return Promise.resolve(entities);
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

					}, {
						key: "findOneById",
						value: function findOneById(table, id) {
							var item = this.source.getItem(this.getItemName(table, id));
							if (!_.isNil(item)) {
								return Promise.resolve(new this.classEntity(JSON.parse(item), this));
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

					}, {
						key: "findOne",
						value: function findOne(table, queryFind) {
							var _this17 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							_.defaults(options, {
								skip: 0
							});
							if (!_.isObject(queryFind)) {
								return this.findOneById(table, queryFind);
							} else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
								return this.findOneById(table, queryFind.id.$equal);
							}
							var items = this.ensureCollectionExists(table);
							var returnedItem = void 0;
							var matched = 0;
							_.each(items, function (itemId) {
								var item = JSON.parse(_this17.source.getItem(_this17.getItemName(table, itemId)));
								if (_this17.matchEntity(queryFind, item)) {
									matched++;
									// If we matched enough items
									if (matched > options.skip) {
										returnedItem = item;
										return false;
									}
								}
							});
							return Promise.resolve(!_.isNil(returnedItem) ? new this.classEntity(returnedItem, this) : undefined);
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

					}, {
						key: "updateOne",
						value: function updateOne(table, queryFind, update, options) {
							var _this18 = this;

							_.defaults(options, {
								skip: 0
							});
							return this.findOne(table, queryFind, options).then(function (entity) {
								if (_.isNil(entity)) {
									return Promise.resolve();
								}
								_this18.applyUpdateEntity(update, entity);
								try {
									_this18.source.setItem(_this18.getItemName(table, entity.id), JSON.stringify(entity));
									return Promise.resolve(entity);
								} catch (error) {
									return Promise.reject(error);
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

					}, {
						key: "deleteOne",
						value: function deleteOne(table, queryFind) {
							var _this19 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							return this.findOne(table, queryFind, options).then(function (entityToDelete) {
								try {
									var tableIndex = _this19.ensureCollectionExists(table);
									_.pull(tableIndex, entityToDelete.id);
									_this19.source.setItem(table, JSON.stringify(tableIndex));
									_this19.source.removeItem(_this19.getItemName(table, entityToDelete.id));
								} catch (error) {
									return Promise.reject(error);
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

					}, {
						key: "deleteMany",
						value: function deleteMany(table, queryFind) {
							var _this20 = this;

							var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

							try {
								return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
									var tableIndex = _this20.ensureCollectionExists(table);
									_.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));
									_this20.source.setItem(table, JSON.stringify(tableIndex));
									_.forEach(entitiesToDelete, function (entityToDelete) {
										_this20.source.removeItem(_this20.getItemName(table, entityToDelete.id));
									});
									return Promise.resolve();
								});
							} catch (error) {
								return Promise.reject(error);
							}
						}
					}], [{
						key: "applyOptionsToSet",
						value: function applyOptionsToSet(set, options) {
							_.defaults(options, {
								limit: Infinity,
								skip: 0
							});
							set = set.slice(options.skip);
							if (set.length > options.limit) {
								set = set.slice(0, options.limit);
							}
							return set;
						}
					}]);

					return WebStorageDiasporaAdapter;
				}(DiasporaAdapter);

				module.exports = WebStorageDiasporaAdapter;
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "../dataStoreEntities/webStorageEntity.js": 7, "../dependencies": 8, "./baseAdapter.js": 2 }], 5: [function (require, module, exports) {
			'use strict';

			var _require4 = require('../dependencies'),
			    _ = _require4._;

			/**
    * @namespace DataStoreEntities
    */

			/**
    * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
    * @memberof DataStoreEntities
    */


			var DataStoreEntity = function () {
				/**
     * Construct a new data source entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function DataStoreEntity(entity, dataSource) {
					_classCallCheck(this, DataStoreEntity);

					if (_.isNil(entity)) {
						return undefined;
					}
					if (_.isNil(dataSource)) {
						throw new TypeError("Expect 2nd argument to be the parent of this entity, have \"" + dataSource + "\"");
					}
					Object.defineProperties(this, {
						dataSource: {
							value: dataSource,
							enumerable: false,
							configurable: false
						}
					});
					_.assign(this, entity);
				}

				/**
     * Returns a plain object corresponding to this entity attributes.
     * 
     * @author gerkin
     * @returns {Object} Plain object representing this entity.
     */


				_createClass(DataStoreEntity, [{
					key: "toObject",
					value: function toObject() {
						return _.omit(this, ['dataSource', 'id']);
					}
				}]);

				return DataStoreEntity;
			}();

			module.exports = DataStoreEntity;
		}, { "../dependencies": 8 }], 6: [function (require, module, exports) {
			'use strict';

			var DataStoreEntity = require('./baseEntity.js');

			/**
    * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
    * @extends DataStoreEntities.DataStoreEntity
    * @memberof DataStoreEntities
    */

			var InMemoryEntity = function (_DataStoreEntity) {
				_inherits(InMemoryEntity, _DataStoreEntity);

				/**
     * Construct a in memory entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function InMemoryEntity(entity, dataSource) {
					_classCallCheck(this, InMemoryEntity);

					return _possibleConstructorReturn(this, (InMemoryEntity.__proto__ || Object.getPrototypeOf(InMemoryEntity)).call(this, entity, dataSource));
				}

				return InMemoryEntity;
			}(DataStoreEntity);

			module.exports = InMemoryEntity;
		}, { "./baseEntity.js": 5 }], 7: [function (require, module, exports) {
			'use strict';

			var DataStoreEntity = require('./baseEntity.js');

			/**
    * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
    * 
    * @extends DataStoreEntities.DataStoreEntity
    * @memberof DataStoreEntities
    */

			var WebStorageEntity = function (_DataStoreEntity2) {
				_inherits(WebStorageEntity, _DataStoreEntity2);

				/**
     * Construct a local storage entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
				function WebStorageEntity(entity, dataSource) {
					_classCallCheck(this, WebStorageEntity);

					return _possibleConstructorReturn(this, (WebStorageEntity.__proto__ || Object.getPrototypeOf(WebStorageEntity)).call(this, entity, dataSource));
				}

				return WebStorageEntity;
			}(DataStoreEntity);

			module.exports = WebStorageEntity;
		}, { "./baseEntity.js": 5 }], 8: [function (require, module, exports) {
			(function (global) {
				'use strict';

				module.exports = {
					_: function () {
						return global._ || require('lodash');
					}(),
					SequentialEvent: function () {
						return global.SequentialEvent || require('sequential-event');
					}(),
					Promise: function () {
						return global.Promise && global.Promise.version ? global.Promise : require('bluebird');
					}()
				};
			}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		}, { "bluebird": undefined, "lodash": undefined, "sequential-event": undefined }], 9: [function (require, module, exports) {
			(function (process) {
				'use strict';

				var dependencies = require('./dependencies');
				var _ = dependencies._,
				    Promise = dependencies.Promise;

				/**
     * Event emitter that can execute async handlers in sequence
     *
     * @typedef {Object} SequentialEvent
     * @author Gerkin
     * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
     */

				var logger = function () {
					if (!process.browser) {
						var winston = require('winston');
						var log = winston.createLogger({
							level: 'silly',
							format: winston.format.json(),
							transports: [
								//
								// - Write to all logs with level `info` and below to `combined.log`
								// - Write all logs error (and below) to `error.log`.
								//
							]
						});

						//
						// If we're not in production then log to the `console` with the format:
						// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
						//
						if (process.env.NODE_ENV !== 'production') {
							log.add(new winston.transports.Console({
								format: winston.format.simple()
							}));
						}
						return log;
					} else {
						return console;
					}
				}();

				var adapters = {};
				var dataSources = {};
				var models = {};

				var wrapDataSourceAction = function wrapDataSourceAction(callback, queryType, adapter) {
					return function (table) {
						for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
							args[_key - 1] = arguments[_key];
						}

						// Filter our results
						var filterResults = function filterResults(entity) {
							// Remap fields
							entity = adapter.remapFields(table, entity, true);
							// Force results to be class instances
							if (!(entity instanceof adapter.classEntity) && !_.isNil(entity)) {
								return new adapter.classEntity(entity, adapter);
							}
							return entity;
						};

						// Transform arguments for find, update & delete
						var optIndex = false;
						var upd = false;
						if (['find', 'delete'].indexOf(queryType.query) >= 0) {
							// For find & delete, options are 3rd argument (so 2nd item in `args`)
							optIndex = 1;
						} else if ('update' === queryType.query) {
							// For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
							optIndex = 2;
							upd = true;
						}
						try {
							//console.log('Before query transformed', args[0]);
							if (false !== optIndex) {
								// Options to canonical
								args[optIndex] = adapter.normalizeOptions(args[optIndex]);
								// Remap input objects
								if (true === args[optIndex].remapInput) {
									args[0] = adapter.remapFields(table, args[0], false);

									if (true === upd) {
										args[1] = adapter.remapFields(table, args[1], false);
									}
								}
								// Query search to cannonical
								args[0] = adapter.normalizeQuery(args[0], args[optIndex]);
								args[optIndex].remapInput = false;
							} else if ('insert' === queryType.query) {
								// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
								if ('many' === queryType.number) {
									// If inserting *several* entities, map the array to remap each entity objects...
									args[0] = _.map(args[0], function (insertion) {
										return adapter.remapFields(table, insertion, false);
									});
								} else {
									// ... or we are inserting a *single* one. We still need to remap entity.
									args[0] = adapter.remapFields(table, args[0], false);
								}
							}
							//console.log('Query transformed:', args[0]);
						} catch (err) {
							return Promise.reject(err);
						}

						// Hook after promise resolution
						var queryPromise = callback.call.apply(callback, [adapter, table].concat(args));
						return queryPromise.then(function (results) {
							if (_.isArrayLike(results)) {
								results = _.map(results, filterResults);
							} else if (!_.isNil(results)) {
								results = filterResults(results);
							}
							return Promise.resolve(results);
						});
					};
				};

				/**
     * Diaspora main namespace
     * @namespace Diaspora
     * @public
     * @author gerkin
     */
				var Diaspora = {
					/**
      * Check if the value matches the field description provided, thus verify if it is valid.
      *
      * @author gerkin
      * @param   {Object}                               entity    - Entity to check.
      * @param   {module:ModelExtension.ModelPrototype} modelDesc - Model description.
      * @returns {Error[]} Array of errors.
      */
					check: function check(entity) {
						var _this23 = this;

						var modelDesc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

						// Apply method `checkField` on each field described
						var checkResults = _(modelDesc).mapValues(function (fieldDesc, field) {
							return _this23.checkField.call(_this23, entity[field], fieldDesc, _.concat([], [field]));
						}).omitBy(_.isEmpty).value();
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
					checkField: function checkField(value, fieldDesc, keys) {
						var _this24 = this;

						if (!_.isObject(fieldDesc)) {
							return;
						}
						_.defaults(fieldDesc, {
							required: false
						});

						var error = {};

						// It the field has a `validate` property, try to use it
						if (fieldDesc.validate) {
							if (!fieldDesc.validate.call(this, value, fieldDesc)) {
								error.validate = keys.join('.') + " custom validation failed";
							}
						}

						// Check the type and the required status
						if (!_.isNil(fieldDesc.type) && !_.isNil(fieldDesc.model)) {
							error.spec = keys.join('.') + " spec can't have both a type and a model";
							// Apply the `required` modifier
						} else if (true === fieldDesc.required && _.isNil(value)) {
							error.required = keys.join('.') + " is a required property of type \"" + fieldDesc.type + "\"";
						} else if (!_.isNil(value)) {
							if (_.isString(fieldDesc.type)) {
								switch (fieldDesc.type) {
									case 'string':
										{
											if (!_.isString(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											}
										}break;

									case 'integer':
										{
											if (!_.isInteger(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											}
										}break;

									case 'float':
										{
											if (!_.isNumber(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											}
										}break;

									case 'date':
										{
											if (!_.isDate(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											}
										}break;

									case 'object':
										{
											if (!_.isObject(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											} else {
												var deepTest = _.isObject(fieldDesc.attributes) ? _(value).mapValues(function (propVal, propName) {
													return _this24.checkField(propVal, fieldDesc.attributes[propName], _.concat(keys, [propName]));
												}).omitBy(_.isEmpty).value() : {};
												if (!_.isEmpty(deepTest)) {
													error.children = deepTest;
												}
											}
										}break;

									case 'array':
										{
											if (!_.isArray(value)) {
												error.type = keys.join('.') + " expected to be a \"" + fieldDesc.type + "\"";
											} else {
												var _deepTest = _.isObject(fieldDesc.of) ? _(value).map(function (propVal, propName) {
													if (_.isArrayLike(fieldDesc.of)) {
														var subErrors = _(fieldDesc.of).map(function (desc) {
															return _this24.checkField(propVal, desc, _.concat(keys, [propName]));
														});
														if (!_.find(subErrors, function (v) {
															return 0 === v.length;
														})) {
															return subErrors;
														}
													} else {
														return _this24.checkField(propVal, fieldDesc.of, _.concat(keys, [propName]));
													}
												}).omitBy(_.isEmpty).value() : {};
												if (!_.isEmpty(_deepTest)) {
													error.children = _deepTest;
												}
											}
										}break;

									case 'any':
										{
											if (!_.stubTrue(value)) {
												error.type = keys.join('.') + " expected to be assigned with any type";
											}
										}break;

									default:
										{
											error.type = keys.join('.') + " requires to be unhandled type \"" + fieldDesc.type + "\"";
										}break;
								}
							} else {
								error.spec = keys.join('.') + " spec \"type\" must be a string";
							}
						}

						// Check enum values
						if (!_.isNil(fieldDesc.enum)) {
							var result = _.some(fieldDesc.enum, function (enumVal) {
								if (enumVal instanceof RegExp) {
									return null !== value.match(enumVal);
								} else {
									return value === enumVal;
								}
							});
							if (false === result) {
								error.enum = keys.join('.') + " expected to have one of enumerated values \"" + JSON.stringify(fieldDesc.enum) + "\"";
							}
						}
						if (!_.isEmpty(error)) {
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
					default: function _default(entity, modelDesc) {
						var _this25 = this;

						// Apply method `defaultField` on each field described
						return _.defaults(entity, _.mapValues(modelDesc, function (fieldDesc, field) {
							return _this25.defaultField(entity[field], fieldDesc);
						}));
					},


					/**
      * Set the default on a single field according to its description.
      *
      * @author gerkin
      * @param   {Any}             value     - Value to default.
      * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
      * @returns {Any} Defaulted value.
      */
					defaultField: function defaultField(value, fieldDesc) {
						var out = void 0;
						if (!_.isUndefined(value)) {
							out = value;
						} else {
							out = _.isFunction(fieldDesc.default) ? fieldDesc.default() : fieldDesc.default;
						}
						if ('object' === fieldDesc.type && _.isObject(fieldDesc.attributes) && _.keys(fieldDesc.attributes).length > 0 && !_.isNil(out)) {
							return this.default(out, fieldDesc.attributes);
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
					createDataSource: function createDataSource(adapterLabel, config) {
						if (!adapters.hasOwnProperty(adapterLabel)) {
							throw new Error("Unknown adapter \"" + adapterLabel + "\". Available currently are " + Object.keys(adapters).join(', '));
						}
						var baseAdapter = new adapters[adapterLabel](config);
						var newDataSource = new Proxy(baseAdapter, {
							get: function get(target, key) {
								// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
								if (_.isString(key)) {
									var method = key.match(/^(find|update|insert|delete)(Many|One)$/);
									if (null !== method) {
										method[2] = method[2].toLowerCase();
										method = _.mapKeys(method.slice(0, 3), function (val, key) {
											return ['full', 'query', 'number'][key];
										});
										return wrapDataSourceAction(target[key], method, target);
									}
								}
								return target[key];
							}
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
					registerDataSource: function registerDataSource(name, dataSource) {
						if (!_.isString(name) && name.length > 0) {
							throw new Error("DataSource name must be a non empty string, had \"" + name + "\"");
						}
						if (dataSources.hasOwnProperty(name)) {
							throw new Error("DataSource name already used, had \"" + name + "\"");
						}
						if (!(dataSource instanceof Diaspora.components.DiasporaAdapter)) {
							throw new Error('DataSource must be an instance inheriting "DiasporaAdapter"');
						}
						dataSource.name = name;
						_.merge(dataSources, _defineProperty({}, name, dataSource));
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
					createNamedDataSource: function createNamedDataSource(sourceName, adapterLabel, configHash) {
						var dataSource = Diaspora.createDataSource(adapterLabel, configHash);
						Diaspora.registerDataSource(sourceName, dataSource);
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
					declareModel: function declareModel(name, modelDesc) {
						if (!_.isString(name) && name.length > 0) {
							throw new Error("DataSource name must be a non empty string, had \"" + name + "\"");
						}
						if (!_.isObject(modelDesc)) {
							throw new Error('"modelDesc" must be an object');
						}
						var model = new Diaspora.components.Model(name, modelDesc);
						_.assign(models, _defineProperty({}, name, model));
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
					registerAdapter: function registerAdapter(label, adapter) {
						if (adapters[label]) {
							throw new Error("Adapter with label \"" + label + "\" already exists.");
						}
						// Check inheritance of adapter
						if (!(adapter.prototype instanceof Diaspora.components.DiasporaAdapter)) {
							throw new TypeError("Trying to register an adapter with label \"" + label + "\", but it does not extends DiasporaAdapter.");
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
					models: models,
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
					dataSources: dataSources,
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
					adapters: adapters,
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
					logger: logger
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
					Entity: require('./entityFactory')(null, {}, null),
					Set: require('./set'),
					Model: require('./model'),
					Errors: {
						EntityValidationError: require('./errors/entityValidationError'),
						SetValidationError: require('./errors/setValidationError'),
						EntityStateError: require('./errors/entityStateError')
					},
					DiasporaAdapter: require('./adapters/baseAdapter'),
					DataStoreEntity: require('./dataStoreEntities/baseEntity')
				};

				// Register available built-in adapters
				Diaspora.registerAdapter('inMemory', require('./adapters/inMemoryAdapter'));
				// Register webStorage only if in browser
				if (process.browser) {
					Diaspora.registerAdapter('webStorage', require('./adapters/webStorageAdapter'));
				}
			}).call(this, require('_process'));
		}, { "./adapters/baseAdapter": 2, "./adapters/inMemoryAdapter": 3, "./adapters/webStorageAdapter": 4, "./dataStoreEntities/baseEntity": 5, "./dependencies": 8, "./entityFactory": 10, "./errors/entityStateError": 11, "./errors/entityValidationError": 12, "./errors/setValidationError": 14, "./model": 15, "./set": 16, "_process": 18, "winston": undefined }], 10: [function (require, module, exports) {
			'use strict';

			var _require5 = require('./dependencies'),
			    _ = _require5._,
			    Promise = _require5.Promise,
			    SequentialEvent = _require5.SequentialEvent;

			var Diaspora = require('./diaspora');
			var DataStoreEntity = require('./dataStoreEntities/baseEntity');
			var EntityValidationError = require('./errors/entityValidationError');
			var EntityStateError = require('./errors/entityStateError');
			var Utils = require('./utils');

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
			function EntityFactory(name, modelDesc, model) {
				var modelAttrsKeys = _.keys(modelDesc.attributes);

				/**
     * The entity is the class you use to manage a single document in all data sources managed by your model.
     * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
     * @summary An entity is a document in the population of all your datas of the same type
     * @extends SequentialEvent
     * @memberof EntityFactory
     */

				var Entity = function (_SequentialEvent2) {
					_inherits(Entity, _SequentialEvent2);

					/**
      * Create a new entity.
      *
      * @author gerkin
      * @param {Object|DataStoreEntities.DataStoreEntity} [source={}] - Hash with properties to copy on the new object.
      *        If provided object inherits DataStoreEntity, the constructed entity is built in `sync` state.
      */
					function Entity() {
						var _ret;

						var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						_classCallCheck(this, Entity);

						// Stores the object state
						var _this26 = _possibleConstructorReturn(this, (Entity.__proto__ || Object.getPrototypeOf(Entity)).call(this));

						var state = 'orphan';
						var lastDataSource = null;
						var dataSources = Object.seal(_.mapValues(model.dataSources, function () {
							return undefined;
						}));

						var entityPrototype = {
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
								value: dataSources
							},
							/**
        * Returns a copy of this entity attributes.
        *
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        * @returns {Object} Attributes of this entity.
        */
							toObject: function toObject() {
								return attributes;
							},
							/**
        * TODO.
        *
        * @name dataSources
        * @readonly
        * @type {TODO}
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        */
							attributes: {
								get: function get() {
									return attributes;
								}
							},
							/**
        * Save this entity in specified data source.
        *
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
							persist: function persist(sourceName) {
								var _this27 = this;

								var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

								_.defaults(options, {
									skipEvents: false
								});
								var dataSource = this.constructor.model.getDataSource(sourceName);
								var beforeState = state;
								state = 'syncing';

								// Args are always the same.
								var eventsArgs = [sourceName];
								var promise = void 0;

								// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
								var suffix = 'orphan' === beforeState ? 'Create' : 'Update';
								if (options.skipEvents) {
									promise = Promise.resolve();
								} else {
									promise = this.emit.apply(this, ['beforePersist'].concat(eventsArgs)).then(function () {
										return _this27.emit.apply(_this27, ['beforeValidate'].concat(eventsArgs));
									}).then(function () {
										_this27.validate();
										return _this27.emit.apply(_this27, ['afterValidate'].concat(eventsArgs));
									}).then(function () {
										return _this27.emit.apply(_this27, ["beforePersist" + suffix].concat(eventsArgs));
									});
								}
								return promise.then(function () {
									lastDataSource = dataSource.name;
									// Depending on state, we are going to perform a different operation
									if ('orphan' === beforeState) {
										return dataSource.insertOne(_this27.table(sourceName), _this27.toObject());
									} else {
										return dataSource.updateOne(_this27.table(sourceName), _this27.uidQuery(dataSource), _this27.getDiff(dataSource));
									}
								}).then(function (dataStoreEntity) {
									if (options.skipEvents) {
										return Promise.resolve(dataStoreEntity);
									} else {
										return _this27.emit.apply(_this27, ["afterPersist" + suffix].concat(eventsArgs)).then(function () {
											return _this27.emit.apply(_this27, ['afterPersist'].concat(eventsArgs));
										}).then(function () {
											return Promise.resolve(dataStoreEntity);
										});
									}
								}).then(function (dataStoreEntity) {
									state = 'sync';
									_this27.dataSources[dataSource.name] = dataStoreEntity;
									attributes = dataStoreEntity.toObject();
									return Promise.resolve(_this27);
								});
							},

							/**
        * Reload this entity from specified data source.
        *
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
							fetch: function fetch(sourceName) {
								var _this28 = this;

								var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

								_.defaults(options, {
									skipEvents: false
								});
								var dataSource = this.constructor.model.getDataSource(sourceName);
								var beforeState = state;
								state = 'syncing';
								var promise = void 0;
								if (options.skipEvents) {
									promise = Promise.resolve();
								} else {
									promise = this.emit('beforeFetch', sourceName);
								}
								return promise.then(function () {
									// Depending on state, we are going to perform a different operation
									if ('orphan' === beforeState) {
										return Promise.reject(new EntityStateError('Can\'t fetch an orphan entity.'));
									} else {
										lastDataSource = dataSource.name;
										return dataSource.findOne(_this28.table(sourceName), _this28.uidQuery(dataSource));
									}
								}).then(function (dataStoreEntity) {
									state = 'sync';
									_this28.dataSources[dataSource.name] = dataStoreEntity;
									attributes = dataStoreEntity.toObject();
									if (options.skipEvents) {
										return Promise.resolve(_this28);
									} else {
										return _this28.emit('afterFetch', sourceName).then(function () {
											return Promise.resolve(_this28);
										});
									}
								});
							},

							/**
        * Delete this entity from the specified data source.
        *
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
							destroy: function destroy(sourceName) {
								var _this29 = this;

								var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

								_.defaults(options, {
									skipEvents: false
								});
								var dataSource = this.constructor.model.getDataSource(sourceName);
								var beforeState = state;
								state = 'syncing';
								var promise = void 0;
								if (options.skipEvents) {
									promise = Promise.resolve();
								} else {
									promise = this.emit('beforeDestroy', sourceName);
								}
								return promise.then(function () {
									if ('orphan' === beforeState) {
										return Promise.reject(new EntityStateError('Can\'t fetch an orphan entity.'));
									} else {
										lastDataSource = dataSource.name;
										return dataSource.deleteOne(_this29.table(sourceName), _this29.uidQuery(dataSource));
									}
								}).then(function () {
									// If this was our only data source, then go back to orphan state
									if (0 === _.without(model.dataSources, dataSource.name).length) {
										state = 'orphan';
									} else {
										state = 'sync';
										delete attributes.idHash[dataSource.name];
									}
									_this29.dataSources[dataSource.name] = undefined;
									if (options.skipEvents) {
										return Promise.resolve(_this29);
									} else {
										return _this29.emit('afterDestroy', sourceName).then(function () {
											return Promise.resolve(_this29);
										});
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
								get: function get() {
									return state;
								}
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
								get: function get() {
									return lastDataSource;
								}
							},
							/**
        * Generate the query to get this unique entity in the desired data source.
        *
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
        * @returns {Object} Query to find this entity.
        */
							uidQuery: function uidQuery(dataSource) {
								return {
									id: attributes.idHash[dataSource.name]
								};
							},

							/**
        * Return the table of this entity in the specified data source.
        *
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        * @returns {string} Name of the table.
        */
							table: function table() /*sourceName*/{
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
							validate: function validate() {
								var validationErrors = Diaspora.check(attributes, modelDesc.attributes);
								if (!_.isEmpty(validationErrors)) {
									throw new EntityValidationError(validationErrors, 'Validation failed');
								}
							},

							/**
        * Remove all editable properties & replace them with provided object.
        *
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        * @param   {Object} [newContent={}] - Replacement content.
        * @returns {EntityFactory.Entity} Returns `this`.
        */
							replaceAttributes: function replaceAttributes() {
								var newContent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

								newContent.idHash = attributes.idHash;
								attributes = newContent;
								return this;
							},

							/**
        * Generate a diff update query by checking deltas with last source interaction.
        *
        * @memberof EntityFactory.Entity
        * @instance
        * @author gerkin
        * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
        * @returns {Object} Diff query.
        */
							getDiff: function getDiff(dataSource) {
								var dataStoreEntity = this.dataSources[dataSource.name];
								var dataStoreObject = dataStoreEntity.toObject();

								var keys = _(attributes).keys().concat(_.keys(dataStoreObject)).uniq().difference(['idHash']).value();
								var values = _(keys).filter(function (key) {
									return attributes[key] !== dataStoreObject[key];
								}).map(function (key) {
									return attributes[key];
								}).value();
								var diff = _.zipObject(keys, values);
								return diff;
							}
						};

						// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
						if (source instanceof DataStoreEntity) {
							state = 'sync';
							lastDataSource = source.dataSource.name;
							dataSources[lastDataSource] = source;
							source = _.omit(source.toObject(), ['id']);
						}
						// Check keys provided in source
						var sourceDModel = _.difference(source, modelAttrsKeys);
						if (0 !== sourceDModel.length) {
							// Later, add a criteria for schemaless models
							throw new Error("Source has unknown keys: " + JSON.stringify(sourceDModel) + " in " + JSON.stringify(source));
						}
						// Now we know that the source is valid. First, deeply clone to detach object values from entity
						var attributes = _.cloneDeep(source);
						// Free the source
						source = null;
						// Default model attributes with our model desc
						Diaspora.default(attributes, modelDesc.attributes);

						// Bind lifecycle events
						_.forEach(modelDesc.lifecycleEvents, function (eventFunctions, eventName) {
							// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
							_.forEach(_.castArray(eventFunctions), function (eventFunction) {
								_this26.on(eventName, eventFunction);
							});
						});

						// Define getters & setters
						var entityDefined = Utils.defineEnumerableProperties(_this26, entityPrototype);

						return _ret = entityDefined, _possibleConstructorReturn(_this26, _ret);
					}

					return Entity;
				}(SequentialEvent);

				var EntityWrapped = Object.defineProperties(Entity, {
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
						value: name + "Entity",
						writable: false,
						enumerable: true
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
						value: model,
						writable: false,
						enumerable: true
					}
				});

				// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
				// Extend prototype with methods in our model description
				_.forEach(modelDesc.methods, function (methodName, method) {
					Entity.prototype[methodName] = method;
				});
				// Add static methods
				_.forEach(modelDesc.staticMethods, function (staticMethodName, staticMethod) {
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
		}, { "./dataStoreEntities/baseEntity": 5, "./dependencies": 8, "./diaspora": 9, "./errors/entityStateError": 11, "./errors/entityValidationError": 12, "./utils": 17 }], 11: [function (require, module, exports) {
			'use strict';

			var ExtendableError = require('./extendableError');

			/**
    * This class represents an error related to validation.
    * @extends Error
    */

			var EntityStateError = function (_ExtendableError) {
				_inherits(EntityStateError, _ExtendableError);

				/**
     * Construct a new error related to an invalide state of the entity.
     * 
     * @author gerkin
     * @memberof Errors
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
				function EntityStateError() {
					var _ref3;

					_classCallCheck(this, EntityStateError);

					for (var _len2 = arguments.length, errorArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
						errorArgs[_key2] = arguments[_key2];
					}

					return _possibleConstructorReturn(this, (_ref3 = EntityStateError.__proto__ || Object.getPrototypeOf(EntityStateError)).call.apply(_ref3, [this].concat(errorArgs)));
				}

				return EntityStateError;
			}(ExtendableError);

			module.exports = EntityStateError;
		}, { "./extendableError": 13 }], 12: [function (require, module, exports) {
			'use strict';

			var _require6 = require('../dependencies'),
			    _ = _require6._;

			var ExtendableError = require('./extendableError');

			var stringifyValidationObject = function stringifyValidationObject(validationErrors) {
				return _(validationErrors).mapValues(function (error, key) {
					return key + " => " + JSON.stringify(error.value) + "\n* " + _(error).omit(['value']).values().map(_.identity).value();
				}).values().join('\n* ');
			};

			/**
    * This class represents an error related to validation.
    *
    * @extends Error
    * @memberof Errors
    */

			var EntityValidationError = function (_ExtendableError2) {
				_inherits(EntityValidationError, _ExtendableError2);

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
				function EntityValidationError(validationErrors, message) {
					var _ref4;

					_classCallCheck(this, EntityValidationError);

					message += "\n" + stringifyValidationObject(validationErrors);

					for (var _len3 = arguments.length, errorArgs = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
						errorArgs[_key3 - 2] = arguments[_key3];
					}

					var _this31 = _possibleConstructorReturn(this, (_ref4 = EntityValidationError.__proto__ || Object.getPrototypeOf(EntityValidationError)).call.apply(_ref4, [this, message].concat(errorArgs)));

					_this31.validationErrors = validationErrors;
					return _this31;
				}

				return EntityValidationError;
			}(ExtendableError);

			module.exports = EntityValidationError;
		}, { "../dependencies": 8, "./extendableError": 13 }], 13: [function (require, module, exports) {
			'use strict';

			/**
    * @namespace Errors
    */

			/**
    * This class is the base class for custom Diaspora errors
    * @extends Error
    */

			var ExtendableError = function (_Error) {
				_inherits(ExtendableError, _Error);

				/**
     * Construct a new extendable error.
     * 
     * @author gerkin
     * @param {string} message          - Message of this error.
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
				function ExtendableError(message) {
					var _ref5;

					_classCallCheck(this, ExtendableError);

					for (var _len4 = arguments.length, errorArgs = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
						errorArgs[_key4 - 1] = arguments[_key4];
					}

					var _this32 = _possibleConstructorReturn(this, (_ref5 = ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call.apply(_ref5, [this, message].concat(errorArgs)));

					_this32.constructor = _get(ExtendableError.prototype.__proto__ || Object.getPrototypeOf(ExtendableError.prototype), "target", _this32);
					if ('function' === typeof Error.captureStackTrace) {
						Error.captureStackTrace(_this32, _get(ExtendableError.prototype.__proto__ || Object.getPrototypeOf(ExtendableError.prototype), "target", _this32));
					} else {
						_this32.stack = new Error(message).stack;
					}
					return _this32;
				}

				return ExtendableError;
			}(Error);

			module.exports = ExtendableError;
		}, {}], 14: [function (require, module, exports) {
			'use strict';

			var _require7 = require('../dependencies'),
			    _ = _require7._;

			var ExtendableError = require('./extendableError');

			/**
    * This class represents an error related to validation on a set.
    *
    * @extends Error
    * @memberof Errors
    */

			var SetValidationError = function (_ExtendableError3) {
				_inherits(SetValidationError, _ExtendableError3);

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
				function SetValidationError(message, validationErrors) {
					var _ref6;

					_classCallCheck(this, SetValidationError);

					message += "[\n" + _(validationErrors).map(function (error, index) {
						if (_.isNil(error)) {
							return false;
						} else {
							return index + ": " + error.message.replace(/\n/g, '\n	');
						}
					}).filter(_.identity).join(',\n') + "\n]";

					for (var _len5 = arguments.length, errorArgs = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
						errorArgs[_key5 - 2] = arguments[_key5];
					}

					var _this33 = _possibleConstructorReturn(this, (_ref6 = SetValidationError.__proto__ || Object.getPrototypeOf(SetValidationError)).call.apply(_ref6, [this, message].concat(errorArgs)));

					_this33.validationErrors = validationErrors;
					return _this33;
				}

				return SetValidationError;
			}(ExtendableError);

			module.exports = SetValidationError;
		}, { "../dependencies": 8, "./extendableError": 13 }], 15: [function (require, module, exports) {
			'use strict';

			var _require8 = require('./dependencies'),
			    _ = _require8._,
			    Promise = _require8.Promise;

			var EntityFactory = require('./entityFactory');
			var Diaspora = require('./diaspora');
			var Set = require('./set');

			var entityPrototypeProperties = EntityFactory.entityPrototypeProperties;

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

			var Model = function () {
				/**
     * Create a new Model that is allowed to interact with all entities of data sources tables selected.
     * 
     * @author gerkin
     * @param {string}                              name      - Name of the model.
     * @param {ModelConfiguration.ModelDescription} modelDesc - Hash representing the configuration of the model.
     */
				function Model(name, modelDesc) {
					_classCallCheck(this, Model);

					var reservedPropIntersect = _.intersection(entityPrototypeProperties, _.keys(modelDesc.attributes));
					if (0 !== reservedPropIntersect.length) {
						throw new Error(JSON.stringify(reservedPropIntersect) + " is/are reserved property names. To match those column names in data source, please use the data source mapper property");
					}
					if (!modelDesc.hasOwnProperty('sources') || !(_.isArrayLike(modelDesc.sources) || _.isObject(modelDesc.sources))) {
						throw new TypeError("Expect model sources to be either an array or an object, had " + JSON.stringify(modelDesc.sources) + ".");
					}
					// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
					var sourcesNormalized = _.isArrayLike(modelDesc.sources) ? _.zipObject(modelDesc.sources, _.times(modelDesc.sources.length, _.constant({}))) : _.mapValues(modelDesc.sources, function (remap, dataSourceName) {
						if (true === remap) {
							return {};
						} else if (_.isObject(remap)) {
							return remap;
						} else {
							throw new TypeError("Datasource \"" + dataSourceName + "\" value is invalid: expect `true` or a remap hash, but have " + JSON.stringify(remap));
						}
					});
					// List sources required by this model
					var sourceNames = _.keys(sourcesNormalized);
					var scopeAvailableSources = Diaspora.dataSources;
					var modelSources = _.pick(scopeAvailableSources, sourceNames);
					var missingSources = _.difference(sourceNames, _.keys(modelSources));
					if (0 !== missingSources.length) {
						throw new Error("Missing data sources " + missingSources.map(function (v) {
							return "\"" + v + "\"";
						}).join(', '));
					}

					// Now, we are sure that config is valid. We can configure our datasources with model options, and set `this` properties.
					_.forEach(sourcesNormalized, function (remap, sourceName) {
						var sourceConfiguring = modelSources[sourceName];
						sourceConfiguring.configureCollection(name, remap);
					});
					this.dataSources = modelSources;
					this.defaultDataSource = sourceNames[0];
					this.name = name;
					this.entityFactory = EntityFactory(name, modelDesc, this);
				}

				/**
     * Create a new Model that is allowed to interact with all entities of data sources tables selected.
     * 
     * @author gerkin
     * @throws  {Error} Thrown if requested source name does not exists.
     * @param   {string} [sourceName=Model.defaultDataSource] - Name of the source to get. It corresponds to one of the sources you set in {@link Model#modelDesc}.sources.
     * @returns {Adapters.DiasporaAdapter} Source adapter with requested name.
     */


				_createClass(Model, [{
					key: "getDataSource",
					value: function getDataSource(sourceName) {
						if (_.isNil(sourceName)) {
							sourceName = this.defaultDataSource;
						} else if (!this.dataSources.hasOwnProperty(sourceName)) {
							throw new Error("Unknown data source \"" + sourceName + "\" in model \"" + this.name + "\", available are " + _.keys(this.dataSources).map(function (v) {
								return "\"" + v + "\"";
							}).join(', '));
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

				}, {
					key: "spawn",
					value: function spawn(source) {
						var newEntity = new this.entityFactory(source);
						return newEntity;
					}

					/**
      * Create multiple new *orphan* {@link Entity entities}.
      * 
      * @author gerkin
      * @param   {Object[]} sources - Array of objects to copy attributes from.
      * @returns {Set} Set with new *orphan* entities.
      */

				}, {
					key: "spawnMany",
					value: function spawnMany(sources) {
						var _this34 = this;

						return new Set(this, _.map(sources, function (source) {
							return _this34.spawn(source);
						}));
					}

					/**
      * Insert a raw source object in the data store.
      * 
      * @author gerkin
      * @param   {Object} source                                   - Object to copy attributes from.
      * @param   {string} [dataSourceName=Model.defaultDataSource] - Name of the data source to insert in.
      * @returns {Promise} Promise resolved with new *sync* {@link Entity entity}.
      */

				}, {
					key: "insert",
					value: function insert(source, dataSourceName) {
						var _this35 = this;

						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertOne(this.name, source).then(function (entity) {
							return Promise.resolve(new _this35.entityFactory(entity));
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

				}, {
					key: "insertMany",
					value: function insertMany(sources, dataSourceName) {
						var _this36 = this;

						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertMany(this.name, sources).then(function (entities) {
							var newEntities = _.map(entities, function (entity) {
								return new _this36.entityFactory(entity);
							});
							var collection = new Set(_this36, newEntities);
							return Promise.resolve(collection);
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

				}, {
					key: "find",
					value: function find() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						var _this37 = this;

						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						} else if (_.isString(queryFind) && !!_.isNil(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = queryFind;
							queryFind = {};
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.findOne(this.name, queryFind, options).then(function (dataSourceEntity) {
							if (_.isNil(dataSourceEntity)) {
								return Promise.resolve();
							}
							var newEntity = new _this37.entityFactory(dataSourceEntity);
							newEntity.dataSources[dataSource.name] = dataSourceEntity;
							return Promise.resolve(newEntity);
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

				}, {
					key: "findMany",
					value: function findMany() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						var _this38 = this;

						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						} else if (_.isString(queryFind) && !!_.isNil(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = queryFind;
							queryFind = {};
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.findMany(this.name, queryFind, options).then(function (entities) {
							var newEntities = _.map(entities, function (entity) {
								return new _this38.entityFactory(entity);
							});
							var collection = new Set(_this38, newEntities);
							return Promise.resolve(collection);
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

				}, {
					key: "update",
					value: function update(queryFind, _update) {
						var _this39 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
						var dataSourceName = arguments[3];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.updateOne(this.name, queryFind, _update, options).then(function (dataSourceEntity) {
							if (_.isNil(dataSourceEntity)) {
								return Promise.resolve();
							}
							var newEntity = new _this39.entityFactory(dataSourceEntity);
							return Promise.resolve(newEntity);
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

				}, {
					key: "updateMany",
					value: function updateMany(queryFind, update) {
						var _this40 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
						var dataSourceName = arguments[3];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.updateMany(this.name, queryFind, update, options).then(function (entities) {
							var newEntities = _.map(entities, function (entity) {
								return new _this40.entityFactory(entity);
							});
							var collection = new Set(_this40, newEntities);
							return Promise.resolve(collection);
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

				}, {
					key: "delete",
					value: function _delete() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.deleteOne(this.name, queryFind, options);
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

				}, {
					key: "deleteMany",
					value: function deleteMany() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
						var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
						var dataSourceName = arguments[2];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.deleteMany(this.name, queryFind, options);
					}
				}]);

				return Model;
			}();

			module.exports = Model;
		}, { "./dependencies": 8, "./diaspora": 9, "./entityFactory": 10, "./set": 16 }], 16: [function (require, module, exports) {
			'use strict';

			var _require9 = require('./dependencies'),
			    _ = _require9._,
			    Promise = _require9.Promise;

			var Utils = require('./utils');
			var SetValidationError = require('./errors/setValidationError');

			/**
    * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
    */

			var Set = function () {
				/**
     * Create a new set, managing provided `entities` that must be generated from provided `model`.
     *
     * @param {Model}           model    - Model describing entities managed by this set.
     * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
     */
				function Set(model) {
					for (var _len6 = arguments.length, entities = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
						entities[_key6 - 1] = arguments[_key6];
					}

					_classCallCheck(this, Set);

					// Flatten arguments
					entities = _(entities).flatten();
					// Check if each entity is from the expected model
					Set.checkEntitiesFromModel(entities.value(), model);

					var defined = Utils.defineEnumerableProperties(this, {
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
						model: model,
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
						length: {
							get: function get() {
								return this.entities.size();
							}
						}
					});

					return new Proxy(defined, {
						get: function get(target, prop) {
							if (prop in target) {
								return target[prop];
							} else if (prop in target.entities) {
								return target.entities[prop];
							} else if ('string' === typeof prop && prop.match(/^-?\d+$/) && target.entities.nth(parseInt(prop))) {
								return target.entities.nth(parseInt(prop));
							}
						},
						set: function set(target, prop, val) {
							if ('model' === prop) {
								return new Error('Can\'t assign to read-only property "model".');
							} else if ('entities' === prop) {
								Set.checkEntitiesFromModel(val, target.model);
								target.entities = _(val);
							}
						}
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


				_createClass(Set, [{
					key: "persist",


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
					value: function persist(sourceName) {
						var _this41 = this;

						var suffixes = this.entities.map(function (entity) {
							return 'orphan' === entity.state ? 'Create' : 'Update';
						}).value();
						return Promise.all(this.entities.map(function (entity) {
							return entity.emit('beforePersist');
						})).then(function () {
							return Promise.all(_this41.entities.map(function (entity) {
								return entity.emit('beforeValidate');
							}));
						}).then(function () {
							var errors = 0;
							var validationResults = _this41.entities.map(function (entity) {
								try {
									entity.validate();
									return undefined;
								} catch (e) {
									errors++;
									return e;
								}
							}).value();
							if (errors > 0) {
								return Promise.reject(new SetValidationError("Set validation failed for " + errors + " elements (on " + _this41.length + "): ", validationResults));
							} else {
								return Promise.resolve();
							}
						}).then(function () {
							return Promise.all(_this41.entities.map(function (entity) {
								return entity.emit('afterValidate');
							}));
						}).then(function () {
							return Promise.all(_this41.entities.map(function (entity, index) {
								return entity.emit("beforePersist" + suffixes[index]);
							}));
						}).then(function () {
							return Promise.all(_this41.entities.map(function (entity) {
								return entity.persist(sourceName, {
									skipEvents: true
								});
							}));
						}).then(function () {
							return Promise.all(_this41.entities.map(function (entity, index) {
								return entity.emit("afterPersist" + suffixes[index]);
							}));
						}).then(function () {
							return Promise.all(_this41.entities.map(function (entity) {
								return entity.emit('afterPersist');
							}));
						}).then(function () {
							return _this41;
						});
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

				}, {
					key: "fetch",
					value: function fetch(sourceName) {
						var _this42 = this;

						return Promise.all(this.entities.map(function (entity) {
							return entity.emit('beforeFetch');
						})).then(function () {
							return Promise.all(_this42.entities.map(function (entity) {
								return entity.fetch(sourceName, {
									skipEvents: true
								});
							}));
						}).then(function () {
							return Promise.all(_this42.entities.map(function (entity) {
								return entity.emit('afterFetch');
							}));
						}).then(function () {
							return _this42;
						});
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

				}, {
					key: "destroy",
					value: function destroy(sourceName) {
						var _this43 = this;

						return Promise.all(this.entities.map(function (entity) {
							return entity.emit('beforeDestroy');
						})).then(function () {
							return Promise.all(_this43.entities.map(function (entity) {
								return entity.destroy(sourceName, {
									skipEvents: true
								});
							}));
						}).then(function () {
							return Promise.all(_this43.entities.map(function (entity) {
								return entity.emit('afterDestroy');
							}));
						}).then(function () {
							return _this43;
						});
					}

					/**
      * Update all entities in the set with given object.
      *
      * @author gerkin
      * @param   {Object} newData - Attributes to change in each entity of the collection.
      * @returns {Collection} `this`.
      */

				}, {
					key: "update",
					value: function update(newData) {
						this.entities.forEach(function (entity) {
							_.forEach(newData, function (val, key) {
								if (_.isUndefined(val)) {
									delete entity[key];
								} else {
									entity[key] = val;
								}
							});
						});
						return this;
					}

					/**
      * Returns a POJO representation of this set's data.
      *
      * @author gerkin
      * @returns {Object} POJO representation of set & children.
      */

				}, {
					key: "toObject",
					value: function toObject() {
						return this.entities.map(function (entity) {
							return entity.toObject();
						});
					}
				}], [{
					key: "checkEntitiesFromModel",
					value: function checkEntitiesFromModel(entities, model) {
						entities.forEach(function (entity, index) {
							if (entity.constructor.model !== model) {
								throw new TypeError("Provided entity n\xB0" + index + " " + entity + " is not from model " + model + " (" + model.modelName + ")");
							}
						});
					}
				}]);

				return Set;
			}();

			module.exports = Set;
		}, { "./dependencies": 8, "./errors/setValidationError": 14, "./utils": 17 }], 17: [function (require, module, exports) {
			'use strict';

			var _require10 = require('./dependencies'),
			    _ = _require10._;

			module.exports = {
				defineEnumerableProperties: function defineEnumerableProperties(subject, handlers) {
					var remappedHandlers = _.mapValues(handlers, function (handler) {
						if (_.isNil(handler) || 'object' !== (typeof handler === "undefined" ? "undefined" : _typeof(handler)) || Object.getPrototypeOf(handler) !== Object.prototype) {
							handler = {
								value: handler
							};
						}
						var defaults = {
							enumerable: true
						};
						if (!handler.hasOwnProperty('get')) {
							defaults.writable = false;
						}
						_.defaults(handler, defaults);
						return handler;
					});
					return Object.defineProperties(subject, remappedHandlers);
				}
			};
		}, { "./dependencies": 8 }], 18: [function (require, module, exports) {
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
			function defaultClearTimeout() {
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
			})();
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
				} catch (e) {
					try {
						// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
						return cachedSetTimeout.call(null, fun, 0);
					} catch (e) {
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
				} catch (e) {
					try {
						// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
						return cachedClearTimeout.call(null, marker);
					} catch (e) {
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
				while (len) {
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

			process.listeners = function (name) {
				return [];
			};

			process.binding = function (name) {
				throw new Error('process.binding is not supported');
			};

			process.cwd = function () {
				return '/';
			};
			process.chdir = function (dir) {
				throw new Error('process.chdir is not supported');
			};
			process.umask = function () {
				return 0;
			};
		}, {}] }, {}, [1])(1);
});
