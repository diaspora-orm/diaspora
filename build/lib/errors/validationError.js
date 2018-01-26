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
    global.validationError = mod.exports;
  }
})(this, function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var ExtendableError = require('./extendableError');
  /**
   * This class represents an error related to validation.
   *
   * @extends module:Errors/ExtendableError~ExtendableError
   */


  var ValidationError =
  /*#__PURE__*/
  function (_ExtendableError) {
    _inheritsLoose(ValidationError, _ExtendableError);

    function ValidationError() {
      return _ExtendableError.apply(this, arguments) || this;
    }

    return ValidationError;
  }(ExtendableError);

  module.exports = ValidationError;
});
//# sourceMappingURL=validationError.js.map
