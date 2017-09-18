'use strict';

const _ = require( 'lodash' );
const c = require( 'check-types' );
const DiasporaAdapter = require( './adapters/baseAdapter.js' );

const adapters = {
	'in-memory':    require( './adapters/inMemoryAdapter' ),
	'localstorage': require( './adapters/localStorageAdapter' ),
	'mongo':        require( './adapters/mongoAdapter' ),
	'redis':        require( './adapters/redisAdapter' ),
};
const dataSources = {};
const models = {};

/**
 * @function cloneKeysAdd
 * @description Clone keys array and add the provided value
 * @memberof Diaspora
 * @private
 * @inner
 * @author gerkin
 * @param   {String[]}	keys	Array of keys to this point.
 * @param   {String}	newKey	New key value.
 * @returns {String[]} Clone of `keys` with `newKey` added at the end
 */
function cloneKeysAdd( keys, newKey ) {
	const newKeys = _.clone( keys );
	newKeys.push( newKey );
	return newKeys;
}

const wrapDataSourceAction = ( callback, adapter ) => {
	// Filter our results
	const filterResults = ( entity, table ) => {
		// Force results to be class instances
		if ( !( entity instanceof adapter.classEntity ) && c.assigned( entity )) {
			return new adapter.classEntity( entity, adapter );
		}
		return entity;
	};

	return ( table, ...args ) => {
		const queryPromise = callback.call( adapter, table, ...args );
		return queryPromise.then( results => {
			if ( c.array( results )) {
				results = _.map( results, filterResults );
			} else {
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
	check( entity, modelDesc ) {
		// Apply method `checkField` on each field described
		return _( modelDesc )
			.mapValues(( fieldDesc, field ) => this.checkField.call( this, entity[field], fieldDesc, [ field ]))
			.values()
			.flatten()
			.compact()
			.value();
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
	 * @returns {Error[]} Array of errors
	 */
	checkField( value, fieldDesc, keys ) {
		if ( c.not.object( fieldDesc )) {
			return;
		}
		_.defaults( fieldDesc, {
			required: false,
		});

		var errors = [];

		// It the field has a `validate` property, try to use it
		if ( fieldDesc.validate ) {
			if ( !fieldDesc.validate.call( this, value, fieldDesc )) {
				errors.push( `${ keys.join( '.' ) } custom validation failed` );
			}
		}

		// Check the type and the required status
		if ( c.assigned( fieldDesc.type ) && c.assigned( fieldDesc.model )) {
			errors.push( `${ keys.join( '.' ) } spec can't have both a type and a model` );
		} else {
			// Apply the `required` modifier
			let tester = c;
			if ( fieldDesc.required !== true ) {
				tester = c.maybe;
			}
			if ( c.assigned( fieldDesc.model )) {
				let model = false;
				if ( c.string( fieldDesc.model )) {
					/*if ( _.has( collections, fieldDesc.model )) {
						model = collections[fieldDesc.model].model;
					} else {*/
					errors.push( `${ keys.join( '.' ) } spec "model" string does not match with any registered model` );
					//					}
					//				} else if ( c.instance( Backbone.RelationalModel, fieldDesc.model )) {
					//					model = fieldDesc.model;
				} else {
					errors.push( `${ keys.join( '.' ) } spec "model" must be either a string or a Backbone.RelationalModel instance` );
				}
				if ( model ) {
					if ( !tester.instance( value, model )) {
						errors.push( `${ keys.join( '.' ) } expected to be a ${ model.modelName }` );
					}
				}
			} else if ( c.string( fieldDesc.type )) {
				switch ( fieldDesc.type ) {
					case 'string': {
						if ( !tester.string( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						}
					} break;

					case 'integer': {
						if ( !tester.integer( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						}
					} break;

					case 'float': {
						if ( !tester.number( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						}
					} break;

					case 'date': {
						if ( !tester.date( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						}
					} break;

					case 'object': {
						if ( !tester.object( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						} else {
							const deepTest = c.object(
								fieldDesc.attributes
							) ? _( value ).mapValues(
									( propVal, propName ) => this.checkField(
										propVal,
										fieldDesc.attributes[propName],
										cloneKeysAdd( keys, propName )
									)
								).values().flatten().compact().value() : [];
							if ( deepTest.length !== 0 ) {
								errors = errors.concat( deepTest );
							}
						}
					} break;

					case 'array': {
						if ( !tester.array( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be a ${ fieldDesc.type }` );
						} else {
							const deepTest = c.object(
								fieldDesc.of
							) ? _( value ).map(
									( propVal, propName ) => {
										if ( c.array( fieldDesc.of )) {
											const subErrors = _( fieldDesc.of ).map( desc => this.checkField( propVal, desc, cloneKeysAdd( keys, propName )));
											if ( !_.find( subErrors, v => 0 === v.length )) {
												return subErrors;
											}
										} else {
											return this.checkField( propVal, fieldDesc.of, cloneKeysAdd( keys, propName ));
										}
									}
								).flatten().compact().value() : [];
							if ( deepTest.length !== 0 ) {
								errors = errors.concat( deepTest );
							}
						}
					} break;

					case 'any': {
						if ( !tester.assigned( value )) {
							errors.push( `${ keys.join( '.' ) } expected to be assigned with any type` );
						}
					} break;

					default: {
						errors.push( `${ keys.join( '.' ) } requires to be unhandled type ${ fieldDesc.type }` );
					} break;
				}
			} else {
				errors.push( `${ keys.join( '.' ) } spec "type" must be a string` );
			}
		}
		if ( c.assigned( fieldDesc.enum )) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( c.instance( enumVal, RegExp )) {
					return c.match( value, enumVal );
				} else {
					return c.equal( value, enumVal );
				}
			});
			if ( false === result ) {
				errors.push( `${ keys.join( '.' ) } expected to have a value` );
			}
		}
		return errors;
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
		var out;
		if ( c.not.undefined( value )) {
			out = value;
		} else {
			out = c.function( fieldDesc.default ) ? fieldDesc.default() : fieldDesc.default;
		}
		if ( 'object' === fieldDesc.type && c.nonEmptyObject( fieldDesc.attributes ) && c.assigned( out )) {
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
				if ( c.string( key ) && key.match( /^(find|update|insert|delete)(Many|One)$/ )) {
					return wrapDataSourceAction( target[key], target );
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
		if ( !c.nonEmptyString( moduleName )) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !c.nonEmptyString( name )) {
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
		if ( !c.nonEmptyString( moduleName )) {
			throw new Error( `Module name must be a non empty string, had "${ moduleName }"` );
		}
		if ( !c.nonEmptyString( name )) {
			throw new Error( `DataSource name must be a non empty string, had "${ name }"` );
		}
		if ( !c.object( modelDesc )) {
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
};

module.exports = Diaspora;

// Load Model class after, so that Model requires Diaspora once it is declared
const Model = require( './model' );
