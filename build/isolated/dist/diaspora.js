"use strict";

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
		}, { "./lib/diaspora": 8 }], 2: [function (require, module, exports) {
			'use strict';

			var SequentialEvent = require('sequential-event');
			var _ = require('lodash');
			var Promise = require('bluebird');

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
    * @class DiasporaAdapter
    * @classdesc DiasporaAdapter is the base class of adapters. Adapters are components that are in charge to interact with data sources (files, databases, etc etc) with standardized methods. You should not use this class directly: extend this class and re-implement some methods to build an adapter. See the (upcoming) tutorial section.
    * @memberof Adapters
    * @public
    * @author gerkin
    * @param {DataStoreEntity} classEntity Class used to spawn source entities
    */

			var DiasporaAdapter = function (_SequentialEvent) {
				_inherits(DiasporaAdapter, _SequentialEvent);

				function DiasporaAdapter(classEntity) {
					_classCallCheck(this, DiasporaAdapter);

					var _this = _possibleConstructorReturn(this, (DiasporaAdapter.__proto__ || Object.getPrototypeOf(DiasporaAdapter)).call(this));

					_this.remaps = {};
					_this.remapsInverted = {};
					_this.filters = {};
					_this.classEntity = classEntity;
					_this.on('ready', function () {
						_this.state = 'ready';
					}).on('error', function (err) {
						_this.state = 'error';
						_this.error = err;
					});
					return _this;
				}

				_createClass(DiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(tableName, remaps, filters) {
						this.remaps[tableName] = remaps;
						this.remapsInverted[tableName] = _.invert(remaps);
						this.filters = filters || {};
					}

					// -----
					// ### Utils

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
      * @method waitReady
      * @description Returns a promise resolved once adapter state is ready
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured
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
      * @method remapInput
      * @description TODO
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @see TODO remapping
      * @param   {String} table  Name of the table for which we remap
      * @param   {Object} query Hash representing the entity to remap
      * @returns {Object} Remapped object
      */

				}, {
					key: "remapInput",
					value: function remapInput(table, query) {
						var _this3 = this;

						if (_.isNil(query)) {
							return query;
						}
						var filtered = _.mapValues(query, function (value, key) {
							if (_this3.filters.input.hasOwnProperty(key)) {
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
      * @method remapOutput
      * @description TODO
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @see TODO remapping
      * @param   {String} table  Name of the table for which we remap
      * @param   {Object} query Hash representing the entity to remap
      * @returns {Object} Remapped object
      */

				}, {
					key: "remapOutput",
					value: function remapOutput(table, query) {
						var _this4 = this;

						if (_.isNil(query)) {
							return query;
						}
						var filtered = _.mapValues(query, function (value, key) {
							if (_this4.filters.output.hasOwnProperty(key)) {
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
      * Refresh the `idHash` with current adapter's `id` injected
      * @param   {Object}   entity          Object containing attributes of the entity
      * @param   {String} propName = 'id' Name of the `id` field
      * @returns {Object} Modified entity (for chaining)
      */

				}, {
					key: "setIdHash",
					value: function setIdHash(entity) {
						var propName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'id';

						entity.idHash = _.assign({}, entity.idHash, _defineProperty({}, this.name, entity[propName]));
						return entity;
					}

					/**
      * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function
      * @param   {QueryLanguage.SelectQuery} query  Query to match against
      * @param   {Object} entity Entity to test
      * @returns {Boolean}  `true` if query matches, `false` otherwise
      */

				}, {
					key: "matchEntity",
					value: function matchEntity(query, entity) {
						var matchResult = _.every(_.toPairs(query), function (_ref) {
							var _ref2 = _slicedToArray(_ref, 2),
							    key = _ref2[0],
							    desc = _ref2[1];

							if (c.object(desc)) {
								var entityVal = entity[key];
								return _.every(desc, function (val, operation) {
									switch (operation) {
										case '$exists':
											{
												return val === !c.undefined(entityVal);
											}

										case '$equal':
											{
												return !c.undefined(entityVal) && entityVal === val;
											}

										case '$diff':
											{
												return !c.undefined(entityVal) && entityVal !== val;
											}

										case '$less':
											{
												return !c.undefined(entityVal) && entityVal < val;
											}

										case '$lessEqual':
											{
												return !c.undefined(entityVal) && entityVal <= val;
											}

										case '$greater':
											{
												return !c.undefined(entityVal) && entityVal > val;
											}

										case '$greaterEqual':
											{
												return !c.undefined(entityVal) && entityVal >= val;
											}
									}
									return false;
								});
							}
							return false;
						});
						return matchResult;
					}
				}, {
					key: "applyUpdateEntity",
					value: function applyUpdateEntity(update, entity) {
						_.forEach(update, function (val, key) {
							if (c.undefined(val)) {
								delete entity[key];
							} else {
								entity[key] = val;
							}
						});
					}

					/**
      * @method normalizeOptions
      * @description Transform options to their canonical form. This function must be applied before calling adapters' methods
      * @throws {TypeError} Thrown if an option does not have an acceptable type
      * @throws {ReferenceError} Thrown if a required option is not present
      * @throws {Error} Thrown when there isn't more precise description of the error is available (eg. when conflicts occurs) 
      * @param   {Object}   [opts={}] Options to transform
      * @returns {Object} Transformed options (also called `canonical options`)
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
							if (!(c.integer(limitOpt) || Infinity === limitOpt) || limitOpt < 0) {
								throw new TypeError("Expect \"options.limit\" to be an integer equal to or above 0, have " + limitOpt);
							}
							opts.limit = limitOpt;
						}
						if (opts.hasOwnProperty('skip')) {
							var skipOpt = opts.skip;
							if (_.isString(skipOpt)) {
								skipOpt = parseInt(skipOpt);
							}
							if (!c.integer(skipOpt) || skipOpt < 0 || !isFinite(skipOpt)) {
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
							if (!c.integer(pageOpt) || pageOpt < 0) {
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
						var normalizedQuery = true === options.remapInput ? _(_.cloneDeep(originalQuery)).mapValues(function (attrSearch, attrName) {
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
									if (attrSearch.hasOwnProperty(operation) && !c.number(attrSearch[operation])) {
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

				}, {
					key: "insertOne",
					value: function insertOne(table, entity) {
						return this.insertMany(table, [entity]).then(function (entities) {
							return Promise.resolve(_.first(entities));
						});
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
      * @method findOne
      * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
      * @description Retrieve a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `findOne` itself
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @param   {String} table  Name of the table to retrieve data from
      * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
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
      * @method findMany
      * @summary At least one of {@link findOne} or {@link findMany} must be reimplemented by adapter
      * @description Retrieve several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `findMany` itself
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @param   {String} table  Name of the table to retrieve data from
      * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
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
      * @method updateOne
      * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
      * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateOne` itself
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @param   {String} table  Name of the table to retrieve data from
      * @param   {SelectQueryOrCondition} queryFind Hash representing the entity to find
      * @param   {Object} update Object properties to set
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
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
      * @method updateMany
      * @summary At least one of {@link updateOne} or {@link updateMany} must be reimplemented by adapter
      * @description Update several entities from the data store. This function is a default polyfill if the inheriting adapter does not provide `updateMany` itself
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @param   {String} table  Name of the table to retrieve data from
      * @param   {SelectQueryOrCondition} queryFind Hash representing entities to find
      * @param   {Object} update Object properties to set
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
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
      * @method deleteOne
      * @summary At least one of {@link deleteOne} or {@link deleteMany} must be reimplemented by adapter
      * @description Update a single entity from the data store. This function is a default polyfill if the inheriting adapter does not provide `deleteOne` itself
      * @memberof Adapters.DiasporaAdapter
      * @public
      * @instance
      * @author gerkin
      * @param   {String} table  Name of the table to delete data from
      * @param   {SelectQueryOrCondition} queryFind Hash representing the entities to find
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}* `entity`)
      */

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						options.limit = 1;
						return this.deleteMany(table, queryFind, options);
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
      * @param   {SelectQueryOrCondition} queryFind Hash representing the entities to find
      * @param   {QueryOptions} [options={}] Hash of options.
      * @returns {Promise} Promise resolved once item is found. Called with (*{@link DataStoreEntity}[]* `entities`)
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
		}, { "bluebird": "bluebird", "lodash": "lodash", "sequential-event": "sequential-event" }], 3: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');
			var Promise = require('bluebird');
			var DiasporaAdapter = require('./baseAdapter.js');
			var InMemoryEntity = require('../dataStoreEntities/inMemoryEntity.js');

			/**
    * @class InMemoryDiasporaAdapter
    * @classdesc This class is used to use the memory as a data store. Every data you insert are stored in an array contained by this class. This adapter can be used by both the browser & Node.JS
    * @extends Adapters.DiasporaAdapter
    * @description Create a new In Memory data store
    * @memberof Adapters
    * @public
    * @author gerkin
    * @param {Object} [config] Options hash. Currently, this adapter does not have any options
    */

			var InMemoryDiasporaAdapter = function (_DiasporaAdapter) {
				_inherits(InMemoryDiasporaAdapter, _DiasporaAdapter);

				function InMemoryDiasporaAdapter(config) {
					_classCallCheck(this, InMemoryDiasporaAdapter);

					var _this9 = _possibleConstructorReturn(this, (InMemoryDiasporaAdapter.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter)).call(this, InMemoryEntity));

					_this9.state = 'ready';
					_this9.store = {};
					return _this9;
				}

				_createClass(InMemoryDiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(name, remap) {
						_get(InMemoryDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(InMemoryDiasporaAdapter.prototype), "configureCollection", this).call(this, name, remap);
						this.ensureCollectionExists(name);
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

				}, {
					key: "generateUUID",
					value: function generateUUID() {
						var d = new Date().getTime();
						// Use high-precision timer if available
						if ('undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now) {
							d += performance.now();
						}
						var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							var r = (d + Math.random() * 16) % 16 | 0;
							d = Math.floor(d / 16);
							return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
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

				}, {
					key: "insertOne",


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

				}, {
					key: "updateOne",
					value: function updateOne(table, queryFind, update) {
						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						var storeTable = this.ensureCollectionExists(table);
						var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
						var firstMatch = _.first(matches);
						this.applyUpdateEntity(update, firstMatch);
						return Promise.resolve(new this.classEntity(firstMatch));
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

				}, {
					key: "updateMany",
					value: function updateMany(table, queryFind, update) {
						var _this11 = this;

						var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

						var storeTable = this.ensureCollectionExists(table);
						var matches = _.filter(storeTable.items, _.partial(this.matchEntity, queryFind));
						var reducedMatches = this.constructor.applyOptionsToSet(matches, options);
						_.forEach(reducedMatches, function (match) {
							_this11.applyUpdateEntity(update, match);
						});
						return Promise.resolve(_.map(reducedMatches, function (entity) {
							return new _this11.classEntity(entity, _this11);
						}));
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

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var _this12 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						return this.findOne(table, queryFind, options).then(function (entityToDelete) {
							storeTable.items = _.reject(storeTable.items, function (entity) {
								return entity.id === entityToDelete.idHash[_this12.name];
							});
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

				}, {
					key: "deleteMany",
					value: function deleteMany(table, queryFind) {
						var _this13 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						var storeTable = this.ensureCollectionExists(table);
						return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
							var entitiesIds = _.map(entitiesToDelete, function (entity) {
								return _.get(entity, "idHash." + _this13.name);
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
		}, { "../dataStoreEntities/inMemoryEntity.js": 6, "./baseAdapter.js": 2, "bluebird": "bluebird", "lodash": "lodash" }], 4: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');
			var Promise = require('bluebird');
			var DiasporaAdapter = require('./baseAdapter.js');
			var LocalStorageEntity = require('../dataStoreEntities/localStorageEntity.js');

			/**
    * @class LocalStorageDiasporaAdapter
    * @classdesc This class is used to use local storage or session storage as a data store. This adapter should be used only by the browser
    * @extends Adapters.DiasporaAdapter
    * @description Create a new LocalStorage data store
    * @memberof Adapters
    * @public
    * @author gerkin
    * @param {Object} [config] Options hash.
    * @param {Boolean} config.session=false If `false`, data source will use local storage. If `true`, it will use session storage.
    */

			var LocalStorageDiasporaAdapter = function (_DiasporaAdapter2) {
				_inherits(LocalStorageDiasporaAdapter, _DiasporaAdapter2);

				function LocalStorageDiasporaAdapter(config) {
					_classCallCheck(this, LocalStorageDiasporaAdapter);

					var _this14 = _possibleConstructorReturn(this, (LocalStorageDiasporaAdapter.__proto__ || Object.getPrototypeOf(LocalStorageDiasporaAdapter)).call(this, LocalStorageEntity));

					_.defaults(config, {
						session: false
					});
					_this14.state = 'ready';
					_this14.source = true === config.session ? sessionStorage : localStorage;
					return _this14;
				}

				_createClass(LocalStorageDiasporaAdapter, [{
					key: "configureCollection",
					value: function configureCollection(name, remap) {
						_get(LocalStorageDiasporaAdapter.prototype.__proto__ || Object.getPrototypeOf(LocalStorageDiasporaAdapter.prototype), "configureCollection", this).call(this, name, remap);
						this.ensureCollectionExists(name);
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

				}, {
					key: "generateUUID",
					value: function generateUUID() {
						var d = new Date().getTime();
						if ('undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now) {
							d += performance.now(); //use high-precision timer if available
						}
						var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
							var r = (d + Math.random() * 16) % 16 | 0;
							d = Math.floor(d / 16);
							return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
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

				}, {
					key: "getItemName",


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
					value: function getItemName(table, id) {
						return table + ".id=" + id;
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

				}, {
					key: "insertMany",
					value: function insertMany(table, entities) {
						var _this15 = this;

						entities = _.cloneDeep(entities);
						try {
							var tableIndex = this.ensureCollectionExists(table);
							entities = entities.map(function () {
								var entity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
								var i = arguments[1];

								entity.id = _this15.generateUUID();
								_this15.setIdHash(entity);
								tableIndex.push(entity.id);
								_this15.source.setItem(_this15.getItemName(table, entity.id), JSON.stringify(entity));
								return new _this15.classEntity(entity, _this15);
							});
							this.source.setItem(table, JSON.stringify(tableIndex));
						} catch (error) {
							return Promise.reject(error);
						}
						return Promise.resolve(entities);
					}

					// -----
					// ### Find

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

				}, {
					key: "findOne",
					value: function findOne(table, queryFind) {
						var _this16 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						_.defaults(options, {
							skip: 0
						});
						if (!c.object(queryFind)) {
							return this.findOneById(table, queryFind);
						} else if (_.isEqual(_.keys(queryFind), ['id']) && _.isEqual(_.keys(queryFind.id), ['$equal'])) {
							return this.findOneById(table, queryFind.id.$equal);
						}
						var items = this.ensureCollectionExists(table);
						var returnedItem = void 0;
						var matched = 0;
						_.each(items, function (itemId) {
							var item = JSON.parse(_this16.source.getItem(_this16.getItemName(table, itemId)));
							if (_this16.matchEntity(queryFind, item)) {
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

					/*	findMany( table, queryFind, options = {}) {
     	this.ensureCollectionExists( table );
     	const matches = _.filter( storeTable.items, queryFind );
     	const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
     	return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity(entity, this )));
     }*/

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

				}, {
					key: "updateOne",
					value: function updateOne(table, queryFind, update, options) {
						var _this17 = this;

						_.defaults(options, {
							skip: 0
						});
						return this.findOne(table, queryFind, options).then(function (entity) {
							if (_.isNil(entity)) {
								return Promise.resolve();
							}
							_this17.applyUpdateEntity(update, entity);
							try {
								_this17.source.setItem(_this17.getItemName(table, entity.id), JSON.stringify(entity));
								return Promise.resolve(entity);
							} catch (error) {
								return Promise.reject(error);
							}
						});
					}

					/* updateMany( table, queryFind, update, options ) {
     	this.ensureCollectionExists( table );
     	const matches = _.filter( storeTable.items, queryFind );
     	const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
     	_.forEach( reducedMatches, match => {
     		_.assign( match, update );
     	});
     	return Promise.resolve( _.map( reducedMatches, entity => new this.classEntity(entity, this )));
     }*/

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

				}, {
					key: "deleteOne",
					value: function deleteOne(table, queryFind) {
						var _this18 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						return this.findOne(table, queryFind, options).then(function (entityToDelete) {
							try {
								var tableIndex = _this18.ensureCollectionExists(table);
								_.pull(tableIndex, entityToDelete.id);
								_this18.source.setItem(table, JSON.stringify(tableIndex));
								_this18.source.removeItem(_this18.getItemName(table, entityToDelete.id));
							} catch (error) {
								return Promise.reject(error);
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

				}, {
					key: "deleteMany",
					value: function deleteMany(table, queryFind) {
						var _this19 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

						try {
							return this.findMany(table, queryFind, options).then(function (entitiesToDelete) {
								var tableIndex = _this19.ensureCollectionExists(table);
								_.pullAll(tableIndex, _.map(entitiesToDelete, 'id'));
								_this19.source.setItem(table, JSON.stringify(tableIndex));
								_.forEach(entitiesToDelete, function (entityToDelete) {
									_this19.source.removeItem(_this19.getItemName(table, entityToDelete.id));
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
						if (options.hasOwnProperty('limit')) {
							if (c.integer(options.limit)) {
								set = set.slice(0, options.limit);
							} else {
								ModelExtension.log.warn("Trying to apply a non-integer limit \"" + options.limit + "\".");
							}
						}
						return set;
					}
				}]);

				return LocalStorageDiasporaAdapter;
			}(DiasporaAdapter);

			module.exports = LocalStorageDiasporaAdapter;
		}, { "../dataStoreEntities/localStorageEntity.js": 7, "./baseAdapter.js": 2, "bluebird": "bluebird", "lodash": "lodash" }], 5: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');

			/**
    * @namespace DataStoreEntities
    */

			/**
    * @class DataStoreEntity
    * @classdesc DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself
    * @memberof DataStoreEntities
    * @public
    * @author gerkin
    * @param {Object} source Hash containing properties to copy in this entity
    */

			var DataStoreEntity = function () {
				function DataStoreEntity(entity, dataSource) {
					_classCallCheck(this, DataStoreEntity);

					if (_.isNil(entity)) {
						return undefined;
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

				_createClass(DataStoreEntity, [{
					key: "toObject",
					value: function toObject() {
						return _.omit(this, ['dataSource', 'id']);
					}
				}]);

				return DataStoreEntity;
			}();

			module.exports = DataStoreEntity;
		}, { "lodash": "lodash" }], 6: [function (require, module, exports) {
			'use strict';

			var DataStoreEntity = require('./baseEntity.js');

			/**
    * @class InMemoryEntity
    * @classdesc Entity stored in {@link InMemoryDiasporaAdapter the in-memory adapter}.
    * @extends DataStoreEntity
    * @memberof DataStoreEntities
    * @public
    * @author gerkin
    * @param {Object} source Hash containing properties to copy in this entity
    */

			var InMemoryEntity = function (_DataStoreEntity) {
				_inherits(InMemoryEntity, _DataStoreEntity);

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
    * @class LocalStorageEntity
    * @classdesc Entity stored in {@link LocalStorageDiasporaAdapter the local storage adapter}.
    * @extends DataStoreEntity
    * @memberof DataStoreEntities
    * @public
    * @author gerkin
    * @param {Object} source Hash containing properties to copy in this entity
    */

			var LocalStorageEntity = function (_DataStoreEntity2) {
				_inherits(LocalStorageEntity, _DataStoreEntity2);

				function LocalStorageEntity(entity, dataSource) {
					_classCallCheck(this, LocalStorageEntity);

					return _possibleConstructorReturn(this, (LocalStorageEntity.__proto__ || Object.getPrototypeOf(LocalStorageEntity)).call(this, entity, dataSource));
				}

				return LocalStorageEntity;
			}(DataStoreEntity);

			module.exports = LocalStorageEntity;
		}, { "./baseEntity.js": 5 }], 8: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');
			var Promise = require('bluebird');
			var SequentialEvent = require('sequential-event');
			var DiasporaAdapter = require('./adapters/baseAdapter.js');

			var adapters = {
				'in-memory': require('./adapters/inMemoryAdapter'),
				'localstorage': require('./adapters/localStorageAdapter')
			};
			var dataSources = {};
			var models = {};

			/**
    * @function cloneKeysAdd
    * @description Clone keys array and add the provided value
    * @memberof Diaspora
    * @private
    * @inner
    * @author gerkin
    * @param   {String[]}	keys	Array of keys to this point.
    * @param   {String}	newKey	New key value.
    * @returns {String[]} Clone of `keys` with `newKey` added at the end
    */
			function cloneKeysAdd(keys, newKey) {
				var newKeys = _.clone(keys);
				newKeys.push(newKey);
				return newKeys;
			}

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
							// Query search to cannonical
							if (true === args[optIndex].remapInput) {
								args[0] = adapter.remapFields(table, args[0], false);

								if (true === upd) {
									args[1] = adapter.remapFields(table, args[1], false);
								}
							}
							args[0] = adapter.normalizeQuery(args[0], args[optIndex]);
							args[optIndex].remapInput = false;
						} else if ('insert' === queryType.query) {
							if ('many' === queryType.number) {
								args[0] = _.map(args[0], function (insertion) {
									return adapter.remapFields(table, insertion, false);
								});
							} else {
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
     * @function check
     * @description Check if the value matches the field description provided, thus verify if it is valid
     * @memberof Diaspora
     * @public
     * @author gerkin
     * @param   {Object} entity    Entity to check
     * @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
     * @returns {Error[]} Array of errors
     */
				check: function check(entity, modelDesc) {
					var _this22 = this;

					// Apply method `checkField` on each field described
					return _(modelDesc).mapValues(function (fieldDesc, field) {
						return _this22.checkField.call(_this22, entity[field], fieldDesc, [field]);
					}).values().flatten().compact().value();
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
     * @returns {Error[]} Array of errors
     */
				checkField: function checkField(value, fieldDesc, keys) {
					var _this23 = this;

					if (!c.object(fieldDesc)) {
						return;
					}
					_.defaults(fieldDesc, {
						required: false
					});

					var errors = [];

					// It the field has a `validate` property, try to use it
					if (fieldDesc.validate) {
						if (!fieldDesc.validate.call(this, value, fieldDesc)) {
							errors.push(keys.join('.') + " custom validation failed");
						}
					}

					// Check the type and the required status
					if (!_.isNil(fieldDesc.type) && !_.isNil(fieldDesc.model)) {
						errors.push(keys.join('.') + " spec can't have both a type and a model");
					} else {
						// Apply the `required` modifier
						var tester = c;
						if (fieldDesc.required !== true) {
							tester = c.maybe;
						}
						if (!_.isNil(fieldDesc.model)) {
							var model = false;
							if (_.isString(fieldDesc.model)) {
								/*if ( _.has( collections, fieldDesc.model )) {
        	model = collections[fieldDesc.model].model;
        } else {*/
								errors.push(keys.join('.') + " spec \"model\" string does not match with any registered model");
								//					}
								//				} else if ( c.instance( Backbone.RelationalModel, fieldDesc.model )) {
								//					model = fieldDesc.model;
							} else {
								errors.push(keys.join('.') + " spec \"model\" must be either a string or a Backbone.RelationalModel instance");
							}
							if (model) {
								if (!tester.instance(value, model)) {
									errors.push(keys.join('.') + " expected to be a " + model.modelName);
								}
							}
						} else if (_.isString(fieldDesc.type)) {
							switch (fieldDesc.type) {
								case 'string':
									{
										if (!tester.string(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										}
									}break;

								case 'integer':
									{
										if (!tester.integer(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										}
									}break;

								case 'float':
									{
										if (!tester.number(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										}
									}break;

								case 'date':
									{
										if (!tester.date(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										}
									}break;

								case 'object':
									{
										if (!tester.object(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										} else {
											var deepTest = c.object(fieldDesc.attributes) ? _(value).mapValues(function (propVal, propName) {
												return _this23.checkField(propVal, fieldDesc.attributes[propName], cloneKeysAdd(keys, propName));
											}).values().flatten().compact().value() : [];
											if (deepTest.length !== 0) {
												errors = errors.concat(deepTest);
											}
										}
									}break;

								case 'array':
									{
										if (!tester.array(value)) {
											errors.push(keys.join('.') + " expected to be a " + fieldDesc.type);
										} else {
											var _deepTest = c.object(fieldDesc.of) ? _(value).map(function (propVal, propName) {
												if (_.isArrayLike(fieldDesc.of)) {
													var subErrors = _(fieldDesc.of).map(function (desc) {
														return _this23.checkField(propVal, desc, cloneKeysAdd(keys, propName));
													});
													if (!_.find(subErrors, function (v) {
														return 0 === v.length;
													})) {
														return subErrors;
													}
												} else {
													return _this23.checkField(propVal, fieldDesc.of, cloneKeysAdd(keys, propName));
												}
											}).flatten().compact().value() : [];
											if (_deepTest.length !== 0) {
												errors = errors.concat(_deepTest);
											}
										}
									}break;

								case 'any':
									{
										if (!tester.assigned(value)) {
											errors.push(keys.join('.') + " expected to be assigned with any type");
										}
									}break;

								default:
									{
										errors.push(keys.join('.') + " requires to be unhandled type " + fieldDesc.type);
									}break;
							}
						} else {
							errors.push(keys.join('.') + " spec \"type\" must be a string");
						}
					}
					if (!_.isNil(fieldDesc.enum)) {
						var result = _.some(fieldDesc.enum, function (enumVal) {
							if (c.instance(enumVal, RegExp)) {
								return c.match(value, enumVal);
							} else {
								return c.equal(value, enumVal);
							}
						});
						if (false === result) {
							errors.push(keys.join('.') + " expected to have a value");
						}
					}
					return errors;
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
				default: function _default(entity, modelDesc) {
					var _this24 = this;

					// Apply method `defaultField` on each field described
					return _.defaults(entity, _.mapValues(modelDesc, function (fieldDesc, field) {
						return _this24.defaultField(entity[field], fieldDesc);
					}));
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
				defaultField: function defaultField(value, fieldDesc) {
					var out = void 0;
					if (c.not.undefined(value)) {
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
				createDataSource: function createDataSource(adapter, config) {
					if (!adapters.hasOwnProperty(adapter)) {
						throw new Error("Unknown adapter \"" + adapter + "\". Available currently are " + Object.keys(adapters).join(', '));
					}
					var baseAdapter = new adapters[adapter](config);
					var newDataSource = new Proxy(baseAdapter, {
						get: function get(target, key) {
							// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
							if (_.isString(key)) {
								var method = void 0;
								if (method = key.match(/^(find|update|insert|delete)(Many|One)$/)) {
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
     * @method registerDataSource
     * @description Stores the data source with provided label
     * @memberof Diaspora
     * @public
     * @author gerkin
     * @throws {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
     * @param {String}          moduleName Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
     * @param {String}          name       Name associated with this datasource
     * @param {DiasporaAdapter} dataSource Datasource itself
     */
				registerDataSource: function registerDataSource(moduleName, name, dataSource) {
					if (!_.isString(moduleName) && moduleName.length > 0) {
						throw new Error("Module name must be a non empty string, had \"" + moduleName + "\"");
					}
					if (!_.isString(name) && name.length > 0) {
						throw new Error("DataSource name must be a non empty string, had \"" + name + "\"");
					}
					if (dataSources.hasOwnProperty(name)) {
						throw new Error("DataSource name already used, had \"" + name + "\"");
					}
					if (!(dataSource instanceof DiasporaAdapter)) {
						throw new Error('DataSource must be an instance inheriting "DiasporaAdapter"');
					}
					dataSource.name = name;
					_.merge(dataSources, _defineProperty({}, moduleName, _defineProperty({}, name, dataSource)));
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
     */
				declareModel: function declareModel(moduleName, name, modelDesc) {
					if (!_.isString(moduleName) && moduleName.length > 0) {
						throw new Error("Module name must be a non empty string, had \"" + moduleName + "\"");
					}
					if (!_.isString(name) && name.length > 0) {
						throw new Error("DataSource name must be a non empty string, had \"" + name + "\"");
					}
					if (!c.object(modelDesc)) {
						throw new Error('"modelDesc" must be an object');
					}
					var model = new Model(moduleName, name, modelDesc);
					_.assign(models, _defineProperty({}, moduleName, {}));
					models[moduleName][name] = model;
					return model;
				},


				models: models,
				dataSources: dataSources,
				adapters: adapters,
				dependencies: {
					lodash: _,
					bluebird: Promise,
					'sequential-event': SequentialEvent
				}
			};

			module.exports = Diaspora;

			// Load Model class after, so that Model requires Diaspora once it is declared
			var Model = require('./model');
		}, { "./adapters/baseAdapter.js": 2, "./adapters/inMemoryAdapter": 3, "./adapters/localStorageAdapter": 4, "./model": 10, "bluebird": "bluebird", "lodash": "lodash", "sequential-event": "sequential-event" }], 9: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');
			var Promise = require('bluebird');
			var Diaspora = require('./diaspora');
			var DataStoreEntity = require('./dataStoreEntities/baseEntity');

			var entityPrototype = {
				model: {
					writable: false,
					enumerable: true
				},
				dataSources: {
					writable: false,
					enumerable: true
				},
				toObject: {
					writable: false,
					enumerable: true
				},
				persist: {
					writable: false,
					enumerable: true
				},
				fetch: {
					writable: false,
					enumerable: true
				},
				destroy: {
					writable: false,
					enumerable: true
				},
				getState: {
					writable: false,
					enumerable: true
				},
				getLastDataSource: {
					writable: false,
					enumerable: true
				},
				getUidQuery: {
					writable: false,
					enumerable: true
				},
				getTable: {
					writable: false,
					enumerable: true
				}
			};
			var entityPrototypeProperties = _.keys(entityPrototype);

			function EntityFactory(name, modelAttrs, model) {
				var modelAttrsKeys = _.keys(modelAttrs);

				/**
     * @class Entity
     * @classdesc An entity is a document in the population of all your datas of the same type
     * @description Create a new entity
     * @public
     * @author gerkin
     * @param {Object} source Hash with properties to copy on the new object
     */
				function Entity() {
					var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

					// Stores the object state
					var state = 'orphan';
					var lastDataSource = null;
					var dataSources = Object.seal(_.mapValues(model.dataSources, function () {
						return undefined;
					}));

					if (source instanceof DataStoreEntity) {
						state = 'sync';
						lastDataSource = source.dataSource.name;
						dataSources[lastDataSource] = source;
						source = _.omit(source.toObject(), ['id']);
					}
					// Check keys provided in source
					var sourceKeys = _.keys(source);
					// Check if there is an intersection with reserved, and have differences with model attributes
					var sourceUReserved = _.intersection(source, entityPrototypeProperties);
					if (0 !== sourceUReserved.length) {
						throw new Error("Source has reserved keys: " + JSON.stringify(sourceUReserved) + " in " + JSON.stringify(source));
					}
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
					Diaspora.default(attributes, modelAttrs);
					// Define getters & setters
					var entityDefined = Object.defineProperties(this, _.extend({
						model: {
							value: model
						},
						dataSources: {
							value: dataSources
						},
						toObject: {
							value: function toObject() {
								return _.omit(attributes, entityPrototypeProperties);
							}
						},
						persist: {
							value: function persist(sourceName) {
								var _this25 = this;

								var dataSource = this.model.getDataSource(sourceName);
								var promise = void 0;
								// Depending on state, we are going to perform a different operation
								if ('orphan' === state) {
									promise = dataSource.insertOne(this.getTable(sourceName), this.toObject());
								} else {
									promise = dataSource.updateOne(this.getTable(sourceName), this.getUidQuery(dataSource), this.toObject());
								}
								state = 'syncing';
								lastDataSource = dataSource.name;
								return promise.then(function (dataStoreEntity) {
									state = 'sync';
									entityDefined.dataSources[dataSource.name] = dataStoreEntity;
									attributes = dataStoreEntity.toObject();
									return Promise.resolve(_this25);
								});
							}
						},
						fetch: {
							value: function fetch(sourceName) {
								var _this26 = this;

								var dataSource = this.model.getDataSource(sourceName);
								var promise = void 0;
								// Depending on state, we are going to perform a different operation
								if ('orphan' === state) {
									promise = Promise.reject('Can\'t fetch an orphan entity');
								} else {
									promise = dataSource.findOne(this.getTable(sourceName), this.getUidQuery(dataSource));
								}
								state = 'syncing';
								lastDataSource = dataSource.name;
								return promise.then(function (dataStoreEntity) {
									state = 'sync';
									entityDefined.dataSources[dataSource.name] = dataStoreEntity;
									attributes = dataStoreEntity.toObject();
									return Promise.resolve(_this26);
								});
							}
						},
						destroy: {
							value: function destroy(sourceName) {
								var _this27 = this;

								var dataSource = this.model.getDataSource(sourceName);
								var promise = void 0;
								if ('orphan' === state) {
									promise = Promise.reject(new Error('Can\'t destroy an orphan entity'));
								} else {
									promise = dataSource.deleteOne(this.getTable(sourceName), this.getUidQuery(dataSource));
								}
								state = 'syncing';
								lastDataSource = dataSource.name;
								return promise.then(function (dataStoreEntity) {
									// If this was our only data source, then go back to orphan state
									if (0 === _.without(model.dataSources, dataSource.name).length) {
										state = 'orphan';
									} else {
										state = 'sync';
										delete attributes.idHash[dataSource.name];
									}
									entityDefined.dataSources[dataSource.name] = undefined;
									dataStoreEntity = null;
									return Promise.resolve(_this27);
								});
							}
						},
						getState: {
							value: function getState() {
								return state;
							}
						},
						getLastDataSource: {
							value: function getLastDataSource() {
								return lastDataSource;
							}
						},
						getUidQuery: {
							value: function getUidQuery(dataSource) {
								return {
									id: attributes.idHash[dataSource.name]
								};
							}
						},
						getTable: {
							value: function getTable(sourceName) {
								return name;
							}
						}
					}));
					var entityProxied = new Proxy(entityDefined, {
						get: function get(obj, key) {
							if ('constructor' === key) {
								return entityDefined[key];
							}
							if (entityDefined.hasOwnProperty(key)) {
								return entityDefined[key];
							}
							return attributes[key];
						},
						set: function set(obj, key, value) {
							if (entityDefined.hasOwnProperty(key)) {
								console.warn("Trying to define read-only key " + key + ".");
								return value;
							}
							return attributes[key] = value;
						},
						enumerate: function enumerate(obj) {
							return _.keys(attributes);
						},
						ownKeys: function ownKeys(obj) {
							return _(attributes).keys().concat(entityPrototypeProperties).value();
						},
						has: function has(obj, key) {
							return attributes.hasOwnProperty(key);
						}
					});
					return entityProxied;
				}
				var EntityWrapped = Object.defineProperties(Entity, {
					/**
      * @property {String} name Name of the class
      * @memberof Entity
      * @static
      * @public
      * @author gerkin
      */
					name: {
						value: name + "Entity",
						writable: false,
						enumerable: true
					},
					/**
      * @property {Model} model Reference to this entity's model
      * @memberof Entity
      * @static
      * @public
      * @author gerkin
      */
					model: {
						value: model,
						writable: false,
						enumerable: true
					}
				});
				return EntityWrapped;
			}

			// Add prototype infos to the function, so users can know which props are used.
			_.assign(EntityFactory, {
				entityPrototype: entityPrototype,
				entityPrototypeProperties: entityPrototypeProperties
			});

			module.exports = EntityFactory;
		}, { "./dataStoreEntities/baseEntity": 5, "./diaspora": 8, "bluebird": "bluebird", "lodash": "lodash" }], 10: [function (require, module, exports) {
			'use strict';

			var _ = require('lodash');
			var Promise = require('bluebird');
			var EntityFactory = require('./entityFactory');
			var Diaspora = require('./diaspora');

			var entityPrototypeProperties = EntityFactory.entityPrototypeProperties;

			/**
    * @class Model
    * @classdesc The model class is used to interact with the population of all data of the same type.
    * @description Construct a new model.
    * @public
    * @author gerkin
    * @param {String} namespace Namespace of the model. This may be used for scope or inheriting mechanisms
    * @param {String} namespace Name of the model
    * @param {ModelDescription} modelDesc Hash representing the configuration of the model
    */

			var Model = function () {
				function Model(namespace, name, modelDesc) {
					_classCallCheck(this, Model);

					var reservedPropIntersect = _.intersection(entityPrototypeProperties, _.keys(modelDesc.attributes));
					if (0 !== reservedPropIntersect.length) {
						throw new Error(JSON.stringify(reservedPropIntersect) + " is/are reserved property names. To match those column names in data source, please use the data source mapper property");
					}
					if (!modelDesc.hasOwnProperty('sources') || !(_.isArrayLike(modelDesc.sources) || c.object(modelDesc.sources))) {
						throw new TypeError("Expect model sources to be either an array or an object, had " + JSON.stringify(modelDesc.sources) + ".");
					}
					// Normalize our sources: normalized form is an object with keys corresponding to source name, and key corresponding to remaps
					var sourcesNormalized = _.isArrayLike(modelDesc.sources) ? _.zipObject(modelDesc.sources, _.times(modelDesc.sources.length, _.constant({}))) : _.mapValues(modelDesc.sources, function (remap, dataSourceName) {
						if (true === remap) {
							return {};
						} else if (c.object(remap)) {
							return remap;
						} else {
							throw new TypeError("Datasource \"" + dataSourceName + "\" value is invalid: expect `true` or a remap hash, but have " + JSON.stringify(remap));
						}
					});
					// List sources required by this model
					var sourceNames = _.keys(sourcesNormalized);
					// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
					var scopeAvailableSources = Diaspora.dataSources[namespace];
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
					this.entityFactory = EntityFactory(name, modelDesc.attributes, this);
				}

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
				}, {
					key: "spawn",
					value: function spawn(source) {
						var newEntity = new this.entityFactory(source);
						return newEntity;
					}
				}, {
					key: "spawnMulti",
					value: function spawnMulti(sources) {
						var _this28 = this;

						return _.map(sources, function (source) {
							return _this28.spawn(source);
						});
					}
				}, {
					key: "insert",
					value: function insert(source, dataSourceName) {
						var _this29 = this;

						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertOne(this.name, source).then(function (entity) {
							return Promise.resolve(new _this29.entityFactory(entity));
						});
					}
				}, {
					key: "insertMany",
					value: function insertMany(sources, dataSourceName) {
						var _this30 = this;

						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.insertMany(this.name, sources).then(function (entities) {
							return Promise.resolve(_.map(entities, function (entity) {
								return new _this30.entityFactory(entity);
							}));
						});
					}
				}, {
					key: "find",
					value: function find() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						var _this31 = this;

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
							var newEntity = new _this31.entityFactory(dataSourceEntity);
							newEntity.dataSources[dataSource.name] = dataSourceEntity;
							return Promise.resolve(newEntity);
						});
					}
				}, {
					key: "findMany",
					value: function findMany() {
						var queryFind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

						var _this32 = this;

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
						return dataSource.findMany(this.name, queryFind, options).then(function (dataSourceEntities) {
							var entities = _.map(dataSourceEntities, function (dataSourceEntity) {
								var newEntity = new _this32.entityFactory(dataSourceEntity);
								newEntity.dataSources[dataSource.name] = dataSourceEntity;
								return newEntity;
							});
							return Promise.resolve(entities);
						});
					}
				}, {
					key: "update",
					value: function update(queryFind, _update) {
						var _this33 = this;

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
							var newEntity = new _this33.entityFactory(dataSourceEntity);
							return Promise.resolve(newEntity);
						});
					}
				}, {
					key: "updateMany",
					value: function updateMany(queryFind, update) {
						var _this34 = this;

						var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
						var dataSourceName = arguments[3];

						if (_.isString(options) && !!_.isNil(dataSourceName)) {
							dataSourceName = options;
							options = {};
						}
						var dataSource = this.getDataSource(dataSourceName);
						return dataSource.updateMany(this.name, queryFind, update, options).then(function (dataSourceEntities) {
							var entities = _.map(dataSourceEntities, function (dataSourceEntity) {
								var newEntity = new _this34.entityFactory(dataSourceEntity);
								return newEntity;
							});
							return Promise.resolve(entities);
						});
					}
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
		}, { "./diaspora": 8, "./entityFactory": 9, "bluebird": "bluebird", "lodash": "lodash" }] }, {}, [1])(1);
});
//# sourceMappingURL=diaspora.js.map
