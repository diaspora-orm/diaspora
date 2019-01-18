import { SequentialEvent } from 'sequential-event';
import { isArray, Function1, partial, flatten, compact, map } from 'lodash';

import { Model } from '../model';
import { Entity } from './entity';
import { Errors } from '../errors';
import * as Utils from '../utils';
import { IEntityAttributes } from '../types/entity';

/**
 * Emit events on each entities.
 *
 * @author Gerkin
 * @inner
 * @param   entities - Items to iterate over.
 * @param   verb     - Verb of the action to emit.
 * @param   prefix   - Prefix to prepend to the verb.
 * @returns Promise resolved once all promises are done.
 */
const allEmit = (
	entities: SequentialEvent[],
	verb: string | string[],
	prefix: string
): Promise<SequentialEvent[]> =>
Promise.all(
	entities.map( ( entity, index ) =>
	entity.emit( `${prefix}${isArray( verb ) ? verb[index] : verb}` )
)
);

/**
 * Emit `before` & `after` events around the entity action. `this` must be bound to the calling {@link Set}.
 *
 * @author Gerkin
 * @param   sourceName    - Name of the data source to interact with.
 * @param   action        - Name of the entity function to apply.
 * @param   verb - String or array of strings to map for events suffix.
 * @returns Promise resolved once events are finished.
 */
async function wrapEventsAction<TEntity extends IEntityAttributes>(
	this: Set<TEntity>,
	sourceName: string | undefined,
	action: string,
	verb: string | string[]
): Promise<void> {
	const _allEmit: Function1<string, Promise<SequentialEvent[]>> = partial(
		allEmit,
		this,
		verb
	);
	await _allEmit( 'before' );
	await Promise.all(
		map( this, entity =>
			( entity as any )[action]( sourceName, {
				skipEvents: true,
			} )
		)
	);
	await _allEmit( 'after' );
}

/**
 * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
 */
export class Set<TEntity extends IEntityAttributes> extends Array<Entity<TEntity>>{
	
	public get model() {
		return this._model;
	}
	
	/**
	 * Model that generated this set.
	 *
	 * @author Gerkin
	 */
	private _model: Model<TEntity>;
	
	/**
	 * PRIVATE SYMBOL. Please use {@link create}
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @see {@link create}
	 * @author Gerkin
	 * @param model    - Model describing entities managed by this set.
	 * @param entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	private constructor( model: Model<TEntity>, entities?: Array<Entity<TEntity>> ) {
		// Flatten arguments
		const wrappedEntities = flatten( entities );
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( wrappedEntities, model );
		super( ...wrappedEntities );
		
		this._model = model;
	}

	/**
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @param model    - Model describing entities managed by this set.
	 * @param entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	public static create<T>( model: Model<T>, entities?: Array<Entity<T>> ): Set<T> {
		const newSet: Set<T> = Object.create( Set.prototype );
		newSet._model = model;
		if ( isArray( entities ) ){
			newSet.push( ...entities );
		}
		return newSet;
	}
	
	/**
	 * Check if all entities in the first argument are from the expected model.
	 *
	 * @author gerkin
	 * @throws {TypeError} Thrown if one of the entity is not from provided `model`.
	 * @param entities - Array of entities to check.
	 * @param model    - Model expected to be the source of all entities.
	 * @returns This function does not return anything.
	 */
	public static checkEntitiesFromModel<TStatic extends IEntityAttributes>( entities: Array<Entity<TStatic>>, model: Model<TStatic> ): void {
		entities.forEach( ( entity, index ) => {
			if ( ( entity.constructor as Entity.IEntitySpawner<TStatic> ).model !== model ) {
				throw new TypeError(
					`Provided entity n°${index} ${entity} is not from model ${model} (${
						model.name
					})`
				);
			}
		} );
	}
	
	/**
	 * Persist all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param sourceName - Data source name to persist in.
	 * @returns Promise resolved once all items are persisted.
	 * @see {@link EntityFactory.Entity#persist}
	 */
	public async persist( sourceName?: string ): Promise<Set<TEntity>> {
		const suffixes = map( this, entity => ( 'orphan' === entity.state ? 'Create' : 'Update' ) );
		const _allEmit = partial( allEmit, this );
		await _allEmit( 'Persist', 'before' );
		await _allEmit( 'Validate', 'before' );
		const validationResults = map( this, entity => {
			try {
				entity.validate();
			} catch ( error ) {
				return error;
			}
		} );
		const errors = compact( validationResults ).length;
		if ( errors > 0 ) {
			throw new Errors.SetValidationError(
				`Set validation failed for ${errors} elements (on ${this.length}): `,
				validationResults
			);
		}
		map( this, entity => entity.applyDefaults() );
		await _allEmit( 'Validate', 'after' );
		await wrapEventsAction.call(
			this,
			sourceName,
			'persist',
			map( suffixes, suffix => `Persist${suffix}` )
		);
		await _allEmit( 'Persist', 'after' );
		return this;
	}
	
	/**
	 * Reload all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param sourceName - Data source name to reload entities from.
	 * @returns Promise resolved once all items are reloaded.
	 * @see {@link EntityFactory.Entity#fetch}
	 */
	public async fetch( sourceName?: string ): Promise<Set<TEntity>> {
		await wrapEventsAction.call( this, sourceName, 'fetch', 'Fetch' );
		return this;
	}
	
	/**
	 * Destroy all entities from this collection.
	 *
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param sourceName - Name of the data source to delete entities from.
	 * @returns Promise resolved once all items are destroyed.
	 * @see {@link EntityFactory.Entity#destroy}
	 */
	public async destroy( sourceName?: string ): Promise<Set<TEntity>> {
		await wrapEventsAction.call( this, sourceName, 'destroy', 'Destroy' );
		return this;
	}
	
	/**
	 * Update all entities in the set with given object. This does **not** persist entities in the data source: you may then call {@link persist} afterwards.
	 *
	 * @author gerkin
	 * @param   newData - Attributes to change in each entity of the collection.
	 * @returns `this`.
	 */
	public update( newData: IEntityAttributes ): Set<TEntity> {
		this.forEach( entity => {
			Utils.applyUpdateEntity( newData, entity );
		} );
		return this;
	}
}
