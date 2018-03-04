import _ from 'lodash';

import {
	EntityUid,
	IRawEntityAttributes,
	IEntityAttributes,
} from '../../entityFactory';
import { Adapter } from '.';

/**
 * @namespace DataStoreEntities
 */

/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 * @memberof DataStoreEntities
 */
export class AdapterEntity<T extends Adapter> {
	public readonly id: EntityUid;
	public readonly idHash: { [key: string]: EntityUid };
	public readonly dataSource: T;

	[key: string]: any;

	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	constructor(entity: IRawEntityAttributes, dataSource: T) {
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

		this.idHash = { [dataSource.name]: entity.id };
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
	toObject(): IEntityAttributes {
		// TODO WARNING! Cast not OK
		return _.omit(this, ['dataSource', 'id']) as any;
	}
}
