import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { Adapter } from '../adapters';
import AAdapterEntity = Adapter.Base.AAdapterEntity;
import AAdapter = Adapter.Base.AAdapter;
import DataAccessLayer = Adapter.DataAccessLayer;
import TDataSource = Adapter.TDataSource;

import { Errors } from '../errors';
import { Model } from '../model';
import { _ModelDescription } from '../types/modelDescription';
import { IEntityAttributes, EEntityState, IIdHash, IEntityProperties, EntityUid } from '../types/entity';
import { Entity } from './entity';
import { logger } from '../logger/index';

// We init the function as any to define the Entity property later.
const ef: Entity.IEntityFactory = ( <TEntity extends IEntityAttributes>(
		name: string,
		modelDesc: _ModelDescription.IModelDescription,
		model: Model<TEntity>
	) => {
		/**
		 * @ignore
		 */
		class SubEntity extends Entity<TEntity> {
			/**
			 * Name of the class.
			 *
			 * @author gerkin
			 */
			public static get modelName() {
				return `${name}Entity`;
			}
			
			/**
			 * Reference to this entity's model.
			 *
			 * @author gerkin
			 */
			public static get model() {
				return model;
			}
		}
		// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
		// Extend prototype with methods in our model description
		_.forEach( modelDesc.methods, ( method: Function, methodName: string ) => {
			( SubEntity.prototype as any )[methodName] = method;
		} );
		// Add static methods
		_.forEach(
			modelDesc.staticMethods,
			( staticMethod: Function, staticMethodName: string ) => {
				( SubEntity as any )[staticMethodName] = staticMethod;
			}
		);
		return ( SubEntity as any ).bind( SubEntity, model ) as Entity.IEntitySpawner<TEntity>;
	}
) as any;
ef.Entity = Entity;
export const EntityFactory = ef;
