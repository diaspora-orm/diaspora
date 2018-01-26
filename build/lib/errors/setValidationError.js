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
    global.setValidationError = mod.exports;
  }
})(this, function (_es6Regexp) {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var _require = require('../dependencies'),
      _ = _require._;

  var ValidationError = require('./validationError');
  /**
   * @module Errors/SetValidationError
   */

  /**
   * This class represents an error related to validation on a set.
   *
   * @extends module:Errors/ValidationError~ValidationError
   */


  var SetValidationError =
  /*#__PURE__*/
  function (_ValidationError) {
    _inheritsLoose(SetValidationError, _ValidationError);

    /**
     * Construct a new validation error.
     *
     * @author gerkin
     * @see Diaspora.check
     * @param {string}                                                      message          - Message of this error.
     * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
     * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
     */
    function SetValidationError(message, validationErrors) {
      var _this;

      message += "[\n" + _(validationErrors).map(function (error, index) {
        if (_.isNil(error)) {
          return false;
        } else {
          return index + ": " + error.message.replace(/\n/g, '\n	');
        }
      }).filter(_.identity).join(',\n') + "\n]";

      for (var _len = arguments.length, errorArgs = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        errorArgs[_key - 2] = arguments[_key];
      }

      _this = _ValidationError.call.apply(_ValidationError, [this, message].concat(errorArgs)) || this;
      _this.validationErrors = validationErrors;
      return _this;
    }

    return SetValidationError;
  }(ValidationError);

  module.exports = SetValidationError;
});
//# sourceMappingURL=setValidationError.js.map
