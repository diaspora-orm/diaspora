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
        global.entity = mod.exports;
    }
})(this, function () {
    'use strict';
    var _require = require('../../dependencies'), _ = _require._;
    /**
     * @namespace DataStoreEntities
     */
    /**
     * DataStoreEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
     * @memberof DataStoreEntities
     */
    var DataStoreEntity = 
    /*#__PURE__*/
    function () {
        /**
         * Construct a new data source entity with specified content & parent.
         *
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function DataStoreEntity(entity, dataSource) {
            if (_.isNil(entity)) {
                return undefined;
            }
            if (_.isNil(dataSource)) {
                throw new TypeError("Expect 2nd argument to be the parent of this entity, have \"" + dataSource + "\"");
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
        /**
         * Returns a plain object corresponding to this entity attributes.
         *
         * @author gerkin
         * @returns {Object} Plain object representing this entity.
         */
        var _proto = DataStoreEntity.prototype;
        _proto.toObject = function toObject() {
            return _.omit(this, ['dataSource', 'id']);
        };
        return DataStoreEntity;
    }();
    module.exports = DataStoreEntity;
});
//# sourceMappingURL=entity.js.map
//# sourceMappingURL=entity.js.map