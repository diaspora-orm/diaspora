import Bluebird from 'bluebird';
import _ from 'lodash';
import { SequentialEvent } from 'sequential-event';

import { Diaspora } from './diaspora';
import { EntityStateError } from './errors';

import { AdapterEntity, Adapter } from './adapters/base';
import { ModelDescription, Model } from './model';

/**
 * @module EntityFactory
 */

const DEFAULT_OPTIONS = { skipEvents: false };

export interface IOptions {
	skipEvents?: boolean;
}
export interface IRawEntityAttributes {
	[key: string]: any;
}
export interface IEntityAttributes extends IRawEntityAttributes {
	idHash: { [key: string]: string | number };
}
export enum State {
	ORPHAN = 'orphan',
	SYNCING = 'syncing',
	SYNC = 'sync',
}
export type EntityUid = string | number;

export interface EntitySpawner {
	new (source?: IRawEntityAttributes): Entity;
	model: Model;
	name: string;
}

const maybeEmit = async (
	entity: Entity,
	options: IOptions,
	eventsArgs: any[],
	events: string | string[]
): Bluebird<Entity> => {
	events = _.castArray(events);
	if (options.skipEvents) {
		return entity;
	} else {
		await entity.emit(events[0], ...eventsArgs);
		if (events.length > 1) {
			return maybeEmit(entity, options, eventsArgs, _.slice(events, 1));
		} else {
			return entity;
		}
	}
};

const execIfOkState = (
	entity: Entity,
	beforeState: State,
	dataSource: Adapter,
	// TODO: precise it
	method: string
): Bluebird<AdapterEntity> => {
	// Depending on state, we are going to perform a different operation
	if ('orphan' === beforeState) {
		return Bluebird.reject(new EntityStateError("Can't fetch an orphan entity."));
	} else {
		// Skip scoping :/
		(entity as any).lastDataSource = dataSource;
		const execMethod: (
			table: string,
			query: object
		) => Bluebird<AdapterEntity> = (dataSource as any)[method];
		return execMethod(entity.table(dataSource.name), entity.uidQuery(dataSource));
	}
};

const entityCtrSteps = {
	castTypes(source: IRawEntityAttributes, modelDesc: ModelDescription) {
		const attrs = modelDesc.attributes;
		_.forEach(source, (currentVal: any, attrName: string) => {
			const attrDesc = attrs[attrName];
			if (_.isObject(attrDesc)) {
				switch (attrDesc.type) {
					case 'date':
						{
							if (_.isString(currentVal) || _.isInteger(currentVal)) {
								source[attrName] = new Date(currentVal);
							}
						}
						break;
				}
			}
		});
		return source;
	},
	loadSource(this: Entity, source: IRawEntityAttributes) {
		return source;
	},
	bindLifecycleEvents(this: Entity, modelDesc: ModelDescription) {},
};

/**
 * The entity is the class you use to manage a single document in all data sources managed by your model.
 * > Note that this class is proxied: you may try to access to undocumented class properties to get entity's data attributes
 *
 * @extends SequentialEvent
 */
export abstract class Entity extends SequentialEvent {
	private attributes: IEntityAttributes;
	private _state: State = State.ORPHAN;
	public get state() {
		return this._state;
	}
	protected lastDataSource?: Adapter;
	private dataSources: WeakMap<Adapter, AdapterEntity | null>;

	/**
	 * Create a new entity.
	 *
	 * @author gerkin
	 * @param name        - Name of this model.
	 * @param modelDesc   - Model configuration that generated the associated `model`.
	 * @param model       - Model that will spawn entities.
	 * @param source - Hash with properties to copy on the new object.
	 *        If provided object inherits AdapterEntity, the constructed entity is built in `sync` state.
	 */
	constructor(
		private name: string,
		private modelDesc: ModelDescription,
		private model: Model,
		source: IRawEntityAttributes = {}
	) {
		super();
		const modelAttrsKeys = _.keys(modelDesc.attributes);

		// ### Init defaults
		const sources = _.reduce(
			model.dataSources,
			(acc: WeakMap<Adapter, AdapterEntity | null>, adapter: Adapter) =>
				acc.set(adapter, null),
			new WeakMap()
		);
		this.dataSources = Object.seal(sources);

		// ### Cast types if required
		source = entityCtrSteps.castTypes(source, modelDesc);

		// ### Load datas from source
		// If we construct our Entity from a datastore entity (that can happen internally in Diaspora), set it to `sync` state
		if (source instanceof AdapterEntity) {
			this._state = State.SYNC;
			this.lastDataSource = source.dataSource;
			this.dataSources.set(this.lastDataSource, source);
			source = (<typeof Entity>this.constructor).deserialize(
				_.omit(source.toObject(), ['id'])
			);
		}

		// ### Final validation
		// Check keys provided in source
		const sourceDModel = _.difference(_.keys(source), modelAttrsKeys);
		if (0 !== sourceDModel.length) {
			// Later, add a criteria for schemaless models
			throw new Error(
				`Source has unknown keys: ${JSON.stringify(
					sourceDModel
				)} in ${JSON.stringify(source)}`
			);
		}

		// ### Generate prototype & attributes
		// Now we know that the source is valid. Deep clone to detach object values from entity then Default model attributes with our model desc
		this.attributes = Diaspora.default(_.cloneDeep(source), modelDesc.attributes);

		// ### Load events
		_.forEach(modelDesc.lifecycleEvents, (eventFunctions, eventName) => {
			// Iterate on each event functions. `_.castArray` will ensure we iterate on an array if a single function is provided.
			_.forEach(_.castArray(eventFunctions), eventFunction => {
				this.on(eventName, eventFunction);
			});
		});
	}

	/**
	 * Generate the query to get this unique entity in the desired data source.
	 *
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Name of the data source to get query for.
	 * @returns {Object} Query to find this entity.
	 */
	uidQuery(dataSource: Adapter): object {
		// Todo: precise return type
		return {
			id: this.attributes.idHash[dataSource.name],
		};
	}

	/**
	 * Return the table of this entity in the specified data source.
	 *
	 * @author gerkin
	 * @returns {string} Name of the table.
	 */
	table(sourceName: string) {
		// Will be used later
		return this.name;
	}

	/**
	 * Check if the entity matches model description.
	 *
	 * @author gerkin
	 * @throws EntityValidationError Thrown if validation failed. This breaks event chain and prevent persistance.
	 * @returns {undefined} This function does not return anything.
	 * @see Validator.Validator#validate
	 */
	validate() {
		(this.constructor as EntitySpawner).model.validator.validate(this.attributes);
	}

	/**
	 * Remove all editable properties & replace them with provided object.
	 *
	 * @author gerkin
	 * @param   {Object} [newContent={}] - Replacement content.
	 * @returns {module:EntityFactory~Entity} Returns `this`.
	 */
	replaceAttributes(newContent: IRawEntityAttributes = {}) {
		newContent.idHash = this.attributes.idHash;
		this.attributes = newContent as IEntityAttributes;
		return this;
	}

	/**
	 * Generate a diff update query by checking deltas with last source interaction.
	 *
	 * @author gerkin
	 * @param   {Adapters.DiasporaAdapter} dataSource - Data source to diff with.
	 * @returns {Object} Diff query.
	 */
	getDiff(dataSource: Adapter) {
		const dataStoreEntity = this.dataSources.get(dataSource);

		// All is diff if not present
		if (!dataStoreEntity) {
			return this.attributes;
		}
		const dataStoreObject = dataStoreEntity.toObject() as IRawEntityAttributes;

		const keys = _(this.attributes)
			.keys()
			.concat(_.keys(dataStoreObject))
			.uniq()
			.difference(['idHash'])
			.value() as string[];
		const values = _.map(keys, (key: string) => this.attributes[key]);
		const diff = _.omitBy(_.zipObject(keys, values), (val: any, key: string) =>
			_.isEqual(this.attributes[key], dataStoreObject[key])
		);
		return diff;
	}

	/**
	 * Returns a copy of this entity attributes.
	 *
	 * @author gerkin
	 * @returns {Object} Attributes of this entity.
	 */
	toObject(): IEntityAttributes {
		return this.attributes;
	}

	/**
	 * Applied before persisting the entity, this function is in charge to convert entity convinient attributes to a raw entity.
	 *
	 * @author gerkin
	 * @param   {Object} data - Data to convert to primitive types.
	 * @returns {Object} Object with Primitives-only types.
	 */
	static serialize(data: IRawEntityAttributes): IRawEntityAttributes {
		return _.cloneDeep(data);
	}

	/**
	 * Applied after retrieving the entity, this function is in charge to convert entity raw attributes to convinient types.
	 *
	 * @author gerkin
	 * @param   {Object} data - Data to convert from primitive types.
	 * @returns {Object} Object with Primitives & non primitives types.
	 */
	static deserialize(data: IRawEntityAttributes): IRawEntityAttributes {
		return _.cloneDeep(data);
	}

	/**
	 * Save this entity in specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeUpdate
	 * @fires EntityFactory.Entity#afterUpdate
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to persist entity in.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeUpdate` and `afterUpdate`.
	 * @returns {Bluebird} Bluebird resolved once entity is saved. Resolved with `this`.
	 */
	async persist(sourceName: string, options: IOptions = {}) {
		_.defaults(options, DEFAULT_OPTIONS);
		// Change the state of the entity
		const beforeState = this.state;
		this._state = State.SYNCING;
		// Generate events args
		const dataSource = (this.constructor as EntitySpawner).model.getDataSource(
			sourceName
		);
		const eventsArgs = [dataSource.name];
		const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

		// Get suffix. If entity was orphan, we are creating. Otherwise, we are updating
		const suffix = 'orphan' === beforeState ? 'Create' : 'Update';

		// Trigger events & validation
		await _maybeEmit(['beforePersist', 'beforeValidate']);
		await this.validate();
		await _maybeEmit(['afterValidate', `beforePersist${suffix}`]);

		// Depending on state, we are going to perform a different operation
		const dataStoreEntity = await ('orphan' === beforeState
			? dataSource.insertOne(this.table(sourceName), this.toObject())
			: dataSource.updateOne(
					this.table(sourceName),
					this.uidQuery(dataSource),
					this.getDiff(dataSource)
			  ));
		if (!dataStoreEntity) {
			throw new Error('Insert/Update returned nothing.');
		}
		// We have used data source, store it
		this.lastDataSource = dataSource;

		entityCtrSteps.castTypes(dataStoreEntity, this.modelDesc);
		this._state = State.SYNC;
		this.attributes = dataStoreEntity.toObject();
		this.dataSources.set(dataSource, dataStoreEntity);
		return _maybeEmit([`afterPersist${suffix}`, 'afterPersist']);
	}

	/**
	 * Reload this entity from specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeFind
	 * @fires EntityFactory.Entity#afterFind
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to fetch entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeFind` and `afterFind`.
	 * @returns {Bluebird} Bluebird resolved once entity is reloaded. Resolved with `this`.
	 */
	async fetch(sourceName: string, options: IOptions = {}) {
		_.defaults(options, DEFAULT_OPTIONS);
		// Change the state of the entity
		const beforeState = this.state;
		this._state = State.SYNCING;
		// Generate events args
		const dataSource = (this.constructor as EntitySpawner).model.getDataSource(
			sourceName
		);
		const eventsArgs = [
			dataSource.name,
			(<typeof Entity>this.constructor).serialize(this.attributes),
		];
		const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

		await _maybeEmit('beforeFetch');

		const dataStoreEntity = await execIfOkState(
			this,
			beforeState,
			dataSource,
			'findOne'
		);

		entityCtrSteps.castTypes(dataStoreEntity, this.modelDesc);
		this._state = State.SYNC;
		this.attributes = dataStoreEntity.toObject() as IEntityAttributes;
		this.dataSources.set(dataSource, dataStoreEntity);
		return _maybeEmit('afterFetch');
	}

	/**
	 * Delete this entity from the specified data source.
	 *
	 * @fires EntityFactory.Entity#beforeDelete
	 * @fires EntityFactory.Entity#afterDelete
	 * @author gerkin
	 * @param   {string}  sourceName                 - Name of the data source to delete entity from.
	 * @param   {Object}  [options]                  - Hash of options for this query. You should not use this parameter yourself: Diaspora uses it internally.
	 * @param   {boolean} [options.skipEvents=false] - If true, won't trigger events `beforeDelete` and `afterDelete`.
	 * @returns {Bluebird} Bluebird resolved once entity is destroyed. Resolved with `this`.
	 */
	async destroy(sourceName: string, options: IOptions = {}) {
		_.defaults(options, DEFAULT_OPTIONS);
		// Change the state of the entity
		const beforeState = this.state;
		this._state = State.SYNCING;
		// Generate events args
		const dataSource = (this.constructor as EntitySpawner).model.getDataSource(
			sourceName
		);
		const eventsArgs = [dataSource.name];
		const _maybeEmit = _.partial(maybeEmit, this, options, eventsArgs);

		await _maybeEmit('beforeDestroy');

		await execIfOkState(this, beforeState, dataSource, 'deleteOne');

		// If this was our only data source, then go back to orphan state
		if (0 === _.without(_.values(this.model.dataSources), dataSource).length) {
			this._state = State.ORPHAN;
		} else {
			this._state = State.SYNC;
			delete this.attributes.idHash[dataSource.name];
		}
		this.dataSources.set(dataSource, null);
		return _maybeEmit('afterDestroy');
	}

	/**
	 * Get the ID for the given source name.
	 *
	 * @param   {string} sourceName - Name of the source to get ID from.
	 * @returns {string} Id of this entity in requested data source.
	 */
	getId(sourceName: string): EntityUid | null {
		const dataSource = (this.constructor as EntitySpawner).model.getDataSource(
			sourceName
		);
		const entity = this.dataSources.get(dataSource);
		if (entity) {
			return entity.id;
		} else {
			return null;
		}
	}
}

/**
 * This factory function generate a new class constructor, prepared for a specific model.
 *
 * @method EntityFactory
 * @public
 * @static
 * @param   {string}           name       - Name of this model.
 * @param   {ModelDescription} modelDesc  - Model configuration that generated the associated `model`.
 * @param   {Model}            model      - Model that will spawn entities.
 * @returns {module:EntityFactory~Entity} Entity constructor to use with this model.
 * @property {module:EntityFactory~Entity} Entity Entity constructor
 */
export interface IEntityFactory {
	(name: string, modelDesc: ModelDescription, model: Model): EntitySpawner;
	Entity: Entity;
}

// We init the function as any to define the Entity property later.
const ef: any = (name: string, modelDesc: ModelDescription, model: Model) => {
	/**
	 * @ignore
	 */
	class SubEntity extends Entity {
		/**
		 * Name of the class.
		 *
		 * @type {string}
		 * @author gerkin
		 */
		static get modelName() {
			return `${name}Entity`;
		}

		/**
		 * Reference to this entity's model.
		 *
		 * @type {Model}
		 * @author gerkin
		 */
		static get model() {
			return model;
		}
	}
	// We use keys `methods` and not `functions` as explained in this [StackOverflow thread](https://stackoverflow.com/a/155655/4839162).
	// Extend prototype with methods in our model description
	_.forEach(modelDesc.methods, (method: Function, methodName: string) => {
		(SubEntity.prototype as any)[methodName] = method;
	});
	// Add static methods
	_.forEach(
		modelDesc.staticMethods,
		(staticMethod: Function, staticMethodName: string) => {
			(SubEntity as any)[staticMethodName] = staticMethod;
		}
	);
	return SubEntity.bind(SubEntity, name, modelDesc, model) as EntitySpawner;
};
ef.Entity = Entity;
export const EntityFactory: IEntityFactory = ef;

// =====
// ## Lifecycle Events

// -----
// ### Persist

/**
 * @event EntityFactory.Entity#beforePersist
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforeValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterValidate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#beforePersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistCreate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersistUpdate
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterPersist
 * @type {String}
 */

// -----
// ### Find

/**
 * @event EntityFactory.Entity#beforeFind
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterFind
 * @type {String}
 */

// -----
// ### Destroy

/**
 * @event EntityFactory.Entity#beforeDestroy
 * @type {String}
 */

/**
 * @event EntityFactory.Entity#afterDestroy
 * @type {String}
 */
