'use strict';

const {
	_, Promise,
} = require( 'lib/dependencies' );
const Utils = require( 'lib/utils' );

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

		return new Proxy( defined, {
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
		});
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
	persist( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeUpdate' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.persist( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterUpdate' )));
		}).then(() => this );
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
	fetch( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeFind' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.fetch( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterFind' )));
		}).then(() => this );
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
	destroy( sourceName ) {
		return Promise.all( this.entities.map( entity => entity.emit( 'beforeDelete' ))).then(() => {
			return Promise.all( this.entities.map( entity => entity.destroy( sourceName, {
				skipEvents: true,
			})));
		}).then(() => {
			return Promise.all( this.entities.map( entity => entity.emit( 'afterDelete' )));
		}).then(() => this );
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
			_.forEach( newData, ( val, key ) => {
				if ( _.isUndefined( val )) {
					delete entity[key];
				} else {
					entity[key] = val;
				}
			});
		});
		return this;
	}
}

module.exports = Set;
