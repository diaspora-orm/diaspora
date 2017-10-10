'use strict';

const {
	_, Promise, SequentialEvent,
} = require( 'lib/dependencies' );
const DataStoreEntity = require( 'lib/dataStoreEntities/baseEntity' );
const Utils = require( 'lib/utils' );

/**
 * @class Set
 * @classdesc Collections are used to manage multiple entities at the same time
 */
class Set {
	/**
	 * @lends Set
	 * @constructs
	 * @description Create a new set, managing provided `entities` that must be generated from provided `model`
	 * @member {Model} model Model that generated those `entities`
	 * @member {Lodash} entities Entities member of this collection
	 * @param {Model} model       Model describing entities managed by this set
	 * @param {Entity|Entity[]} entities Entities to manage with this set. Arguments are flattened, so you can provide as many nested arrays as you want.
	 */
	constructor( model, ...entities ) {
		// Flatten arguments
		entities = _( entities ).flatten();
		// Check if each entity is from the expected model
		Set.checkEntitiesFromModel( entities.value(), model );

		const defined = Utils.defineEnumerableProperties( this, {
			entities: entities,
			model:    model,
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

	static checkEntitiesFromModel( entities, model ) {
		entities.forEach(( entity, index ) => {
			if ( entity.constructor.model !== model ) {
				throw new TypeError( `Provided entity n°${ index } ${ entity } is not from model ${ model } (${ model.modelName })` );
			}
		});
	}

	/**
	 * @method persist
	 * @description Persist all entities of this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Data source name to persist in
	 * @returns {Promise} Promise resolved once all items are persisted
	 * @see {@link Entity#persist}
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
	 * @method fetch
	 * @description Reload all entities of this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Data source name to reload entities from
	 * @returns {Promise} Promise resolved once all items are reloaded
	 * @see {@link Entity#fetch}
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
	 * @method destroy
	 * @description Destroy all entities from this collection
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param {String} sourceName Name of the data source to delete entities from
	 * @returns {Promise} Promise resolved once all items are destroyed
	 * @see {@link Entity#destroy}
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
	 * @method update
	 * @description Update all entities in the set with given object
	 * @memberof Set
	 * @public
	 * @instance
	 * @author gerkin
	 * @param   {Object} newData Attributes to change in each entity of the collection
	 * @returns {Collection} `this`
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
