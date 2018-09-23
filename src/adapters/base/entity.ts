import * as _ from 'lodash';

import { Adapter as _AAdapter } from './adapter';
import AAdapter = _AAdapter.Base.AAdapter;

import { QueryLanguage } from '../../types/queryLanguage';
import { Adapter as _DataAccessLayer } from '../dataAccessLayer';
import DataAccessLayer = _DataAccessLayer.DataAccessLayer;
import { IEntityAttributes, EntityUid, IEntityProperties } from '../../types/entity';

export namespace Adapter {
	export interface IAdapterEntityCtr<TAdapterEntity extends Base.AAdapterEntity> {
		new ( data: IEntityAttributes, adapter: AAdapter<TAdapterEntity> ): TAdapterEntity;
		
		matches(
			attributes: IEntityProperties,
			query: QueryLanguage.ISelectQuery
		): boolean;
		
		setId(
			attributes: IEntityAttributes,
			adapter: AAdapter<TAdapterEntity>,
			id?: EntityUid,
			propName?: string
		): IEntityProperties;
	}
}

export namespace Adapter.Base {
	/**
	 * AdapterEntity is the sub-entity reflecting a single source content. Values may differ from the Entity itself.
	 */
	export abstract class AAdapterEntity {
		public readonly dataSource: AAdapter;
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

		/**
		 * Returns a copy of the object's properties.
		 * 
		 * @description The adapter entity is strictly private and represent the state of the entity in the data source. Thus, it can't be modified directly.
		 * When an {@link Entity} is updated, it will retrieve new instances of this entity.
		 * 
		 * @author Gerkin
		 */
		public get properties() {
			return _.cloneDeep( this._properties );
		}

		/**
		 * Returns the ID of the entity in a specific adapter. Shorthand getter for `this._properties.id`.
		 * 
		 * @author Gerkin
		 */
		public get id() {
			return this._properties.id;
		}
		
		/**
		 * Construct a new data source entity with specified content & parent.
		 *
		 * @author gerkin
		 */
		public constructor( entity: IEntityProperties, dataSource: AAdapter ) {
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
			adapter: AAdapter,
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
		protected setId( adapter: AAdapter, id?: EntityUid, propName?: string ): this {
			this._properties = AAdapterEntity.setId(
				this.attributes,
				adapter,
				id,
				propName
			);
			return this;
		}
	}
}
