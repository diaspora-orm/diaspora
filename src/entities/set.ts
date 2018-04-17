import { SequentialEvent } from 'sequential-event';
import _ from 'lodash';

import { Model } from '../model';
import { Entity, EntitySpawner, IRawEntityAttributes } from './entityFactory';
import { SetValidationError } from '../errors';
import * as Utils from '../utils';
import { logger } from '../logger';

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
			entity.emit( `${prefix}${_.isArray( verb ) ? verb[index] : verb}` )
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
async function wrapEventsAction(
	this: Set,
	sourceName: string,
	action: string,
	verb: string | string[]
): Promise<void> {
	const _allEmit: _.Function1<string, Promise<SequentialEvent[]>> = _.partial(
		allEmit,
		this.entities,
		verb
	);
	await _allEmit( 'before' );
	await Promise.all(
		this.toChainable
			.map( entity =>
				( entity as any )[action]( sourceName, {
					skipEvents: true,
				} )
			)
			.value()
	);
	await _allEmit( 'after' );
}

/**
 * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
 */
export class Set {
	public get entities() {
		return this._entities;
	}
	public set entities( newEntities: Entity[] ) {
		try {
			Set.checkEntitiesFromModel( newEntities, this._model );
			this._entities = newEntities;
		} catch ( exception ) {
			logger.warn( exception );
		}
	}
	public get toChainable() {
		return _.chain( this._entities );
	}

	public get model() {
		return this._model;
	}

	/**
	 * Number of entities in this set.
	 *
	 * @author Gerkin
	 */
	public get length() {
		return this.entities.length;
	}

	/**
	 * List entities of this set.
	 *
	 * @author Gerkin
	 */
	private _entities: Entity[];

	/**
	 * Model that generated this set.
	 *
	 * @author Gerkin
	 */
	private readonly _model: Model;

	/**
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @param model    - Model describing entities managed by this set.
	 * @param entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	public constructor( model: Model, ...entities: Array<Entity | Entity[]> ) {
		// Flatten arguments
		const wrappedEntities = _.flatten( entities );
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( wrappedEntities, model );

		this._model = model;
		this._entities = wrappedEntities;
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
	public static checkEntitiesFromModel( entities: Entity[], model: Model ): void {
		entities.forEach( ( entity, index ) => {
			if ( ( entity.constructor as EntitySpawner ).model !== model ) {
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
	public async persist( sourceName?: string ): Promise<Set> {
		const suffixes = this.toChainable
			.map( entity => ( 'orphan' === entity.state ? 'Create' : 'Update' ) )
			.value();
		const _allEmit = _.partial( allEmit, this.entities );
		await _allEmit( 'Persist', 'before' );
		await _allEmit( 'Validate', 'before' );
		const validationResults = this.toChainable
			.map( entity => {
				try {
					entity.validate();
				} catch ( error ) {
					return error;
				}
			} )
			.value();
		const errors = _.compact( validationResults ).length;
		if ( errors > 0 ) {
			throw new SetValidationError(
				`Set validation failed for ${errors} elements (on ${this.length}): `,
				validationResults
			);
		}
		await _allEmit( 'Validate', 'after' );
		await wrapEventsAction.call(
			this,
			sourceName,
			'persist',
			_.map( suffixes, suffix => `Persist${suffix}` )
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
	public async fetch( sourceName?: string ): Promise<Set> {
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
	public async destroy( sourceName?: string ): Promise<Set> {
		await wrapEventsAction.call( this, sourceName, 'destroy', 'Destroy' );
		return this;
	}

	/**
	 * Update all entities in the set with given object.
	 *
	 * @author gerkin
	 * @param   newData - Attributes to change in each entity of the collection.
	 * @returns `this`.
	 */
	public update( newData: IRawEntityAttributes ): Set {
		this.entities.forEach( entity => {
			Utils.applyUpdateEntity( newData, entity );
		} );
		return this;
	}

	/**
	 * Returns a POJO representation of this set's data.
	 *
	 * @author gerkin
	 * @returns POJO representation of set & children.
	 */
	public toObject(): Array<IRawEntityAttributes | null> {
		return this.toChainable.map( entity => entity.toObject() ).value();
	}
}
