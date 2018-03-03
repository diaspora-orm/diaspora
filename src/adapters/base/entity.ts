import { _ } from '../../dependencies';
import { EntityUid, IRawEntityAttributes } from '../../entityFactory';
import { Adapter } from '.';

/**
 * @namespace DataStoreEntities
 */

/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 * @memberof DataStoreEntities
 */
export class AdapterEntity {
	public readonly id: EntityUid;
	public readonly dataSource: Adapter;
	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	constructor(entity: IRawEntityAttributes, dataSource: Adapter) {
		if (_.isNil(entity)) {
			throw new Error("Can't construct entity from nil value");
		}
		if (_.isNil(dataSource)) {
			throw new TypeError(
				`Expect 2nd argument to be the parent of this entity, have "${dataSource}"`
			);
		}
		if (!entity.id) {
			throw new Error('Entity from adapter should have an id.');
		}

		_.assign(this, entity);
		this.id = entity.id;
		this.dataSource = dataSource;
	}

	/**
	 * Returns a plain object corresponding to this entity attributes.
	 *
	 * @author gerkin
	 * @returns {Object} Plain object representing this entity.
	 */
	toObject(): IRawEntityAttributes {
		return _.omit(this, ['dataSource', 'id']);
	}
}
