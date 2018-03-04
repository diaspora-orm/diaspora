import { SequentialEvent } from 'sequential-event';
import _, { LoDashImplicitArrayWrapper, PropertyName } from 'lodash';
import Bluebird from 'bluebird';

import { Model } from './model';
import {
	Entity,
	EntitySpawner,
	IRawEntityAttributes,
	IEntityAttributes,
} from './entityFactory';
import { Diaspora } from './diaspora';
import { SetValidationError } from './errors';
import * as Utils from './utils';

/**
 * @module Set
 */

/**
 * Emit events on each entities.
 *
 * @author Gerkin
 * @inner
 * @param   {SequentialEvent[]} entities - Items to iterate over.
 * @param   {string|string[]}   verb     - Verb of the action to emit.
 * @param   {string}            prefix   - Prefix to prepend to the verb.
 * @returns {Promise} Promise resolved once all promises are done.
 */
const allEmit = (
	entities: SequentialEvent[],
	verb: string | string[],
	prefix: string
): Promise<SequentialEvent[]> =>
	Promise.all(
		entities.map((entity, index) =>
			entity.emit(`${prefix}${_.isArray(verb) ? verb[index] : verb}`)
		)
	);

/**
 * Emit `before` & `after` events around the entity action. `this` must be bound to the calling {@link Set}.
 *
 * @author Gerkin
 * @inner
 * @this Set
 * @param   {string} sourceName    - Name of the data source to interact with.
 * @param   {string} action        - Name of the entity function to apply.
 * @param   {string|string[]} verb - String or array of strings to map for events suffix.
 * @returns {Promise} Promise resolved once events are finished.
 */
async function wrapEventsAction(
	this: Set,
	sourceName: string,
	action: string,
	verb: string | string[]
): Promise<void> {
	const _allEmit: _.Function1<string, Bluebird<SequentialEvent[]>> = _.partial(
		allEmit,
		this.entities,
		verb
	);
	await _allEmit('before');
	await Promise.all(
		this.entities
			.map((entity: Entity) =>
				(entity as any)[action](sourceName, {
					skipEvents: true,
				})
			)
			.value()
	);
	await _allEmit('after');
}

const setProxyProps = {
	get(target: Set, prop: PropertyName) {
		if (prop in target) {
			return (target as any)[prop];
		} else if (prop in target.entities) {
			return (target.entities as any)[prop];
		} else if (
			'string' === typeof prop &&
			prop.match(/^-?\d+$/) &&
			target.entities.nth(parseInt(prop))
		) {
			return target.entities.nth(parseInt(prop));
		}
	},
	set(target: Set, prop: PropertyName, val: any) {
		if ('model' === prop) {
			throw new Error('Can\'t assign to read-only property "model".');
		} else if ('entities' === prop) {
			Set.checkEntitiesFromModel(val, target.model);
			(target as any).entities = _(val);
		}
		return true;
	},
};

/**
 * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
 */
export class Set {
	/**
	 * List entities of this set.
	 *
	 * @author Gerkin
	 */
	private _entities: LoDashImplicitArrayWrapper<Entity>;
	public get entities() {
		return this._entities;
	}

	/**
	 * Model that generated this set.
	 *
	 * @author Gerkin
	 */
	private _model: Model;
	public get model() {
		return this._model;
	}

	/**
	 * Number of entities in this set.
	 *
	 * @author Gerkin
	 */
	public get length() {
		return this.entities.size();
	}

	/**
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @param model    - Model describing entities managed by this set.
	 * @param entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	constructor(model: Model, ...entities: (Entity | Entity[])[]) {
		// Flatten arguments
		const wrappedEntities = _(entities).flatten();
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel(wrappedEntities, model);

		this._model = model;
		this._entities = wrappedEntities;

		return new Proxy(this, setProxyProps);
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
	static checkEntitiesFromModel(
		entities: LoDashImplicitArrayWrapper<Entity>,
		model: Model
	): void {
		entities.forEach((entity, index) => {
			if ((entity.constructor as EntitySpawner).model !== model) {
				throw new TypeError(
					`Provided entity n°${index} ${entity} is not from model ${model} (${
						model.name
					})`
				);
			}
		});
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
	async persist(sourceName: string): Bluebird<Set> {
		const suffixes = this.entities
			.map(entity => ('orphan' === entity.state ? 'Create' : 'Update'))
			.value();
		const _allEmit = _.partial(allEmit, this.entities);
		await _allEmit('Persist', 'before');
		await _allEmit('Validate', 'before');
		const validationResults = this.entities
			.map(entity => {
				try {
					entity.validate();
				} catch (error) {
					console.error(error);
					(Diaspora.logger.error as any)('Validation failed:', {
						entity,
						error,
					});
					return error;
				}
			})
			.value();
		const errors = _.compact(validationResults).length;
		if (errors > 0) {
			throw new SetValidationError(
				`Set validation failed for ${errors} elements (on ${this.length}): `,
				validationResults
			);
		}
		await _allEmit('Validate', 'after');
		await wrapEventsAction.call(
			this,
			sourceName,
			'persist',
			_.map(suffixes, suffix => `Persist${suffix}`)
		);
		await _allEmit('Persist', 'after');
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
	async fetch(sourceName: string): Bluebird<Set> {
		await wrapEventsAction.call(this, sourceName, 'fetch', 'Fetch');
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
	async destroy(sourceName: string): Bluebird<Set> {
		await wrapEventsAction.call(this, sourceName, 'destroy', 'Destroy');
		return this;
	}

	/**
	 * Update all entities in the set with given object.
	 *
	 * @author gerkin
	 * @param   newData - Attributes to change in each entity of the collection.
	 * @returns `this`.
	 */
	update(newData: IRawEntityAttributes): Set {
		this.entities.forEach(entity => {
			Utils.applyUpdateEntity(newData, entity);
		});
		return this;
	}

	/**
	 * Returns a POJO representation of this set's data.
	 *
	 * @author gerkin
	 * @returns POJO representation of set & children.
	 */
	toObject(): IEntityAttributes[] {
		return this.entities.map(entity => entity.toObject()).value();
	}
}
