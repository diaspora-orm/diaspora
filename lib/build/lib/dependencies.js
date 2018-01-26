(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    }
    else if (typeof exports !== "undefined") {
        factory();
    }
    else {
        var mod = {
            exports: {}
        };
        factory();
        global.dependencies = mod.exports;
    }
})(this, function () {
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
});
//# sourceMappingURL=dependencies.js.map
//# sourceMappingURL=dependencies.js.map