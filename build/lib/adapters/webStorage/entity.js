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
    global.entity = mod.exports;
  }
})(this, function () {
  'use strict';

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

  var DataStoreEntity = require('../base/entity.js');
  /**
   * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
   * 
   * @extends DataStoreEntities.DataStoreEntity
   * @memberof DataStoreEntities
   */


  var WebStorageEntity =
  /*#__PURE__*/
  function (_DataStoreEntity) {
    _inheritsLoose(WebStorageEntity, _DataStoreEntity);

    /**
     * Construct a local storage entity with specified content & parent.
     * 
     * @author gerkin
     * @param {Object}                   entity     - Object containing attributes to inject in this entity. The only **reserved key** is `dataSource`.
     * @param {Adapters.DiasporaAdapter} dataSource - Adapter that spawn this entity.
     */
    function WebStorageEntity(entity, dataSource) {
      return _DataStoreEntity.call(this, entity, dataSource) || this;
    }

    return WebStorageEntity;
  }(DataStoreEntity);

  module.exports = WebStorageEntity;
});
//# sourceMappingURL=entity.js.map
