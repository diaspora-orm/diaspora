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
    function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }
    var DataStoreEntity = require('../base/entity.js');
    /**
     * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
     * @extends DataStoreEntities.DataStoreEntity
     * @memberof DataStoreEntities
     */
    var InMemoryEntity = 
    /*#__PURE__*/
    function (_DataStoreEntity) {
        _inheritsLoose(InMemoryEntity, _DataStoreEntity);
        /**
         * Construct a in memory entity with specified content & parent.
         *
         * @author gerkin
         * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
         * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
         */
        function InMemoryEntity(entity, dataSource) {
            return _DataStoreEntity.call(this, entity, dataSource) || this;
        }
        return InMemoryEntity;
    }(DataStoreEntity);
    module.exports = InMemoryEntity;
});
//# sourceMappingURL=entity.js.map
//# sourceMappingURL=entity.js.map