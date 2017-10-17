'use strict';

/* globals it: false, require: false, expect: false, Diaspora: false */

let testModel;
const MODEL_NAME = 'validatedModel';
const SOURCE = 'inMemory';
const ValidationError = Diaspora.components.ValidationError;


it( 'Should create a model', () => {
	testModel = Diaspora.declareModel( MODEL_NAME, {
		sources:    [ SOURCE ],
		schema:     false,
		attributes: {
			prop1: {
				type: 'string',
			},
			prop2: {
				type:     'integer',
				enum:     [ 1, 2, 3, 4, 'foo' ],
				required: true,
			},
			prop3: {
				type:    'float',
				default: 0.1,
			},
		},
	});
	expect( testModel ).to.be.an( 'object' );
	if ( 'undefined' === typeof window ) {
		expect( testModel.constructor.name ).to.be.eql( 'Model' );
	}
});
it( 'Should reject persistance of badly configured entities.', () => {
	const fail1 = testModel.spawn({
		prop1: 1,
		prop2: 2,
	}).persist();
	const fail2 = testModel.spawn({
		prop2: 0,
	}).persist();
	const fail3 = testModel.spawn({
		prop2: 'foo',
	}).persist();
	const fail4 = testModel.spawn({}).persist();
	return Promise.all([
		expect( fail1 ).to.be.rejectedWith( ValidationError ),
		expect( fail1 ).to.be.rejectedWith( /(\W|^)prop1\W.*\Wstring(\W|$)/m ),
		expect( fail2 ).to.be.rejectedWith( ValidationError ),
		expect( fail2 ).to.be.rejectedWith( /(\W|^)prop2\W.*\Wenumerat(ed|ion)(\W|$)/m ),
		expect( fail3 ).to.be.rejectedWith( ValidationError ),
		expect( fail3 ).to.be.rejectedWith( /(\W|^)prop2\W.*\Winteger(\W|$)/m ),
		expect( fail4 ).to.be.rejectedWith( ValidationError ),
		expect( fail4 ).to.be.rejectedWith( /(\W|^)prop2\W(?=.*\Winteger(\W|$))(?=.*\Wrequired(\W|$))/m ),
	]);
});
it( 'Should define default values on valid items', () => {
	return Promise.all([
		testModel.spawn({
			prop2: 2,
		}).persist().then( entity => {
			expect( entity ).to.be.an.entity( testModel, {
				prop2: 2,
				prop3: 0.1,
			}, 'inMemory' );
		}),
		testModel.spawn({
			prop2: 3,
			prop3: 12,
		}).persist().then( entity => {
			expect( entity ).to.be.an.entity( testModel, {
				prop2: 3,
				prop3: 12,
			}, 'inMemory' );
		}),
	]);
});
/*it( 'Should be able to create multiple entities.', () => {
	const objects = [
		{
			foo: 'bar', 
		},
		undefined,
	];
	const entities = testModel.spawnMulti( objects );
	expect( entities ).to.be.a.set.of.entity( testModel, objects, true ).that.have.lengthOf( 2 );
});
describe( 'Should be able to use model methods to find, update, delete & create', () => {
	describe( '- Create instances', () => {
		it( 'Create a single instance', () => {
			expect( testModel ).to.respondTo( 'insert' );
			const object = {
				foo: 'bar', 
			};
			return testModel.insert( object ).then( newEntity => {
				expect( newEntity ).to.be.an.entity( testModel, object, 'inMemory' );
				return Promise.resolve();
			});
		});
		it( 'Create multiple instances', () => {
			expect( testModel ).to.respondTo( 'insertMany' );
			const objects = [
				{
					foo: 'baz', 
				},
				undefined,
				{
					foo: undefined, 
				},
				{
					foo: 'baz', 
				},
			];
			return testModel.insertMany( objects ).then( newEntities => {
				expect( newEntities ).to.be.a.set.of.entity( testModel, objects, 'inMemory' ).that.have.lengthOf( 4 );
				return Promise.resolve();
			});
		});
	});
	describe( '- Find instances', () => {
		function checkFind( query, many = true ) {
			return testModel[many ? 'findMany' : 'find']( query ).then( foundEntities => {
				if ( many ) {
					expect( foundEntities ).to.be.a.set.of.entity( testModel, query, SOURCE );
				} else if ( c.assigned( foundEntities )) {
					expect( foundEntities ).to.be.an.entity( testModel, query, SOURCE );
				}
				return Promise.resolve( foundEntities );
			});
		}
		it( 'Find a single instance', () => {
			expect( testModel ).to.respondTo( 'find' );
			return Promise.mapSeries([
				{
					foo: undefined, 
				},
				{
					foo: 'baz', 
				},
				{
					foo: 'bar', 
				},
			], item => checkFind( item, false ));
		});
		it( 'Find multiple instances', () => {
			expect( testModel ).to.respondTo( 'findMany' );
			return Promise.mapSeries([
				{
					query: {
						foo: undefined, 
					},
					length: 2,
				},
				{
					query: {
						foo: 'baz', 
					},
					length: 2,
				},
				{
					query: {
						foo: 'bar', 
					},
					length: 1,
				},
			], item => checkFind( item.query, true ).then( foundEntities => {
				expect( foundEntities ).to.have.lengthOf( item.length );
			}));
		});
		it( 'Find all instances', () => {
			return testModel.findMany({}).then( foundEntities => {
				expect( foundEntities ).to.have.lengthOf( 5 );
			});
		});
	});
	describe( '- Update instances', () => {
		function checkUpdate( query, update, many = true ) {
			return testModel[many ? 'updateMany' : 'update']( query, update ).then( updatedEntities => {
				if ( many ) {
					expect( updatedEntities ).to.be.a.set.of.entity( testModel, update, SOURCE );
				} else if ( c.assigned( updatedEntities )) {
					expect( updatedEntities ).to.be.an.entity( testModel, update, SOURCE );
				}
				return Promise.resolve( updatedEntities );
			});
		}
		it( 'Update a single instance', () => {
			expect( testModel ).to.respondTo( 'update' );
			return Promise.resolve()
				.then(() => checkUpdate({
				foo: undefined,
			}, {
				foo: 'qux',
			}, false ))
				.then(() => checkUpdate({
				foo: 'baz',
			}, {
				foo: 'qux',
			}, false ))
				.then(() => checkUpdate({
				foo: 'bar',
			}, {
				foo: undefined,
			}, false ));
		});
		it( 'Update multiple instances', () => {
			//process.exit()
			expect( testModel ).to.respondTo( 'updateMany' );
			return Promise.resolve()
				.then(() => checkUpdate({
				foo: undefined,
			}, {
				foo: 'bar',
			}, true ).then( foundEntities => {
				expect( foundEntities ).to.have.lengthOf( 2 );
				return Promise.resolve();
			}))
				.then(() => checkUpdate({
				foo: 'baz',
			}, {
				foo: undefined,
			}, true ).then( foundEntities => {
				expect( foundEntities ).to.have.lengthOf( 1 );
				return Promise.resolve();
			}))
				.then(() => checkUpdate({
				foo: 'bat',
			}, {
				foo: 'twy',
			}, true )
					  .then( foundEntities => {
				expect( foundEntities ).to.have.lengthOf( 0 );
				return Promise.resolve();
			}));
		});
	});
	describe( '- Delete instances', () => {
		function checkDestroy( query, many = true ) {
			return testModel.findMany( query ).then( entities => {
				return Promise.resolve( entities.length );
			}).then( beforeCount => {
				return testModel[many ? 'deleteMany' : 'delete']( query ).then(() => Promise.resolve( beforeCount ));
			}).then( beforeCount => {
				return testModel.findMany( query ).then( entities => {
					return Promise.resolve({
						before: beforeCount,
						after:  entities.length,
					});
				});
			}).then( result => {
				if ( many || 0 === result.before ) {
					expect( result.after ).to.be.equal( 0 );
				} else {
					expect( result.after ).to.be.equal( result.before - 1 );
				}
			});
		}
		it( 'Delete a single instance', () => {
			expect( testModel ).to.respondTo( 'delete' );
			return Promise.resolve()
				.then(() => checkDestroy({
				foo: undefined,
			}, false ))
				.then(() => checkDestroy({
				foo: 'bar',
			}, false ));
		});
		it( 'Delete multiple instances', () => {
			expect( testModel ).to.respondTo( 'deleteMany' );
			return Promise.resolve().then(() => checkDestroy({
				foo: undefined,
			}, true )).then(() => checkDestroy({
				foo: 'baz',
			}, true )).then(() => checkDestroy({
				foo: 'qux',
			}, true ));
		});
		it( 'Delete all instances', () => {
			return testModel.deleteMany({});
		});
	});
});
describe( 'Should be able to persist, fetch & delete an entity of the defined model.', () => {
	it( 'Persist should change the entity', () => {
		const object = {
			foo: 'bar', 
		};
		testedEntity = testModel.spawn( object );
		expect( testedEntity ).to.be.an.entity( testModel, object, true );
		const retPromise = testedEntity.persist();
		expect( testedEntity.state).to.be.eql( 'syncing' );
		expect( testedEntity ).to.be.an.entity( testModel, object, null );
		return retPromise.then(() => {
			expect( testedEntity ).to.be.an.entity( testModel, object, SOURCE );
		});
	});
	it( 'Fetch should change the entity', () => {
		const object = {
			foo: 'bar',
		};
		return testModel.find( object ).then( entity => {
			expect( entity ).to.respondTo( 'fetch' );
			expect( entity ).to.be.an.entity( testModel, object, SOURCE );
			entity.foo = 'baz';
			expect( entity ).to.be.an.entity( testModel, {
				foo: 'baz',
			}, SOURCE );
			const retPromise = entity.fetch();
			expect( entity.state).to.be.eql( 'syncing' );
			return retPromise.then(() => {
				expect( testedEntity ).to.be.an.entity( testModel, object, SOURCE );
			});
		});
	});
	it( 'Destroy should change the entity', () => {
		const object = {
			foo: 'bar',
		};
		return testModel.find( object ).then( entity => {
			expect( entity ).to.respondTo( 'destroy' );
			expect( entity ).to.be.an.entity( testModel, object, SOURCE );
			const retPromise = entity.destroy();
			expect( entity.state).to.be.eql( 'syncing' );
			return retPromise.then(() => {
				expect( entity.lastDataSource).to.be.eql( SOURCE );
				expect( entity.state).to.be.eql( 'orphan' );
				expect( entity ).to.be.an.entity( testModel, {}, null );
			});
		});
	});
});
*/