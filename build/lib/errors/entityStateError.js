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
    global.entityStateError = mod.exports;
  }
})(this, function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var ExtendableError = require('./extendableError');
  /**
   * @module Errors/EntityStateError
   */

  /**
   * This class represents an error related to validation.
   * @extends module:Errors/ExtendableError~ExtendableError
   */


  var EntityStateError =
  /*#__PURE__*/
  function (_ExtendableError) {
    _inheritsLoose(EntityStateError, _ExtendableError);

    /**
     * Construct a new error related to an invalide state of the entity.
     * 
     * @author gerkin
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
    function EntityStateError() {
      for (var _len = arguments.length, errorArgs = new Array(_len), _key = 0; _key < _len; _key++) {
        errorArgs[_key] = arguments[_key];
      }

      return _ExtendableError.call.apply(_ExtendableError, [this].concat(errorArgs)) || this;
    }

    return EntityStateError;
  }(ExtendableError);

  module.exports = EntityStateError;
});
//# sourceMappingURL=entityStateError.js.map
