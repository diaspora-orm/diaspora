'use strict';

const {
	_, Promise, SequentialEvent,
} = require( '_diaspora/dependencies' );
const DiasporaAdapter = require( '_diaspora/adapters/baseAdapter.js' );

const adapters = {
	'in-memory':    require( '_diaspora/adapters/inMemoryAdapter' ),
	'localstorage': require( '_diaspora/adapters/localStorageAdapter' ),
};
const dataSources = {};
const models = {};

const wrapDataSourceAction = ( callback, queryType, adapter ) => {
	return ( table, ...args ) => {
		// Filter our results
		const filterResults = entity => {
			// Remap fields
			entity = adapter.remapFields( table, entity, true );
			// Force results to be class instances
			if ( !( entity instanceof adapter.classEntity ) && !_.isNil( entity )) {
				return new adapter.classEntity( entity, adapter );
			}
			return entity;
		};

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
			//console.log('Before query transformed', args[0]);
			if ( false !== optIndex ) {
				// Options to canonical
				args[optIndex] = adapter.normalizeOptions( args[optIndex]);
				// Remap input objects
				if ( true === args[optIndex].remapInput ) {
					args[0] = adapter.remapFields( table, args[0], false );

					if ( true === upd ) {
						args[1] = adapter.remapFields( table, args[1], false );
					}
				}
				// Query search to cannonical
				args[0] = adapter.normalizeQuery( args[0], args[optIndex]);
				args[optIndex].remapInput = false;
			} else if ( 'insert' === queryType.query ) {
				// If inserting, then, we'll need to know if we are inserting *several* entities or a *single* one.
				if ( 'many' === queryType.number ) {
					// If inserting *several* entities, map the array to remap each entity objects...
					args[0] = _.map( args[0], insertion => adapter.remapFields( table, insertion, false ));
				} else {
					// ... or we are inserting a *single* one. We still need to remap entity.
					args[0] = adapter.remapFields( table, args[0], false );
				}
			}
			//console.log('Query transformed:', args[0]);
		} catch ( err ) {
			return Promise.reject( err );
		}

		// Hook after promise resolution
		const queryPromise = callback.call( adapter, table, ...args );
		return queryPromise.then( results => {
			if ( _.isArrayLike( results )) {
				results = _.map( results, filterResults );
			} else if ( !_.isNil( results )) {
				results = filterResults( results );
			}
			return Promise.resolve( results );
		});
	};
};
/**
 * Diaspora main namespace
 * @namespace Diaspora
 * @public
 * @author gerkin
 */
const Diaspora = {
	/**
	 * @function check
	 * @description Check if the value matches the field description provided, thus verify if it is valid
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @param   {Object} entity    Entity to check
	 * @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
	 * @returns {Error[]} Array of errors
	 */
	check( entity, modelDesc = {}, keys = []) {
		// Apply method `checkField` on each field described
		const checkResults = _( modelDesc )
			.mapValues(( fieldDesc, field ) => this.checkField.call( this, entity[field], fieldDesc, _.concat( keys, [ field ])))
			.omitBy( _.isEmpty )
			.value();
		return checkResults;
	},

	/**
	 * @function checkField
	 * @description Check if the value matches the field description provided, thus verify if it is valid
	 * @memberof Diaspora
	 * @public
	 * @author gerkin
	 * @param {Any} value   Value to check
	 * @param {module:ModelExtension.FieldDescriptor} fieldDesc Description of the field to check with
	 * @param {String[]} keys Array of keys from highest ancestor to this property
	 * @returns {Object} Hash describing errors
	 */
	checkField( value, fieldDesc, keys ) {
		if ( !_.isObject( fieldDesc )) {
			return;
		}
		_.defaults( fieldDesc, {
			required: false,
		});

		const error = {};

		// It the field has a `validate` property, try to use it
		if ( fieldDesc.validate ) {
			if ( !fieldDesc.validate.call( this, value, fieldDesc )) {
				error.validate = `${ keys.join( '.' ) } custom validation failed`;
			}
		}

		// Check the type and the required status
		if ( !_.isNil( fieldDesc.type ) && !_.isNil( fieldDesc.model )) {
			error.spec =  `${ keys.join( '.' ) } spec can't have both a type and a model`;
		} else {
			// Apply the `required` modifier
			if ( true === fieldDesc.required && _.isNil( value )) {
				error.required = `${ keys.join( '.' ) } is a required property of type "${ fieldDesc.type }"`;
			} else if ( fieldDesc.required !== true && !_.isNil( value )) {
				if ( _.isString( fieldDesc.type )) {
					switch ( fieldDesc.type ) {
						case 'string': {
							if ( !_.isString( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							}
						} break;

						case 'integer': {
							if ( !_.isInteger( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							}
						} break;

						case 'float': {
							if ( !_.isNumber( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							}
						} break;

						case 'date': {
							if ( !_.isDate( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							}
						} break;

						case 'object': {
							if ( !_.isObject( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							} else {
								const deepTest = _.isObject( 
									fieldDesc.attributes 
								) ? _( value ).mapValues( 
										( propVal, propName ) => this.checkField( 
											propVal, 
											fieldDesc.attributes[propName], 
											_.concat( keys, [ propName ]) 
										) 
									)
										.omitBy( _.isEmpty )
										.value() : {};
								if ( !_.isEmpty( deepTest )) {
									error.children = deepTest;
								}
							}
						} break;

						case 'array': {
							if ( !_.isArray( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be a "${ fieldDesc.type }"`;
							} else {
								const deepTest = _.isObject( 
									fieldDesc.of 
								) ? _( value ).map( 
										( propVal, propName ) => { 
											if ( _.isArrayLike( fieldDesc.of )) { 
												const subErrors = _( fieldDesc.of ).map( desc => this.checkField( propVal, desc, _.concat( keys, [ propName ]))); 
												if ( !_.find( subErrors, v => 0 === v.length )) { 
													return subErrors; 
												} 
											} else { 
												return this.checkField( propVal, fieldDesc.of, _.concat( keys, [ propName ])); 
											} 
										} 
									)
										.omitBy( _.isEmpty )
										.value() : {};
								if ( !_.isEmpty( deepTest )) {
									error.children = deepTest;
								}
							}
						} break;

						case 'any': {
							if ( !_.stubTrue( value )) {
								error.type =  `${ keys.join( '.' ) } expected to be assigned with any type`;
							}
						} break;

						default: {
							error.type =  `${ keys.join( '.' ) } requires to be unhandled type "${ fieldDesc.type }"`;
						} break;
					}
				} else {
					error.spec =  `${ keys.join( '.' ) } spec "type" must be a string`;
				}
			}
		}
		if ( !_.isNil( fieldDesc.enum )) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( enumVal instanceof RegExp ) {
					return null !== value.match( enumVal );
				} else {
					return value === enumVal;
				}
			});
			if ( false === result ) {
				error.enum = `${ keys.join( '.' ) } expected to have one of enumerated values "${ JSON.stringify( fieldDesc.enum ) }"`;
			}
		}
		if ( !_.isEmpty( error )) {
			error.value = value;
			return error;
		} else {
			return undefined;
		}
	},

	/**
* @function default
* @description Set default values if required
* @memberof Diaspora
* @public
* @author gerkin
* @param   {Object} entity    Entity to set defaults in
* @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
* @returns {Object} Entity merged with default values
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
* @function defaultField
* @description Set the default on a single field according to its description
* @memberof Diaspora
* @public
* @author gerkin
* @param {Any} value   Value to default
* @param {module:ModelExtension.FieldDescriptor} fieldDesc Description of the field to default
* @returns {Any} Defaulted value
*/
	defaultField( value, fieldDesc ) {
		let out;
		if ( !_.isUndefined( value )) {
			out = value;
		} else {
			out = _.isFunction( fieldDesc.default ) ? fieldDesc.default() : fieldDesc.default;
		}
		if ( 'object' === fieldDesc.type && _.isObject( fieldDesc.attributes ) && _.keys( fieldDesc.attributes ).length > 0 && !_.isNil( out )) {
			return this.default( out, fieldDesc.attributes );
		} else {
			return out;
		}
	},

	createDataSource( adapter, config ) {
		if ( !adapters.hasOwnProperty( adapter )) {
			throw new Error( `Unknown adapter "${ adapter }". Available currently are ${ Object.keys( adapters ).join( ', ' ) }` );
		}
		const baseAdapter = new adapters[adapter]( config );
		const newDataSource = new Proxy( baseAdapter, {
			get: function( target, key ) {
				// If this is an adapter action method, wrap it with filters. Our method keys are only string, not tags
				if ( _.isString( key )) {
					let method;
					if ( method = key.match( /^(find|update|insert|delete)(Many|One)$/ )) {
						method[2] = method[2].toLowerCase();
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
* @method registerDataSource
* @description Stores the data source with provided label
* @memberof Diaspora
* @public
* @author gerkin
* @throws {Error} Error is thrown if parameters are incorrect or the name is already used or `dataSource` is not an adapter.
* @param {String}          moduleName Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
* @param {String}          name       Name associated with this datasource
* @param {DiasporaAdapter} dataSource Datasource itself
*/
	registerDataSource( moduleName, name, dataSource ) {
		if ( !_.isString( moduleName ) && moduleName.length > 0 ) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( dataSources.hasOwnProperty( name )) {
			throw new Error( `DataSource name already used, had "${ name }"` );
		}
		if ( !( dataSource instanceof DiasporaAdapter )) {
			throw new Error( 'DataSource must be an instance inheriting "DiasporaAdapter"' );
		}
		dataSource.name = name;
		_.merge( dataSources, {
			[moduleName]: {
				[name]: dataSource,
			},
		});
	},

	/**
* @method declareModel
* @description Create a new Model with provided description
* @memberof Diaspora
* @public
* @author gerkin
* @throws {Error} Thrown if parameters are incorrect
* @param {String} moduleName       Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
* @param {String} name       Name associated with this datasource
* @param {Object} modelDesc Description of the model to define
*/
	declareModel( moduleName, name, modelDesc ) {
		if ( !_.isString( moduleName ) && moduleName.length > 0 ) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !_.isString( name ) && name.length > 0 ) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( !_.isObject( modelDesc )) {
			throw new Error( '"modelDesc" must be an object' );
		}
		const model = new Model( moduleName, name, modelDesc );
		_.assign( models, {
			[moduleName]: {},
		});
		models[moduleName][name] = model;
		return model;
	},

	models,
	dataSources,
	adapters,
	dependencies: {
		lodash:             _,
		bluebird:           Promise,
		'sequential-event': SequentialEvent,
	},
};

module.exports = Diaspora;

// Load Model class after, so that Model requires Diaspora once it is declared
const Model = require( './model' );
