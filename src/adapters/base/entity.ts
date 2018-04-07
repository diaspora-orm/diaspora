import * as _ from 'lodash';

import { EntityUid, IRawEntityAttributes } from '../../entities/entityFactory';
import { Adapter } from './adapter';
import { QueryLanguage } from '../../types/queryLanguage';
import { DataAccessLayer } from '../dataAccessLayer';

export interface IIdHash {
	[key: string]: EntityUid;
}
export interface IRawAdapterEntityAttributes {
	id: EntityUid;
	idHash: IIdHash;
	[key: string]: any;
}

export interface IAdapterEntityCtr<T extends AdapterEntity>{
	new ( data: IRawEntityAttributes, adapter: Adapter<T> ): T;
	
	matches(
		attributes: IRawAdapterEntityAttributes,
		query: QueryLanguage.SelectQuery
	): boolean;

	setId(
		attributes: IRawEntityAttributes,
		adapter: Adapter<T>,
		propName: string,
		id: EntityUid
	): IRawAdapterEntityAttributes;
}
/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 */
export abstract class AdapterEntity {
	public get attributes() {
		return this._attributes;
	}
	public readonly dataSource: Adapter;
	public readonly dataAccessLayer: DataAccessLayer;

	protected _attributes: IRawAdapterEntityAttributes;

	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	public constructor(
		entity: IRawEntityAttributes,
		dataSource: Adapter
	) {
		if ( _.isNil( entity ) ) {
			throw new Error( "Can't construct entity from nil value" );
		}
		if ( _.isNil( dataSource ) ) {
			throw new TypeError(
				`Expect 2nd argument to be the parent of this entity, have "${dataSource}"`
			);
		}
		if ( !entity.id ) {
			throw new Error( 'Entity from adapter should have an id.' );
		}

		_.merge( entity, { idHash: { [dataSource.name]: entity.id } } );
		this._attributes = entity as IRawAdapterEntityAttributes;
		this.dataSource = dataSource;
		this.dataAccessLayer = DataAccessLayer.retrieveAccessLayer( dataSource );
	}

	public static setId(
		attributes: IRawEntityAttributes,
		adapter: Adapter,
		propName: string = 'id',
		id: EntityUid = attributes.id
	): IRawAdapterEntityAttributes {
		const adapterEntityAttributes = _.merge( attributes, {
			id,
			idHash: {
				[adapter.name]: attributes[propName],
			},
		} );
		return adapterEntityAttributes;
	}

	/**
	 * Is implemented only by decorator
	 *
	 * @param query Query to match entity against
	 */
	public static matches(
		attributes: IRawAdapterEntityAttributes,
		query: QueryLanguage.SelectQueryOrCondition
	): boolean {
		return false;
	}

	/**
	 * Is implemented only by decorator
	 *
	 * @param query Query to match entity against
	 */
	public matches( query: QueryLanguage.SelectQueryOrCondition ): boolean {
		return false;
	}

	/**
	 * Returns a plain object corresponding to this entity attributes.
	 *
	 * @author gerkin
	 * @returns Plain object representing this entity.
	 */
	public toObject(): IRawAdapterEntityAttributes {
		// TODO WARNING! Cast not OK
		return _.omit( this.attributes, ['dataSource', 'id'] );
	}

	protected setId(
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
}
