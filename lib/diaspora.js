'use strict';

const dependencies = require( './dependencies' );
const {
	_, Promise,
} = dependencies;

/**
 * Event emitter that can execute async handlers in sequence
 *
 * @typedef {Object} SequentialEvent
 * @author Gerkin
 * @see {@link https://gerkindev.github.io/SequentialEvent.js/SequentialEvent.html Sequential Event documentation}.
 */

/**
 * @module Diaspora
 */

const logger = (() => {
	if ( !process.browser ) {
		const winston = require( 'winston' );
		const log = winston.createLogger({
			level:      'silly',
			format:     winston.format.json(),
			transports: [
				//
				// - Write to all logs with level `info` and below to `combined.log`
				// - Write all logs error (and below) to `error.log`.
				//
			],
		});

		//
		// If we're not in production then log to the `console` with the format:
		// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
		//
		if ( process.env.NODE_ENV !== 'production' ) {
			log.add( new winston.transports.Console({
				format: winston.format.simple(),
			}));
		}
		return log;
	} else {
		return console;
	}
})();

const adapters = {};
const dataSources = {};
const models = {};

const ensureAllEntities = ( adapter, table ) => {
	// Filter our results
	const filterResults = entity => {
		// Remap fields
		entity = adapter.remapOutput( table, entity );
		// Force results to be class instances
		if ( !( entity instanceof adapter.classEntity ) && !_.isNil( entity )) {
			return new adapter.classEntity( entity, adapter );
		}
		return entity;
	};

	return results => {
		if ( _.isNil( results )) {
			return Promise.resolve();
		} else if ( _.isArrayLike( results )) {
			return Promise.resolve( _.map( results, filterResults ));
		} else {
			return Promise.resolve( filterResults( results ));
		}
	};
};

const remapArgs = ( args, optIndex, update, queryType, remapFunction ) => {
	if ( false !== optIndex ) {
		// Remap input objects
		if ( true === args[optIndex].remapInput ) {
			args[0] = remapFunction( args[0]);

			if ( true === update ) {
				args[1] = remapFunction( args[1]);
			}
		}
		args[optIndex].remapInput = false;
	} else if ( 'insert' === queryType.query ) {
		// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
		if ( 'many' === queryType.number ) {
			// If inserting *several* entities, map the array to remap each entity objects...
			args[0] = _.map( args[0], insertion => remapFunction( insertion ));
		} else {
			// ... or we are inserting a *single* one. We still need to remap entity.
			args[0] = remapFunction( args[0]);
		}
	}
};

const getRemapFunction = ( adapter, table ) => {
	return query => {
		return adapter.remapInput( table, query );
	};
};

const wrapDataSourceAction = ( callback, queryType, adapter ) => {
	return ( table, ...args ) => {

		// Transform arguments for find, update & delete
		let optIndex = false;
		let upd = false;
		if ([ 'find', 'delete' ].indexOf( queryType.query ) >= 0 ) {
			// For find & delete, options are 3rd argument (so 2nd item in `args`)
			optIndex = 1;
		} else if ( 'update' === queryType.query ) {
			// For update, options are 4th argument (so 3nd item in `args`), and `upd` flag is toggled on.
			optIndex = 2;
			upd = true;
		}
		try {
			if ( false !== optIndex ) {
				// Options to canonical
				args[optIndex] = adapter.normalizeOptions( args[optIndex]);
				// Query search to cannonical
				args[0] = adapter.normalizeQuery( args[0], args[optIndex]);
			}
			remapArgs( args, optIndex, upd, queryType, getRemapFunction( adapter, table ));
		} catch ( err ) {
			return Promise.reject( err );
		}

		// Hook after promise resolution
		return callback.call( adapter, table, ...args ).then( ensureAllEntities( adapter, table ));
	};
};

const ERRORS = {
	NON_EMPTY_STR: _.template( '<%= c %> <%= p %> must be a non empty string, had "<%= v %>"' ),
};

const requireName = ( classname, value ) => {
	if ( !_.isString( value ) && value.length > 0 ) {
		throw new Error( ERRORS.NON_EMPTY_STR({
			c: classname,
			p: 'name',
			v: value,
		}));
	}
};

const getDefault = identifier => {
	if ( _.isString( identifier )) {
		const match = identifier.match( /^(.+?)(?:::(.+?))+$/ );
		if ( match ) {
			const parts = identifier.split( '::' );
			const namedFunction = _.get( Diaspora.namedFunctions, parts );
			if ( _.isFunction( namedFunction )) {
				return namedFunction();
			}
		}
	}
	return identifier;
};

/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
const Diaspora = {
	namedFunctions: {
		Diaspora: {
			'Date.now()': () => new Date(),
		},
	},

	/**
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   {Object}         entity    - Entity to set defaults in.
	 * @param   {ModelPrototype} modelDesc - Model description.
	 * @returns {Object} Entity merged with default values.
	 */
	default( entity, modelDesc ) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.mapValues(
				modelDesc,
				( fieldDesc, field ) => this.defaultField(
					entity[field],
					fieldDesc
				)
			)
		);
	},

	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   {Any}             value     - Value to default.
	 * @param   {FieldDescriptor} fieldDesc - Description of the field to default.
	 * @returns {Any} Defaulted value.
	 */
	defaultField( value, fieldDesc ) {
		let out;
		if ( !_.isUndefined( value )) {
			out = value;
		} else {
			out = _.isFunction( fieldDesc.default ) ? fieldDesc.default() : getDefault( fieldDesc.default );
		}
		if ( 'object' === fieldDesc.type && _.isObject( fieldDesc.attributes ) && _.keys( fieldDesc.attributes ).length > 0 && !_.isNil( out )) {
			return this.default( out, fieldDesc.attributes );
		} else {
			return out;
		}
	},

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} config       - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createDataSource( adapterLabel, config ) {
		if ( !adapters.hasOwnProperty( adapterLabel )) {
			try {
				require( `diaspora-${  adapterLabel }` );
			} catch ( e ) {
				throw new Error( `Unknown adapter "${ adapterLabel }". Available currently are ${ Object.keys( adapters ).join( ', ' ) }. Additionnaly, an error was thrown: ${ e }` );
			}
		}
		const baseAdapter = new adapters[adapterLabel]( config );
		const newDataSource = new Proxy( baseAdapter, {
			get( target, key ) {
				// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
				if ( _.isString( key )) {
					let method = key.match( /^(find|update|insert|delete)(Many|One)$/ );
					if ( null !== method ) {
						method[2] = method[2].toLowerCase();
						// Cast regex match to object like this: {full: 'findMany', query: 'find', number: 'many'}
						method = _.mapKeys( method.slice( 0, 3 ), ( val, key ) => {
							return [ 'full', 'query', 'number' ][key];
						});
						return wrapDataSourceAction( target[key], method, target );
					}
				}
				return target[key];
			},
		});
		return newDataSource;
	},

	/**
	 * Stores the data source with provided label.
	 *
	 * @author gerkin
	 * @throws  {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
	 * @param   {string}          name       - Name associated with this datasource.
	 * @param   {DiasporaAdapter} dataSource - Datasource itself.
	 * @returns {undefined} This function does not return anything.
	 */
	registerDataSource( name, dataSource ) {
		requireName( 'DataSource', name );
		if ( dataSources.hasOwnProperty( name )) {
			throw new Error( `DataSource name already used, had "${ name }"` );
		}
		/*		if ( !( dataSource instanceof Diaspora.components.Adapters.Adapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}*/
		dataSource.name = name;
		_.merge( dataSources, {
			[name]: dataSource,
		});
		return dataSource;
	},

	/**
	 * Create a data source (usually, a database connection) that may be used by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if provided `adapter` label does not correspond to any adapter registered.
	 * @param   {string} sourceName   - Name associated with this datasource.
	 * @param   {string} adapterLabel - Label of the adapter used to create the data source.
	 * @param   {Object} configHash   - Configuration hash. This configuration hash depends on the adapter we want to use.
	 * @returns {Adapters.DiasporaAdapter} New adapter spawned.
	 */
	createNamedDataSource( sourceName, adapterLabel, configHash ) {
		const dataSource = Diaspora.createDataSource( adapterLabel, configHash );
		return Diaspora.registerDataSource( sourceName, dataSource );
	},

	/**
	 * Create a new Model with provided description.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if parameters are incorrect.
	 * @param   {string} name      - Name associated with this datasource.
	 * @param   {Object} modelDesc - Description of the model to define.
	 * @returns {Model} Model created.
	 */
	declareModel( name, modelDesc ) {
		if ( !_.isString( name ) && name.length > 0 ) {
			requireName( 'Model', name );
		}
		if ( !_.isObject( modelDesc )) {
			throw new Error( '"modelDesc" must be an object' );
		}
		const model = new Diaspora.components.Model( name, modelDesc );
		_.assign( models, {
			[name]: model,
		});
		return model;
	},

	/**
	 * Register a new adapter and make it available to use by models.
	 *
	 * @author gerkin
	 * @throws  {Error} Thrown if an adapter already exists with same label.
	 * @throws  {TypeError} Thrown if adapter does not extends {@link Adapters.DiasporaAdapter}.
	 * @param   {string}                   label   - Label of the adapter to register.
	 * @param   {Adapters.DiasporaAdapter} adapter - The adapter to register.
	 * @returns {undefined} This function does not return anything.
	 */
	registerAdapter( label, adapter ) {
		if ( adapters.hasOwnProperty( label )) {
			throw new Error( `Adapter with label "${ label }" already exists.` );
		}
		// Check inheritance of adapter
		/*if ( !( adapter.prototype instanceof Diaspora.components.Adapters.Adapter )) {
			throw new TypeError( `Trying to register an adapter with label "${ label }", but it does not extends DiasporaAdapter.` );
		}*/
		adapters[label] = adapter;
	},

	/**
	 * Hash containing all available models.
	 *
	 * @type {Object}
	 * @property {Model} * - Model associated with that name.
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @see Use {@link Diaspora.declareModel} to add models.
	 */
	models,

	/**
	 * Hash containing all available data sources.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter} * - Instances of adapters declared.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.createNamedDataSource} or {@link Diaspora.registerDataSource} to make data sources available for models.
	 */
	dataSources,

	/**
	 * Hash containing all available adapters. The only universal adapter is `inMemory`.
	 *
	 * @type {Object}
	 * @property {Adapters.DiasporaAdapter}        *        - Adapter constructor. Those constructors must be subclasses of DiasporaAdapter.
	 * @property {Adapters.InMemorDiasporaAdapter} inMemory - InMemoryDiasporaAdapter constructor.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 * @see Use {@link Diaspora.registerAdapter} to add adapters.
	 */
	adapters,

	/**
	 * Dependencies of Diaspora.
	 *
	 * @type {Object}
	 * @property {Bluebird}        Promise          - Bluebird lib.
	 * @property {Lodash}          _                - Lodash lib.
	 * @property {SequentialEvent} sequential-event - SequentialEvent lib.
	 * @memberof Diaspora
	 * @private
	 * @author gerkin
	 */
	dependencies: dependencies,

	/**
	 * Logger used by Diaspora and its adapters. You can use this property to configure winston. On brower environment, this is replaced by a reference to global {@link https://developer.mozilla.org/en-US/docs/Web/API/Window/console Console}.
	 *
	 * @type {Winston|Console}
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 */
	logger,
};

module.exports = Diaspora;

// Load components after export, so requires of Diaspora returns a complete object
/**
 * Hash of components exposed by Diaspora.
 *
 * @type {Object}
 * @memberof Diaspora
 * @private
 * @author gerkin
 */
Diaspora.components = {
	Errors: {
		ExtendableError:       require( './errors/extendableError' ),
		ValidationError:       require( './errors/validationError' ),
		EntityValidationError: require( './errors/entityValidationError' ),
		SetValidationError:    require( './errors/setValidationError' ),
		EntityStateError:      require( './errors/entityStateError' ),
	},
};
_.assign( Diaspora.components, {
	Adapters: {
		Adapter: require( './adapters/base/adapter' ),
		Entity:  require( './adapters/base/entity' ),
	},
});
_.assign( Diaspora.components, {
	Model:         require( './model' ),
	EntityFactory: require( './entityFactory' ),
	Entity:        require( './entityFactory' ).Entity,
	Set:           require( './set' ),
	Validator:     require( './validator' ),
	Utils:         require( './utils' ),
});

// Register available built-in adapters
Diaspora.registerAdapter( 'inMemory', require( './adapters/inMemory/adapter' ));
Diaspora.registerAdapter( 'webApi', require( './adapters/webApi/adapter' ));
// Register webStorage only if in browser
if ( process.browser ) {
	Diaspora.registerAdapter( 'webStorage', require( './adapters/webStorage/adapter' ));
}
