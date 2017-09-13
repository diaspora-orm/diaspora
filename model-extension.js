
'use strict';

/**
 * @function cloneKeysAdd
 * @description Clone keys array and add the provided value
 * @memberof module:ModelExtension
 * @public
 * @inner
 * @author gerkin
 * @param   {String[]}	keys	Array of keys to this point.
 * @param   {String}	newKey	New key value.
 * @returns {String[]} Clone of `keys` with `newKey` added at the end
 */
function cloneKeysAdd( keys, newKey ) {
	const newKeys = l.clone( keys );
	newKeys.push( newKey );
	return newKeys;
}

const generateUUID = () => {
	var d = new Date().getTime();
	if ( 'undefined' !== typeof window && window.performance && 'function' === typeof window.performance.now ) {
		d += performance.now(); //use high-precision timer if available
	}
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, c => {
		const r = ( d + Math.random() * 16 ) % 16 | 0;
		d = Math.floor( d / 16 );
		return ( 'x' === c ? r : ( r & 0x3 | 0x8 )).toString( 16 );
	});
	return uuid;
};

class ModelExtensionAdapter extends SequentialEvent {
	constructor( classEntity ) {
		super();
		this.classEntity = classEntity;
	}

	/**
	 * Returns a promise resolved once adapter state is ready
	 * @returns {Promise} Promise resolved when adapter is ready, and rejected if an error occured
	 */
	waitReady() {
		return new Promise(( resolve, reject ) => {
			const logReady = () => {
				ModelExtension.log.info(`Adapter ${this.name || ''} of type ${this.constructor.name} is now ready`);
			}
			if ( 'ready' === this.state ) {
				logReady();
				return resolve( this );
			}
			this.on( 'ready', () => {
				logReady();
				return resolve( this );
			}).on( 'error', err => {
				return reject( err );
			});
		});
	}
}

class InMemoryMEAdapter extends ModelExtensionAdapter {
	constructor( config ) {
		super( InMemoryEntity );
		this.state = 'ready';
		this.store = {};
	}

	getSafeTableExists( table ) {
		if ( this.store.hasOwnProperty( table )) {
			return this.store[table];
		} else {
			return this.store[table] = {
				items: [],
			};
		} 
	}

	static applyOptionsToSet( set, options ) {
		if ( options.hasOwnProperty( 'limit' )) {
			if ( c.integer( options.limit )) {
				set = set.slice( 0, options.limit );
			} else {
				ModelExtension.log.warn( `Trying to apply a non-integer limit "${ options.limit }".` );
			}
		}
		return set;
	}

	insertOne( table, entity ) {
		const storeTable = this.getSafeTableExists( table );
		entity.id = generateUUID();
		entity.idHash = {
			[this.name]: entity.id,
		};
		storeTable.items.push( entity );
		return Promise.resolve( new this.classEntity( entity ));
	}

	findOne( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const match = l.filter( storeTable.items, queryFind );
		return Promise.resolve( new this.classEntity( match[0]));
	}

	findMany( table, queryFind, options = {}) {
		const storeTable = this.getSafeTableExists( table );
		const matches = l.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		return Promise.resolve( l.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	updateOne( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const match = l.filter( storeTable.items, queryFind );
		l.assign( l.first( match ), update );
		return Promise.resolve( new this.classEntity( l.first( match )));
	}

	updateMany( table, queryFind, update, options ) {
		const storeTable = this.getSafeTableExists( table );
		const matches = l.filter( storeTable.items, queryFind );
		const reducedMatches = this.constructor.applyOptionsToSet( matches, options );
		l.forEach( reducedMatches, match => {
			l.assign( match, update );
		});
		return Promise.resolve( l.map( reducedMatches, entity => new this.classEntity( entity )));
	}

	deleteOne( table, queryFind ) {
		const storeTable = this.getSafeTableExists( table );
		storeTable.items = l.reject( storeTable.items, queryFind );
		return Promise.resolve( undefined );
	}
}

class DataStoreEntity {
	constructor( source ) {
		if ( !c.assigned( source )) {
			return undefined;
		}
		l.assign( this, source );
	}
	toObject() {
		return l.cloneDeep( this );
	}
}

class InMemoryEntity extends DataStoreEntity {
	constructor( source ) {
		super( source );
	}
}

const entityPrototype = {
	model: {
		writable:   false,
		enumerable: true, 
	},
	dataSources: {
		writable:   false,
		enumerable: true, 
	},
	toObject: {
		writable:   false,
		enumerable: true, 
	},
	persist: {
		writable:   false,
		enumerable: true, 
	},
	fetch: {
		writable:   false,
		enumerable: true, 
	},
	destroy: {
		writable:   false,
		enumerable: true, 
	},
	getState: {
		writable:   false,
		enumerable: true, 
	},
	getLastDataSource: {
		writable:   false,
		enumerable: true, 
	},
	getUidQuery: {
		writable:   false,
		enumerable: true, 
	},
	getTable: {
		writable:   false,
		enumerable: true, 
	},
};
const entityPrototypeProperties = l.keys( entityPrototype );

function EntityFactory( name, modelAttrs, model ) {
	const modelAttrsKeys = l.keys( modelAttrs );

	function Entity( source = {}) {
		// Check keys provided in source
		const sourceKeys = l.keys( source );
		// Check if there is an intersection with reserved, and have differences with model attributes
		const sourceUReserved = l.intersection( source, entityPrototypeProperties );
		if ( 0 !== sourceUReserved.length ) {
			throw new Error( `Source has reserved keys: ${ JSON.stringify( sourceUReserved ) } in ${ JSON.stringify( source ) }` );
		}
		const sourceDModel = l.difference( source, modelAttrsKeys );
		if ( 0 !== sourceDModel.length ) { // Later, add a criteria for schemaless models
			throw new Error( `Source has unknown keys: ${ JSON.stringify( sourceDModel ) } in ${ JSON.stringify( source ) }` );
		}
		// Now we know that the source is valid. First, deeply clone to detach object values from entity
		let attributes = l.cloneDeep( source );
		// Free the source
		source = null;
		// Default model attributes with our model desc
		ModelExtension.default( attributes, modelAttrs );
		// Define getters & setters
		const entityDefined = Object.defineProperties( this, l.extend({
			model: {
				value: model, 
			},
			dataSources: {
				value: Object.seal( l.mapValues( model.dataSources, () => undefined )), 
			},
			toObject: {
				value: function toObject() {
					return l.omit( attributes, entityPrototypeProperties ); 
				}, 
			},
			persist: {
				value: function persist( sourceName ) {
					const dataSource = this.model.getDataSource( sourceName );
					let promise;
				// Depending on state, we are going to perform a different operation
					if ( 'orphan' === state ) {
						promise = dataSource.insertOne( this.getTable(), this.toObject());
					} else {
						promise = dataSource.updateOne( this.getTable(), this.getUidQuery( dataSource ), this.toObject());
					}
					state = 'syncing';
					lastDataSource = dataSource.name;
					return promise.then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						return Promise.resolve( this );
					});
				}, 
			},
			fetch: {
				value: function fetch( sourceName ) {
					const dataSource = this.model.getDataSource( sourceName );
					let promise;
				// Depending on state, we are going to perform a different operation
					if ( 'orphan' === state ) {
						promise = Promise.reject( 'Can\'t fetch an orphan entity' );
					} else {
						promise = dataSource.findOne( this.getTable(), this.getUidQuery( dataSource ));
					}
					state = 'syncing';
					lastDataSource = dataSource.name;
					return promise.then( dataStoreEntity => {
						state = 'sync';
						entityDefined.dataSources[dataSource.name] = dataStoreEntity;
						attributes = dataStoreEntity.toObject();
						return Promise.resolve( this );
					});
				}, 
			},
			destroy: {
				value: function destroy( sourceName ) {
					const dataSource = this.model.getDataSource( sourceName );
					let promise;
					if ( 'orphan' === state ) {
						promise = Promise.reject( 'Can\'t destroy an orphan entity' );
					} else {
						promise = dataSource.deleteOne( this.getTable(), this.getUidQuery( dataSource ));
					}
					state = 'syncing';
					lastDataSource = dataSource.name;
					return promise.then( dataStoreEntity => {
					// If this was our only data source, then go back to orphan state
						if ( 0 === l.without( model.dataSources, dataSource.name ).length ) {
							state = 'orphan';
							delete attributes.id;
							delete attributes.idHash;
						} else {
							state = 'sync';
							delete attributes.idHash[dataSource.name];
						}
						entityDefined.dataSources[dataSource.name] = undefined;
						dataStoreEntity = null;
						return Promise.resolve( this );
					});
				}, 
			},
			getState: {
				value: function getState() {
					return state; 
				}, 
			},
			getLastDataSource: {
				value: function getLastDataSource() {
					return lastDataSource; 
				}, 
			},
			getUidQuery: {
				value: function getUidQuery( dataSource ) {
					return {
						id: attributes.idHash[dataSource.name],
					};
				}, 
			},
			getTable: {
				value: function getTable() {
					return name;
				}, 
			},
		}));
		const entityProxied = new Proxy( entityDefined, {
			get: ( obj, key ) => {
				//				console.log('get', {obj, key, val: entityDefined[key]});
				if ( 'constructor' === key ) {
					return entityDefined[key];
				}
				if ( entityDefined.hasOwnProperty( key )) {
					return entityDefined[key];
				}
				return attributes[key];
			},
			set: ( obj, key, value ) => {
				if ( entityDefined.hasOwnProperty( key )) {
					ModelExtension.log.warn( `Trying to define read-only key ${ key }.` );
					return value;
				}
				return attributes[key] = value;
			},
			enumerate: obj => {
				return l.keys( attributes );
			},
			has: ( obj, key ) => {
				return attributes.hasOwnProperty( key );
			},
		});
		// Stores the object state
		let state = 'orphan';
		let lastDataSource = null;
		return entityProxied;
	}
	const EntityWrapped = Object.defineProperties( Entity, {
		name: {
			value:      `${ name  }Entity`,
			writable:   false,
			enumerable: true, 
		},
		model: {
			value:      model,
			writable:   false,
			enumerable: true, 
		},
	});
	return EntityWrapped;
}

class Model {
	constructor( moduleName, name, modelDesc ) {
		const reservedPropIntersect = l.intersection( entityPrototypeProperties, l.keys( modelDesc.attributes ));
		if ( 0 !== reservedPropIntersect.length ) {
			throw new Error( `${ JSON.stringify( reservedPropIntersect ) } is/are reserved property names. To match those column names in data source, please use the data source mapper property` );
		}
		if ( !modelDesc.hasOwnProperty( 'sources' ) || !( c.array( modelDesc.sources ) || c.object( modelDesc.sources ))) {
			throw new TypeError( `Expect model sources to be either an array or an object, had ${ JSON.stringify( modelDesc.sources ) }.` );
		}
		// List sources required by this model
		const sourceNames = c.object( modelDesc.sources ) ? l.keys( modelDesc.sources ) : modelDesc.sources;
		// Get sources. Later, implement scoping so that modules A requiring module B can access dataSources from module B
		const scopeAvailableSources = dataSources[moduleName];
		const modelSources = l.pick( scopeAvailableSources, sourceNames );
		// console.log({scopeAvailableSources, modelSources});
		const missingSources = l.difference( sourceNames, l.keys( modelSources ));
		if ( 0 !== missingSources.length ) {
			throw new Error( `Missing data sources ${ missingSources.map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		this.dataSources = modelSources;
		this.defaultDataSource = sourceNames[0];
		this.name = name;
		this.entityFactory = EntityFactory( name, modelDesc.attributes, this );
	}

	getDataSource( sourceName ) {
		if ( !c.assigned( sourceName )) {
			sourceName = this.defaultDataSource;
		} else if ( !this.dataSources.hasOwnProperty( sourceName )) {
			throw new Error( `Unknown data source "${ sourceName }" in model "${ name }", available are ${ l.keys( this.dataSources ).map( v => `"${ v }"` ).join( ', ' ) }` );
		}
		return this.dataSources[sourceName];
	}

	spawn( source ) {
		const newEntity = new this.entityFactory( source );
		return newEntity;
	}

	spawnMulti( sources ) {
		return l.map( sources, source => this.spawn( source ));
	}

	insert( source, dataSourceName ) {
		const newItem = this.spawn( source );
		return newItem.persist( dataSourceName );
	}

	insertMany( sources, dataSourceName ) {
		const newItems = this.spawnMulti( sources );
		return Promise.map( newItems, item => item.persist( dataSourceName ));
	}

	find( queryFind = {}, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( c.string( queryFind ) && !c.assigned( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findOne( this.name, queryFind, options ).then( dataSourceEntity => {
			const newEntity = new this.entityFactory( dataSourceEntity.toObject());
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	findMany( queryFind = {}, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		} else if ( c.string( queryFind ) && !c.assigned( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = queryFind;
			queryFind = {};
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.findMany( this.name, queryFind, options ).then( dataSourceEntities => {
			const entities = l.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity.toObject());
				newEntity.dataSources[dataSource.name] = dataSourceEntity;
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}

	update( queryFind, update, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateOne( this.name, queryFind, update, options ).then( dataSourceEntity => {
			const newEntity = new this.entityFactory( dataSourceEntity.toObject());
			newEntity.dataSources[dataSource.name] = dataSourceEntity;
			return Promise.resolve( newEntity );
		});
	}

	updateMany( queryFind, update, options = {}, dataSourceName ) {
		if ( c.string( options ) && !c.assigned( dataSourceName )) {
			dataSourceName = options;
			options = {};
		}
		const dataSource = this.getDataSource( dataSourceName );
		return dataSource.updateMany( this.name, queryFind, update, options ).then( dataSourceEntities => {
			const entities = l.map( dataSourceEntities, dataSourceEntity => {
				const newEntity = new this.entityFactory( dataSourceEntity.toObject());
				newEntity.dataSources[dataSource.name] = dataSourceEntity;
				return newEntity;
			});
			return Promise.resolve( entities );
		});
	}
}

const dataSources = {};
const models = {};

let ModelExtension;
define( 'ModelExtension', {
	name:            'ModelExtension',
	slug:            'ModelExtension',
	version:         '0.0.1',
	environment:     [ 'node', 'browser' ],
	dependencies:    [],
	rawDependencies: [],
	load( context, config ) {
		ModelExtension = this;

		this.log.verbose( 'Inited ModelExtension' );
		const adapters = {
			'in-memory': InMemoryMEAdapter,
		};
		l.assign( this, {
			/**
			 * @function check
			 * @description Check if the value matches the field description provided, thus verify if it is valid
			 * @memberof module:ModelExtension.ModelExtension
			 * @author gerkin
			 * @param   {Object} entity    Entity to check
			 * @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
			 * @returns {Error[]} Array of errors
			 */
			check( entity, modelDesc ) {
				// Apply method `checkField` on each field described
				return l( modelDesc )
					.mapValues(( fieldDesc, field ) => this.checkField.call( this, entity[field], fieldDesc, [ field ]))
					.values()
					.flatten()
					.compact()
					.value();
			},
			/**
			 * @function checkField
			 * @description Check if the value matches the field description provided, thus verify if it is valid
			 * @memberof module:ModelExtension.ModelExtension
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
				l.defaults( fieldDesc, {
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
							if ( l.has( collections, fieldDesc.model )) {
								model = collections[fieldDesc.model].model;
							} else {
								errors.push( `${ keys.join( '.' ) } spec "model" string does not match with any registered model` );
							}
						} else if ( c.instance( Backbone.RelationalModel, fieldDesc.model )) {
							model = fieldDesc.model;
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
									) ? l( value ).mapValues(
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
									) ? l( value ).map(
										( propVal, propName ) => {
											if ( c.array( fieldDesc.of )) {
												const subErrors = l( fieldDesc.of ).map( desc => this.checkField( propVal, desc, cloneKeysAdd( keys, propName )));
												if ( !l.find( subErrors, v => 0 === v.length )) {
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
					const result = l.some( fieldDesc.enum, enumVal => {
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
			 * @memberof module:ModelExtension.ModelExtension
			 * @author gerkin
			 * @param   {Object} entity    Entity to set defaults in
			 * @param   {module:ModelExtension.ModelPrototype} modelDesc Model description
			 * @returns {Object} Entity merged with default values
			 */
			default( entity, modelDesc ) {
				// Apply method `defaultField` on each field described
				return l.defaults(
					entity,
					l.mapValues(
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
			 * @memberof module:ModelExtension.ModelExtension
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
				const newDataSource = new adapters[adapter]( config );
				return newDataSource;
			},
			/**
			 * Stores the data source with provided label
			 * @throws {Error} [[Description]]
			 * @param {String} moduleName       Module declaring this datasource. Modules requiring the provided dataSource will be able to use this dataSource using the `name` provided
			 * @param {String} name       Name associated with this datasource
			 * @param {ModelExtensionAdapter} dataSource Datasource itself
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
				if ( !( dataSource instanceof ModelExtensionAdapter )) {
					throw new Error( 'DataSource must be an instance inheriting "ModelExtensionAdapter"' );
				}
				dataSource.name = name;
				l.assign( dataSources, {
					[moduleName]: {},
				});
				dataSources[moduleName][name] = dataSource;
			},
			/**
			 * Create a new Model with provided description
			 * @throws {Error} [[Description]]
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
				l.assign( models, {
					[moduleName]: {},
				});
				models[moduleName][name] = model;
				return model;
			},
		});
		if ( true === this.DEBUG ) {
			this.dataSources = dataSources;
			this.models = models;
		}
		return this;
	},
});
