import * as _ from 'lodash';

import { Adapter } from './adapter';
import { QueryLanguage } from '../../types/queryLanguage';
import { DataAccessLayer } from '../dataAccessLayer';
import {
	IEntityAttributes,
	EntityUid,
	IEntityProperties
} from '../../types/entity';

export interface IAdapterEntityCtr<TAdapterEntity extends AdapterEntity> {
	new ( data: IEntityAttributes, adapter: Adapter<TAdapterEntity> ): TAdapterEntity;
	
	matches(
		attributes: IEntityProperties,
		query: QueryLanguage.ISelectQuery
	): boolean;
	
	setId(
		attributes: IEntityAttributes,
		adapter: Adapter<TAdapterEntity>,
		id?: EntityUid,
		propName?: string
	): IEntityProperties;
}
/**
 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
 */
export abstract class AdapterEntity {
	public readonly dataSource: Adapter;
	public readonly dataAccessLayer: DataAccessLayer;
	
	protected _properties: IEntityProperties;
	/**
	 * Returns all attributes of this adapterEntity.
	 * **Note:** Attributes does not include `id` nor `idHash`, that are managed. Use {@link properties} to get them.
	 *
	 * @author Gerkin
	 */
	public get attributes() {
		// TODO WARNING! Cast not OK
		return _.omit( this.properties, ['idHash', 'id'] );
	}
	public get properties() {
		return _.cloneDeep( this._properties );
	}
	
	/**
	 * Construct a new data source entity with specified content & parent.
	 *
	 * @author gerkin
	 */
	public constructor( entity: IEntityProperties, dataSource: Adapter ) {
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
		this._properties = entity;
		this.dataSource = dataSource;
		this.dataAccessLayer = DataAccessLayer.retrieveAccessLayer( dataSource );
	}
	
	/**
	 * Applies the id in the appropriate field & id hash
	 *
	 * @author Gerkin
	 * @param attributes - Attributes of the entity
	 * @param adapter    - Adapter that will persist the entity
	 * @param propName   - Property that should contain the ID
	 * @param id         - Value of the ID
	 */
	public static setId(
		attributes: IEntityAttributes,
		adapter: Adapter,
		id?: EntityUid,
		propName: string = 'id'
	): IEntityProperties {
		const defaultedId = id || _.get( attributes, propName );
		const adapterEntityAttributes = _.merge( attributes, {
			id: defaultedId,
			idHash: {
				[adapter.name]: defaultedId,
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
		attributes: IEntityAttributes,
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
	 * Calls the static {@link AdapterEntity.setId} with provided arguments
	 *
	 * @author Gerkin
	 * @param adapter    - Adapter that will persist the entity
	 * @param propName   - Property that should contain the ID
	 * @param id         - Value of the ID
	 */
	protected setId( adapter: Adapter, id?: EntityUid, propName?: string ): this {
		this._properties = AdapterEntity.setId(
			this.attributes,
			adapter,
			id,
			propName
		);
		return this;
	}
}
