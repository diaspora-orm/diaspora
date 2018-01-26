import "core-js/modules/es6.promise";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.function.name", "regenerator-runtime/runtime"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.function.name"), require("regenerator-runtime/runtime"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6Function, global.runtime);
    global.adapter = mod.exports;
  }
})(this, function (_es6Function, _runtime) {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

  var _require = require('../../dependencies'),
      _ = _require._,
      _Promise = _require.Promise;

  var Diaspora = require('../../diaspora');

  var DiasporaAdapter = Diaspora.components.Adapters.Adapter;

  var WebApiEntity = require('./entity.js');

  var queryObjectToString = function queryObjectToString(queryObject) {
    return _(queryObject).chain(_.cloneDeep).omitBy(function (val) {
      return _.isObject(val) && _.isEmpty(val);
    }) // { foo: 1, bar: { baz: 2 } }
    .mapValues(JSON.stringify) // { foo: '1', bar: '{"baz": "2"}' }
    .toPairs() // [ [ 'foo', '1' ], [ 'bar', '{"baz":2}' ] ]
    .map(_.partial(_.map, _, encodeURIComponent)) // [ [ 'foo', '1' ], [ 'bar', '%7B%22baz%22%3A2%7D' ] ]
    .map(function (arr) {
      return arr[0] + "=" + arr[1];
    }) // [ 'foo=1', 'bar=%7B%22baz%22%3A2%7D' ]
    .join('&').value();
  };

  var httpErrorFactories = {
    400: function _(xhr) {
      return new Error("Posted data through HTTP is invalid; message \"" + xhr.response.message + "\"");
    },
    _: function _(xhr) {
      return new Error("Unhandled HTTP error with status code " + xhr.status + " & message \"" + xhr.response.message + "\"");
    }
  };

  var defineXhrEvents = function defineXhrEvents(xhr, resolve, reject) {
    xhr.onload = function () {
      if (_.inRange(xhr.status, 200, 299)) {
        return resolve(xhr.response);
      } else {
        return reject(_.get(httpErrorFactories, xhr.status, httpErrorFactories._)(xhr));
      }
    };

    xhr.onerror = function () {
      return reject(httpErrorFactories._(xhr));
    };
  };

  var httpRequest =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(method, endPoint, data, queryObject) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              if (process.browser) {
                _context.next = 7;
                break;
              }

              if (_.isNil(data)) {
                data = true;
              }

              _context.next = 4;
              return require('request-promise')[method.toLowerCase()](endPoint, {
                json: data,
                qs: _.mapValues(queryObject, JSON.stringify)
              });

            case 4:
              return _context.abrupt("return", _context.sent);

            case 7:
              return _context.abrupt("return", new _Promise(function (resolve, reject) {
                /* globals XMLHttpRequest: false */
                var xhr = new XMLHttpRequest();
                defineXhrEvents(xhr, resolve, reject);
                var queryString = queryObjectToString(queryObject);
                xhr.responseType = 'json';
                xhr.open(method, "" + endPoint + (queryString ? "?" + queryString : ''));
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(_.isNil(data) ? undefined : JSON.stringify(data));
              }));

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function httpRequest(_x, _x2, _x3, _x4) {
      return _ref.apply(this, arguments);
    };
  }();

  var getQueryObject = function getQueryObject(queryFind, options) {
    if (0 === options.skip) {
      delete options.skip;
    }

    return _.assign({}, _.omit(options, ['remapInput', 'remapOutput']), {
      where: queryFind
    });
  };

  var maybeAddIdHashToEntities = function maybeAddIdHashToEntities(entities, adapter) {
    if (!_.isEmpty(entities)) {
      entities = _.map(entities, _.unary(adapter.setIdHash.bind(adapter)));
    }

    return entities;
  };

  var checkWebApiAdapterConfig = function checkWebApiAdapterConfig(config) {
    if (!process.browser && !_.isString(config.host)) {
      throw new Error("\"config.host\" is not defined, or is not a string: had \"" + config.host + "\"");
    }

    if (!process.browser && !_.isString(config.scheme)) {
      throw new Error("\"config.scheme\" is not defined, or is not a string: had \"" + config.scheme + "\"");
    }
  };
  /**
   * Adapter for RESTful HTTP APIs.
   *
   * @see https://www.npmjs.com/package/diaspora-server Diaspora-Server: Package built on Diaspora & Express.js to easily configure HTTP APIs compatible with this adapter.
   * @extends Adapters.DiasporaAdapter
   * @memberof Adapters
   */


  var WebApiDiasporaAdapter =
  /*#__PURE__*/
  function (_DiasporaAdapter) {
    _inheritsLoose(WebApiDiasporaAdapter, _DiasporaAdapter);

    /**
     * Create a new instance of web api adapter.
     *
     * @param {Object}         [config]                 - Configuration of this adapter.
     * @param {string|false}   [config.scheme = false]  - Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
     * @param {string|false}   [config.host = false]    - Hostname of the endpoint. On server environment, this parameter is *required*.
     * @param {number|false}   [config.port = false]    - Port of the endpoint.
     * @param {number|false}   [config.path = '']       - Path to the endpoint.
     * @param {Object<string>} [config.pluralApis = {}] - Hash with keys being the singular name of the endpoint, and values being the associated plural name of the same endpoint.
     * @author gerkin
     */
    function WebApiDiasporaAdapter(config) {
      var _this;

      if (config === void 0) {
        config = {};
      }

      /**
       * Link to the WebApiEntity.
       *
       * @name classEntity
       * @type {DataStoreEntities.WebApiEntity}
       * @memberof Adapters.WebApiDiasporaAdapter
       * @instance
       * @author Gerkin
       */
      _this = _DiasporaAdapter.call(this, WebApiEntity) || this;
      /**
       * Base URL to the REST API
       *
       * @name baseEndPoint
       * @type {string}
       * @author Gerkin
       */

      _.defaults(config, {
        scheme: false,
        host: false,
        port: false,
        path: '',
        pluralApis: {}
      });

      checkWebApiAdapterConfig(config);

      if (process.browser && false === config.host) {
        // Endpoint is an absolute url
        _this.baseEndPoint = config.path;
      } else {
        var portString = config.port ? ":" + config.port : '';
        var schemeString = config.scheme ? config.scheme + ":" : '';
        _this.baseEndPoint = schemeString + "//" + config.host + portString + config.path;
      }

      _this.state = 'ready';
      /**
       * Hash mapping singular API names to plural API names
       *
       * @name pluralApis
       * @type {Object<string>}
       * @author Gerkin
       */

      _this.pluralApis = config.pluralApis;
      return _this;
    }
    /**
     * Send an http query to the targeted `endPoint` using `method` as verb.
     * 
     * @async
     * @param   {string} verb          - Valid HTTP verb. This adapter uses `GET`, `POST`, `PATCH` & `DELETE`.
     * @param   {string} endPoint      - Name of the endpoint to interact with. It will be prepended with {@link Adapters.WebApiDiasporaAdapter#baseEndPoint}.
     * @param   {Object} [data]        - Optionnal data to send within the body of the request.
     * @param   {Object} [queryObject] - Optionnal query object to send along with the request.
     * @returns {Promise<Object>} Promise resolved with the resulting data.
     */


    var _proto = WebApiDiasporaAdapter.prototype;

    _proto.httpQuery = function httpQuery(verb, endPoint, data, queryObject) {
      return httpRequest(verb, this.baseEndPoint + "/" + endPoint.toLowerCase(), data, queryObject);
    };
    /**
     * Get the plural name of an endpoint.
     * 
     * @param   {string} endPoint - Name of the endpoint.
     * @returns {string} Plural version of the endpoint name.
     */


    _proto.getPluralEndpoint = function getPluralEndpoint(endPoint) {
      if (this.pluralApis.hasOwnProperty(endPoint)) {
        return this.pluralApis[endPoint];
      } else {
        return endPoint + "s";
      }
    }; // -----
    // ### Insert

    /**
     * Insert a single entity through an HTTP API.
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#insertOne}, modified for use of web api.
     * @author gerkin
     * @param   {string} table  - Name of the table to insert data in.
     * @param   {Object} entity - Hash representing the entity to insert.
     * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity}* `entity`).
     */


    _proto.insertOne =
    /*#__PURE__*/
    function () {
      var _insertOne = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(table, entity) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this.httpQuery('POST', table, entity);

              case 2:
                entity = _context2.sent;

                if (!_.isNil(entity)) {
                  this.setIdHash(entity);
                }

                return _context2.abrupt("return", this.maybeCastEntity(entity));

              case 5:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function insertOne(_x5, _x6) {
        return _insertOne.apply(this, arguments);
      };
    }();
    /**
     * Insert several entities through an HTTP API.
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#insertMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}   table    - Name of the table to insert data in.
     * @param   {Object[]} entities - Hash representing entities to insert.
     * @returns {Promise} Promise resolved once insertion is done. Called with (*{@link WebApiEntity[]}* `entities`).
     */


    _proto.insertMany =
    /*#__PURE__*/
    function () {
      var _insertMany = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(table, entities) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.httpQuery('POST', this.getPluralEndpoint(table), entities);

              case 2:
                entities = _context3.sent;
                entities = maybeAddIdHashToEntities(entities, this);
                return _context3.abrupt("return", this.maybeCastSet(entities));

              case 5:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function insertMany(_x7, _x8) {
        return _insertMany.apply(this, arguments);
      };
    }(); // -----
    // ### Find

    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#findOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to retrieve data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once item is found. Called with (*{@link InMemoryEntity}* `entity`).
     */


    _proto.findOne =
    /*#__PURE__*/
    function () {
      var _findOne = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(table, queryFind, options) {
        var entity;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context4.next = 3;
                return this.httpQuery('GET', table, null, getQueryObject(queryFind, options));

              case 3:
                entity = _context4.sent;

                if (!_.isNil(entity)) {
                  this.setIdHash(entity);
                }

                return _context4.abrupt("return", this.maybeCastEntity(entity));

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      return function findOne(_x9, _x10, _x11) {
        return _findOne.apply(this, arguments);
      };
    }();
    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#findMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to retrieve data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once items are found. Called with (*{@link InMemoryEntity}[]* `entities`).
     */


    _proto.findMany =
    /*#__PURE__*/
    function () {
      var _findMany = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(table, queryFind, options) {
        var entities;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context5.next = 3;
                return this.httpQuery('GET', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));

              case 3:
                entities = _context5.sent;
                entities = maybeAddIdHashToEntities(entities, this);
                return _context5.abrupt("return", this.maybeCastSet(entities));

              case 6:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      return function findMany(_x12, _x13, _x14) {
        return _findMany.apply(this, arguments);
      };
    }(); // -----
    // ### Update

    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#updateOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to update data in.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {Object}                               update       - Object properties to set.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}* `entity`).
     */


    _proto.updateOne =
    /*#__PURE__*/
    function () {
      var _updateOne = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee6(table, queryFind, update, options) {
        var entity, _entity$idHash;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context6.next = 3;
                return this.httpQuery('PATCH', table, update, getQueryObject(queryFind, options));

              case 3:
                entity = _context6.sent;

                if (!_.isNil(entity)) {
                  entity.idHash = (_entity$idHash = {}, _entity$idHash[this.name] = entity.id, _entity$idHash);
                }

                return _context6.abrupt("return", this.maybeCastEntity(entity));

              case 6:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      return function updateOne(_x15, _x16, _x17, _x18) {
        return _updateOne.apply(this, arguments);
      };
    }();
    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#updateMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to update data in.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {Object}                               update       - Object properties to set.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once update is done. Called with (*{@link InMemoryEntity}[]* `entities`).
     */


    _proto.updateMany =
    /*#__PURE__*/
    function () {
      var _updateMany = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee7(table, queryFind, update, options) {
        var entities;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context7.next = 3;
                return this.httpQuery('PATCH', this.getPluralEndpoint(table), update, getQueryObject(queryFind, options));

              case 3:
                entities = _context7.sent;
                entities = maybeAddIdHashToEntities(entities, this);
                return _context7.abrupt("return", this.maybeCastSet(entities));

              case 6:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      return function updateMany(_x19, _x20, _x21, _x22) {
        return _updateMany.apply(this, arguments);
      };
    }(); // -----
    // ### Delete

    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteOne}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to delete data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing the entity to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once item is found. Called with (*undefined*).
     */


    _proto.deleteOne =
    /*#__PURE__*/
    function () {
      var _deleteOne = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(table, queryFind, options) {
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context8.next = 3;
                return this.httpQuery('DELETE', table, null, getQueryObject(queryFind, options));

              case 3:
                return _context8.abrupt("return", _context8.sent);

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      return function deleteOne(_x23, _x24, _x25) {
        return _deleteOne.apply(this, arguments);
      };
    }();
    /**
     * 
     *
     * @summary This reimplements {@link Adapters.DiasporaAdapter#deleteMany}, modified for use of web api.
     * @author gerkin
     * @param   {string}                               table        - Name of the table to delete data from.
     * @param   {QueryLanguage#SelectQueryOrCondition} queryFind    - Hash representing entities to find.
     * @param   {QueryLanguage#QueryOptions}           [options={}] - Hash of options.
     * @returns {Promise} Promise resolved once items are deleted. Called with (*undefined*).
     */


    _proto.deleteMany =
    /*#__PURE__*/
    function () {
      var _deleteMany = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee9(table, queryFind, options) {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                if (options === void 0) {
                  options = {};
                }

                _context9.next = 3;
                return this.httpQuery('DELETE', this.getPluralEndpoint(table), null, getQueryObject(queryFind, options));

              case 3:
                return _context9.abrupt("return", _context9.sent);

              case 4:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      return function deleteMany(_x26, _x27, _x28) {
        return _deleteMany.apply(this, arguments);
      };
    }();

    return WebApiDiasporaAdapter;
  }(DiasporaAdapter);

  module.exports = WebApiDiasporaAdapter;
});
//# sourceMappingURL=adapter.js.map
