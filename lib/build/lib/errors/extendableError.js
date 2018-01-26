(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["core-js/modules/es6.function.name"], factory);
    }
    else if (typeof exports !== "undefined") {
        factory(require("core-js/modules/es6.function.name"));
    }
    else {
        var mod = {
            exports: {}
        };
        factory(global.es6Function);
        global.extendableError = mod.exports;
    }
})(this, function (_es6Function) {
    'use strict';
    /**
     * @module Errors/ExtendableError
     */
    /**
     * This class is the base class for custom Diaspora errors
     *
     * @extends Error
     */
    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
    function _assertThisInitialized(self) { if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    } return self; }
    var ExtendableError = 
    /*#__PURE__*/
    function (_Error) {
        _inheritsLoose(ExtendableError, _Error);
        /**
         * Construct a new extendable error.
         *
         * @author gerkin
         * @param {string} message          - Message of this error.
         * @param {*}      errorArgs        - Arguments to transfer to parent Error.
         */
        function ExtendableError(message) {
            var _this;
            for (var _len = arguments.length, errorArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                errorArgs[_key - 1] = arguments[_key];
            }
            _this = _Error.call.apply(_Error, [this, message].concat(errorArgs)) || this;
            _this.name = _this.constructor.name;
            _this.message = message;
            if ('function' === typeof Error.captureStackTrace) {
                Error.captureStackTrace(_assertThisInitialized(_this), _this.constructor);
            }
            else {
                _this.stack = new Error(message).stack;
            }
            return _this;
        }
        return ExtendableError;
    }(Error);
    module.exports = ExtendableError;
});
//# sourceMappingURL=extendableError.js.map
//# sourceMappingURL=extendableError.js.map