(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.entityValidationError = mod.exports;
  }
})(this, function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var _require = require('../dependencies'),
      _ = _require._;

  var ValidationError = require('./validationError');

  var stringifyValidationObject = function stringifyValidationObject(validationErrors) {
    return _(validationErrors).mapValues(function (error, key) {
      return key + " => " + JSON.stringify(error.value) + "\n* " + _(error).omit(['value']).values().map(_.identity).value();
    }).values().join('\n* ');
  };
  /**
   * @module Errors/EntityValidationError
   */

  /**
   * This class represents an error related to validation on an entity.
   *
   * @extends module:Errors/ValidationError~ValidationError
   */


  var EntityValidationError =
  /*#__PURE__*/
  function (_ValidationError) {
    _inheritsLoose(EntityValidationError, _ValidationError);

    /**
     * Construct a new validation error.
     *
     * @author gerkin
     * @param {Object} validationErrors - Object describing validation errors, usually returned by {@link Diaspora.Check}.
     * @param {string} message          - Message of this error.
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
    function EntityValidationError(validationErrors, message) {
      var _this;

      message += "\n" + stringifyValidationObject(validationErrors);

      for (var _len = arguments.length, errorArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        errorArgs[_key - 2] = arguments[_key];
      }

      _this = _ValidationError.call.apply(_ValidationError, [this, message].concat(errorArgs)) || this;
      _this.validationErrors = validationErrors;
      return _this;
    }

    return EntityValidationError;
  }(ValidationError);

  module.exports = EntityValidationError;
});
//# sourceMappingURL=entityValidationError.js.map
