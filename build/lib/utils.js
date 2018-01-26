(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.regexp.replace"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.regexp.replace"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6Regexp);
    global.utils = mod.exports;
  }
})(this, function (_es6Regexp) {
  'use strict';

  var _require = require('./dependencies'),
      _ = _require._;
  /**
   * @module Utils
   */


  module.exports = {
    defineEnumerableProperties: function defineEnumerableProperties(subject, handlers) {
      var remappedHandlers = _.mapValues(handlers, function (handler) {
        if (_.isNil(handler) || 'object' !== typeof handler || Object.getPrototypeOf(handler) !== Object.prototype) {
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
    },

    /**
     * Merge update query with the entity. This operation allows to delete fields.
     *
     * @author gerkin
     * @param   {Object} update - Hash representing modified values. A field with an `undefined` value deletes this field from the entity.
     * @param   {Object} entity - Entity to update.
     * @returns {Object} Entity modified.
     */
    applyUpdateEntity: function applyUpdateEntity(update, entity) {
      _.forEach(update, function (val, key) {
        if (_.isUndefined(val)) {
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
    generateUUID: function generateUUID() {
      var d = new Date().getTime(); // Use high-precision timer if available

      if (global.performance && 'function' === typeof global.performance.now) {
        d += global.performance.now();
      }

      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return ('x' === c ? r : r & 0x3 | 0x8).toString(16);
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
    applyOptionsToSet: function applyOptionsToSet(set, options) {
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
  };
});
//# sourceMappingURL=utils.js.map
