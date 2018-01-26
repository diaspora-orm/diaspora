import "core-js/modules/es6.promise";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["regenerator-runtime/runtime", "core-js/modules/es6.regexp.match"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("regenerator-runtime/runtime"), require("core-js/modules/es6.regexp.match"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.runtime, global.es6Regexp);
    global.set = mod.exports;
  }
})(this, function (_runtime, _es6Regexp) {
  'use strict';

  function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } } function _next(value) { step("next", value); } function _throw(err) { step("throw", err); } _next(); }); }; }

  var _require = require('./dependencies'),
      _ = _require._,
      _Promise = _require.Promise;

  var Diaspora = require('./diaspora');

  var Utils = require('./utils');

  var SetValidationError = require('./errors/setValidationError');
  /**
   * @module Set
   */

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


  var allEmit = function allEmit(entities, verb, prefix) {
    return _Promise.all(entities.map(function (entity, index) {
      return entity.emit("" + prefix + (_.isArray(verb) ? verb[index] : verb));
    }));
  };
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


  function wrapEventsAction(_x, _x2, _x3) {
    return _wrapEventsAction.apply(this, arguments);
  }

  function _wrapEventsAction() {
    _wrapEventsAction = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4(sourceName, action, verb) {
      var _allEmit;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _allEmit = _.partial(allEmit, this.entities, verb);
              _context4.next = 3;
              return _allEmit('before');

            case 3:
              _context4.next = 5;
              return _Promise.all(this.entities.map(function (entity) {
                return entity[action](sourceName, {
                  skipEvents: true
                });
              }));

            case 5:
              _context4.next = 7;
              return _allEmit('after');

            case 7:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));
    return _wrapEventsAction.apply(this, arguments);
  }

  var setProxyProps = {
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
  };
  /**
   * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
   */

  var Set =
  /*#__PURE__*/
  function () {
    /**
     * Create a new set, managing provided `entities` that must be generated from provided `model`.
     *
     * @param {Model}           model    - Model describing entities managed by this set.
     * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
     */
    function Set(model) {
      for (var _len = arguments.length, entities = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        entities[_key - 1] = arguments[_key];
      }

      // Flatten arguments
      entities = _(entities).flatten(); // Check if each entity is from the expected model

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
      return new Proxy(defined, setProxyProps);
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


    Set.checkEntitiesFromModel = function checkEntitiesFromModel(entities, model) {
      entities.forEach(function (entity, index) {
        if (entity.constructor.model !== model) {
          throw new TypeError("Provided entity n\xB0" + index + " " + entity + " is not from model " + model + " (" + model.modelName + ")");
        }
      });
    };
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


    var _proto = Set.prototype;

    _proto.persist =
    /*#__PURE__*/
    function () {
      var _persist = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(sourceName) {
        var suffixes, _allEmit, validationResults, errors;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                suffixes = this.entities.map(function (entity) {
                  return 'orphan' === entity.state ? 'Create' : 'Update';
                }).value();
                _allEmit = _.partial(allEmit, this.entities);
                _context.next = 4;
                return _allEmit('Persist', 'before');

              case 4:
                _context.next = 6;
                return _allEmit('Validate', 'before');

              case 6:
                validationResults = this.entities.map(function (entity) {
                  try {
                    entity.validate();
                  } catch (error) {
                    console.error(error);
                    Diaspora.logger.error('Validation failed:', {
                      entity: entity,
                      error: error
                    });
                    return error;
                  }
                }).value();
                errors = _.compact(validationResults).length;

                if (!(errors > 0)) {
                  _context.next = 10;
                  break;
                }

                throw new SetValidationError("Set validation failed for " + errors + " elements (on " + this.length + "): ", validationResults);

              case 10:
                _context.next = 12;
                return _allEmit('Validate', 'after');

              case 12:
                _context.next = 14;
                return wrapEventsAction.call(this, sourceName, 'persist', _.map(suffixes, function (suffix) {
                  return "Persist" + suffix;
                }));

              case 14:
                _context.next = 16;
                return _allEmit('Persist', 'after');

              case 16:
                return _context.abrupt("return", this);

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      return function persist(_x4) {
        return _persist.apply(this, arguments);
      };
    }();
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


    _proto.fetch =
    /*#__PURE__*/
    function () {
      var _fetch = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(sourceName) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return wrapEventsAction.call(this, sourceName, 'fetch', 'Fetch');

              case 2:
                return _context2.abrupt("return", this);

              case 3:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      return function fetch(_x5) {
        return _fetch.apply(this, arguments);
      };
    }();
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


    _proto.destroy =
    /*#__PURE__*/
    function () {
      var _destroy = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(sourceName) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return wrapEventsAction.call(this, sourceName, 'destroy', 'Destroy');

              case 2:
                return _context3.abrupt("return", this);

              case 3:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      return function destroy(_x6) {
        return _destroy.apply(this, arguments);
      };
    }();
    /**
     * Update all entities in the set with given object.
     *
     * @author gerkin
     * @param   {Object} newData - Attributes to change in each entity of the collection.
     * @returns {Collection} `this`.
     */


    _proto.update = function update(newData) {
      this.entities.forEach(function (entity) {
        Utils.applyUpdateEntity(newData, entity);
      });
      return this;
    };
    /**
     * Returns a POJO representation of this set's data.
     *
     * @author gerkin
     * @returns {Object} POJO representation of set & children.
     */


    _proto.toObject = function toObject() {
      return this.entities.map(function (entity) {
        return entity.toObject();
      }).value();
    };

    return Set;
  }();

  module.exports = Set;
});
//# sourceMappingURL=set.js.map
