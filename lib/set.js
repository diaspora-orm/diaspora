'use strict';

const {
	_, Promise,
} = require( './dependencies' );
const Diaspora = require( './diaspora' );
const Utils = require( './utils' );
const SetValidationError = require( './errors/setValidationError' );

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
const allEmit = ( entities, verb, prefix ) => Promise.all( entities.map(( entity, index ) => entity.emit( `${ prefix }${ _.isArray( verb ) ? verb[index] : verb }` )));

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
async function wrapEventsAction( sourceName, action, verb ) {
	const _allEmit = _.partial( allEmit, this.entities, verb );
	await _allEmit( 'before' );
	await Promise.all( this.entities.map( entity => entity[action]( sourceName, {
		skipEvents: true,
	})));
	await _allEmit( 'after' );
}

const setProxyProps = {
	get( target, prop ) {
		if ( prop in target ) {
			return target[prop];
		} else if ( prop in target.entities ) {
			return target.entities[prop];
		} else if ( 'string' === typeof prop && prop.match( /^-?\d+$/ ) && target.entities.nth( parseInt( prop ))) {
			return target.entities.nth( parseInt( prop ));
		}
	},
	set( target, prop, val ) {
		if ( 'model' === prop ) {
			return new Error( 'Can\'t assign to read-only property "model".' );
		} else if ( 'entities' === prop ) {
			Set.checkEntitiesFromModel( val, target.model );
			target.entities = _( val );
		}
	},
};

/**
 * Collections are used to manage multiple entities at the same time. You may try to use this class as an array.
 */
class Set {
	/**
	 * Create a new set, managing provided `entities` that must be generated from provided `model`.
	 *
	 * @param {Model}           model    - Model describing entities managed by this set.
	 * @param {Entity|Entity[]} entities - Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	constructor( model, ...entities ) {
		// Flatten arguments
		entities = _( entities ).flatten();
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( entities.value(), model );

		const defined = Utils.defineEnumerableProperties( this, {
			/**
			 * List entities of this set.
			 *
			 * @name entities
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {LodashWrapper<Entity>}
			 * @author Gerkin
			 */
			entities: entities,
			/**
			 * Model that generated this set.
			 *
			 * @name model
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {Model}
			 * @author Gerkin
			 */
			model:    model,
			/**
			 * Number of entities in this set.
			 *
			 * @name length
			 * @readonly
			 * @memberof Set
			 * @instance
			 * @type {Integer}
			 * @author Gerkin
			 */
			length:   {
				get() {
					return this.entities.size();
				},
			},
		});

		return new Proxy( defined, setProxyProps );
	}

	/**
	 * Check if all entities in the first argument are from the expected model.
	 *
	 * @author gerkin
	 * @throws {TypeError} Thrown if one of the entity is not from provided `model`.
	 * @param {Entity[]} entities - Array of entities to check.
	 * @param {Model}    model    - Model expected to be the source of all entities.
	 * @returns {undefined} This function does not return anything.
	 */
	static checkEntitiesFromModel( entities, model ) {
		entities.forEach(( entity, index ) => {
			if ( entity.constructor.model !== model ) {
				throw new TypeError( `Provided entity n°${ index } ${ entity } is not from model ${ model } (${ model.modelName })` );
			}
		});
	}

	/**
	 * Persist all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param {string} sourceName - Data source name to persist in.
	 * @returns {Promise} Promise resolved once all items are persisted.
	 * @see {@link EntityFactory.Entity#persist}
	 */
	async persist( sourceName ) {
		const suffixes = this.entities.map( entity => 'orphan' === entity.state ? 'Create' : 'Update' ).value();
		const _allEmit = _.partial( allEmit, this.entities );
		await _allEmit( 'Persist', 'before' );
		await _allEmit( 'Validate', 'before' );
		const validationResults = this.entities.map( entity => {
			try {
				entity.validate();
			} catch ( error ) {
				console.error( error );
				Diaspora.logger.error( 'Validation failed:', {
					entity,
					error,
				});
				return error;
			}
		}).value();
		const errors = _.compact( validationResults ).length;
		if ( errors > 0 ) {
			throw new SetValidationError( `Set validation failed for ${ errors } elements (on ${ this.length }): `, validationResults );
		}
		await _allEmit( 'Validate', 'after' );
		await wrapEventsAction.call( this, sourceName, 'persist', _.map( suffixes, suffix => `Persist${ suffix }` ));
		await _allEmit( 'Persist', 'after' );
		return this;
	}

	/**
	 * Reload all entities of this collection.
	 *
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param {string} sourceName - Data source name to reload entities from.
	 * @returns {Promise} Promise resolved once all items are reloaded.
	 * @see {@link EntityFactory.Entity#fetch}
	 */
	async fetch( sourceName ) {
		await wrapEventsAction.call( this, sourceName, 'fetch', 'Fetch' );
		return this;
	}

	/**
	 * Destroy all entities from this collection.
	 *
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param {string} sourceName - Name of the data source to delete entities from.
	 * @returns {Promise} Promise resolved once all items are destroyed.
	 * @see {@link EntityFactory.Entity#destroy}
	 */
	async destroy( sourceName ) {
		await wrapEventsAction.call( this, sourceName, 'destroy', 'Destroy' );
		return this;
	}

	/**
	 * Update all entities in the set with given object.
	 *
	 * @author gerkin
	 * @param   {Object} newData - Attributes to change in each entity of the collection.
	 * @returns {Collection} `this`.
	 */
	update( newData ) {
		this.entities.forEach( entity => {
			Utils.applyUpdateEntity( newData, entity );
		});
		return this;
	}

	/**
	 * Returns a POJO representation of this set's data.
	 *
	 * @author gerkin
	 * @returns {Object} POJO representation of set & children.
	 */
	toObject() {
		return this.entities.map( entity => entity.toObject()).value();
	}
}

module.exports = Set;
