import { _ } from '../../dependencies';
import * as _Diaspora from '../../';

/**
 * @namespace DataStoreEntities
 */

/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 * @memberof DataStoreEntities
 */
export class AdapterEntity {
	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	constructor(
		entity: object,
		dataSource: _Diaspora.Adapters.BaseAdapter.Adapter
	) {
		if (_.isNil(entity)) {
			throw new Error("Can't construct entity from nil value");
		}
		if (_.isNil(dataSource)) {
			throw new TypeError(
				`Expect 2nd argument to be the parent of this entity, have "${dataSource}"`
			);
		}
		Object.defineProperties(this, {
			dataSource: {
				value: dataSource,
				enumerable: false,
				configurable: false,
			},
		});
		_.assign(this, entity);
	}

	/**
	 * Returns a plain object corresponding to this entity attributes.
	 *
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity.
	 */
	toObject(): object {
		return _.omit(this, ['dataSource', 'id']);
	}
}
