import * as _ from 'lodash';

import { EntityUid, IRawEntityAttributes } from '../../entity/entityFactory';
import { Adapter } from '.';

/**
 * @namespace DataStoreEntities
 */

export interface IIdHash {
	[key: string]: EntityUid;
}
export interface IRawAdapterEntityAttributes {
	id: EntityUid;
	idHash: IIdHash;
	[key: string]: any;
}

export interface IAdapterEntityCtr {
	new (
		data: IRawEntityAttributes,
		adapter: Adapter<AdapterEntity>
	): IAdapterEntity;
}
export interface IAdapterEntity {}
/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 * @memberof DataStoreEntities
 */
export abstract class AdapterEntity implements IAdapterEntity {
	public get attributes() {
		return this._attributes;
	}
	private _attributes: IRawAdapterEntityAttributes;
	public readonly dataSource: Adapter<AdapterEntity>;

	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	constructor(entity: IRawEntityAttributes, dataSource: Adapter<AdapterEntity>) {
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

		_.merge(entity, { idHash: { [dataSource.name]: entity.id } });
		this._attributes = entity as IRawAdapterEntityAttributes;
		this.dataSource = dataSource;
	}

	/**
	 * Refresh the `idHash` with current adapter's `id` injected.
	 *
	 * @author gerkin
	 */
	setId(
		adapter: Adapter,
		propName: string = 'id',
		id: EntityUid = this.attributes.id
	): this {
		this._attributes = AdapterEntity.setId(
			this.attributes,
			adapter,
			propName,
			id
		);
		return this;
	}

	static setId(
		attributes: IRawEntityAttributes,
		adapter: Adapter,
		propName: string = 'id',
		id: EntityUid = attributes.id
	): IRawAdapterEntityAttributes {
		const adapterEntityAttributes = _.merge(attributes, {
			id,
			idHash: {
				[adapter.name]: attributes[propName],
			},
		});
		return adapterEntityAttributes;
	}

	/**
	 * Returns a plain object corresponding to this entity attributes.
	 *
	 * @author gerkin
	 * @returns Plain object representing this entity.
	 */
	toObject(): IRawAdapterEntityAttributes {
		// TODO WARNING! Cast not OK
		return _.omit(this.attributes, ['dataSource', 'id']);
	}
}
