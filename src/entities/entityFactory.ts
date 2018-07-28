import * as _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { Errors } from '../errors';
import { AdapterEntity, Adapter } from '../adapters/base';
import { Model } from '../model';
import { IModelDescription } from '../types/modelDescription';
import { DataAccessLayer, TDataSource } from '../adapters/dataAccessLayer';
import { IEntityAttributes, EEntityState, IIdHash, IEntityProperties, EntityUid } from '../types/entity';
import { Entity } from './entity';
import { QueryLanguage } from '../types/queryLanguage';
import { logger } from '../logger/index';

// We init the function as any to define the Entity property later.
const ef: any = ( name: string, modelDesc: IModelDescription, model: Model ) => {
	/**
	 * @ignore
	 */
	class SubEntity extends Entity {
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
	return SubEntity.bind( SubEntity, model ) as Entity.IEntitySpawner;
};
ef.Entity = Entity;
export const EntityFactory: Entity.IEntityFactory = ef;
