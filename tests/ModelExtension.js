var ModelExtension;

it( 'Load', done => {
	AltCore.loadModule( 'ModelExtension' ).then( ext => {
		ModelExtension = module.ModelExtension = ext;
		done();
	}).catch( e => done( e ));
});
it( 'Collections generation', () => {
	//	console.log(module.ModelExtension.registerModel);
});
describe( '"check" feature', () => {
	it( 'Basic tests with types', () => {
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type: 'any',
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: 1,
		}, {
			test: {
				type: 'any',
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			string: 'string',
			number: 1,
			float:  1.5,
		}, {
			string: {
				type: 'string',
			},
			number: {
				type: 'integer',
			},
			float: {
				type: 'float',
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			object: {
				string: 'string',
			},
			objectUndef: {
				aze: 'hello',
			},
			array: [
				1, 2, 3,
			],
			arrayUndef: [
				1, 'aze', false, {},
			],
			arrayMultiDef: [
				1, 'aze', 1.5,
			],
		}, {
			object: {
				type:       'object',
				attributes: {
					string: {
						type: 'string',
					},
				},
			},
			objectUndef: {
				type: 'object',
			},
			array: {
				type: 'array',
				of:   {
					type: 'integer',
				},
			},
			arrayUndef: {
				type: 'array',
			},
			arrayMultiDef: {
				type: 'array',
				of:   [
					{
						type: 'float',
					},
					{
						type: 'string',
					},
				],
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			object: {
				string: null,
			},
			objectUndef: {
				aze: null,
			},
			array: [
				null,
			],
			arrayUndef: [
				1, 'aze', false, null,
			],
			arrayMultiDef: [
				1, 'aze', 1.5, null,
			],
		}, {
			object: {
				type:       'object',
				attributes: {
					string: {
						type: 'string',
					},
				},
			},
			objectUndef: {
				type: 'object',
			},
			array: {
				type: 'array',
				of:   {
					type: 'integer',
				},
			},
			arrayUndef: {
				type: 'array',
			},
			arrayMultiDef: {
				type: 'array',
				of:   [
					{
						type: 'float',
					},
					{
						type: 'string',
					},
				],
			},
		})).to.be.empty;
	});
	it( '"required" property', () => {
		expect( ModelExtension.check({
			test: 1,
		}, {
			test: {
				type:     'any',
				required: true,
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type:     'any',
				required: true,
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: null,
		}, {
			test: {
				type:     'any',
				required: true,
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			test: 'a',
		}, {
			test: {
				type:     'any',
				required: true,
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			object: {
				string: null,
			},
		}, {
			object: {
				type:       'object',
				attributes: {
					string: {
						type:     'string',
						required: true,
					},
				},
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			object: null,
		}, {
			object: {
				type:       'object',
				required:   true,
				attributes: {
					string: {
						type: 'string',
					},
				},
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			object: null,
		}, {
			object: {
				type:       'object',
				attributes: {
					string: {
						type:     'string',
						required: true,
					},
				},
			},
		})).to.be.empty;
		expect( ModelExtension.check({}, {
			rand: {
				type:     'number',
				required: true,
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			rand: null,
		}, {
			rand: {
				type:     'integer',
				required: true,
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			rand: l.random( 0, 100 ),
		}, {
			rand: {
				type:     'integer',
				required: true,
			},
		})).to.be.empty;
	});
	it( '"enum" property', () => {
		expect( ModelExtension.check({
			test: 1,
		}, {
			test: {
				type: 'any',
				enum: [ 1, 2, 'aze' ],
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type: 'string',
				enum: [ 'string', 'hello' ],
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type: 'string',
				enum: [ 'hello', 'world' ],
			},
		})).to.be.not.empty;
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type: 'string',
				enum: [ 'hello', /^str/ ],
			},
		})).to.be.empty;
		expect( ModelExtension.check({
			test: 'string',
		}, {
			test: {
				type: 'string',
				enum: [ 'hello', /^wo/ ],
			},
		})).to.be.not.empty;
	});
});
it( '"default" feature', () => {
	expect( ModelExtension.default({
		aze: 123,
	}, {
		foo: {
			type:    'text',
			default: 'bar',
		},
	})).to.deep.equal({
		aze: 123,
		foo: 'bar',
	});
	const now = l.now();
	expect( ModelExtension.default({
		aze: 123,
	}, {
		foo: {
			type:    'datetime',
			default: () => now,
		},
	})).to.deep.equal({
		aze: 123,
		foo: now,
	});
	expect( ModelExtension.default({
		aze: 'baz',
	}, {
		aze: {
			type:    'text',
			default: 'bar',
		},
	})).to.deep.equal({
		aze: 'baz',
	});
	expect( ModelExtension.default({
		aze: 'baz',
	}, {
		aze: {
			type:    'datetime',
			default: () => 'bar',
		},
	})).to.deep.equal({
		aze: 'baz',
	});
});
let inMemoryAdapter;
describe( 'Adapters', () => {
	it( 'Create in-memory adapter', done => {
		inMemoryAdapter = ModelExtension.createDataSource( 'in-memory', {});
		inMemoryAdapter.waitReady().then( adapter => {
			expect( adapter ).to.be.an( 'object' );
			expect( adapter.constructor.name ).to.be.eql( 'InMemoryMEAdapter' );
			expect( adapter ).to.satisfy( o => ( 'findOne' in o ) || ( 'findMany' in o ), 'should have at least one "find" method' );
			expect( adapter ).to.satisfy( o => ( 'deleteOne' in o ) || ( 'deleteMany' in o ), 'should have at least one "delete" method' );
			expect( adapter ).to.satisfy( o => ( 'updateOne' in o ) || ( 'updateMany' in o ), 'should have at least one "update" method' );
			expect( adapter ).to.satisfy( o => ( 'insertOne' in o ) || ( 'insertMany' in o ), 'should have at least one "insert" method' );
			return done();
		}).catch( done );
	});
	it( 'Register named in-memory dataSource', () => {
		ModelExtension.registerDataSource( 'test', 'inMemory', inMemoryAdapter );
		expect( ModelExtension.dataSources ).to.deep.equal({
			test: {
				inMemory: inMemoryAdapter,
			},
		});
	});
});
describe( 'Models', () => {
	describe( 'Simple mono-source in-memory model', () => {
		let testModel;
		let testedEntity;
		let modelName = 'testModel';
		it( 'Should create a model', () => {
			testModel = ModelExtension.declareModel( 'test', modelName, {
				sources:    [ 'inMemory' ],
				attributes: {
					foo: {
						type: 'string',
					},
				},
			});
			expect( testModel ).to.be.an( 'object' );
			expect( testModel.constructor.name ).to.be.eql( 'Model' );
		});
		it( 'Should be able to create an entity of the defined model.', () => {
			const entity1 = testModel.spawn();
			//			console.log({foo: entity1.foo, entity: entity1, keys: Object.keys(entity1), constructor: entity1.constructor});
			expect( entity1 ).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.undefined;
			expect( entity1.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
			expect( entity1 ).to.respondTo( 'toObject' );
			expect( entity1.toObject()).to.deep.equal({
				foo: undefined,
			});
			const entity2 = testModel.spawn({
				foo: 'bar',
			});
			console.log( entity2.foo, entity2 );
			expect( entity2 ).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.eql( 'bar' );
			expect( entity2.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
			expect( entity2 ).to.respondTo( 'toObject' );
			expect( entity2.toObject()).to.deep.equal({
				foo: 'bar',
			});
		});
		it( 'Should be able to create multiple entities.', () => {
			const entities = testModel.spawnMulti([
				{
					foo: 'bar',
				},
				undefined,
			]);
			expect( entities ).to.be.an( 'array' ).that.have.lengthOf( 2 );
			expect( entities[0]).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.eql( 'bar' );
			expect( entities[0]).to.respondTo( 'toObject' );
			expect( entities[0].toObject()).to.deep.equal({
				foo: 'bar',
			});
			expect( entities[1]).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.undefined;
			expect( entities[1]).to.respondTo( 'toObject' );
			expect( entities[1].toObject()).to.deep.equal({
				foo: undefined,
			});
		});
		describe( 'Should be able to persist, fetch & delete an entity of the defined model.', () => {
			it( '- Persist should change Entity', () => {
				testedEntity = testModel.spawn({
					foo: 'bar',
				});
				expect( testedEntity.getState()).to.be.eql( 'orphan' );
				expect( testedEntity.getLastDataSource()).to.be.eql( null );
				expect( testedEntity, 'id should be an undefined value or key on orphans' ).to.not.have.property( 'id' );
				expect( testedEntity, 'idHash should be an undefined value or key on orphans' ).to.not.have.property( 'idHash' );
				expect( testedEntity ).to.respondTo( 'persist' );
				const retPromise = testedEntity.persist();
				expect( testedEntity.getState()).to.be.eql( 'syncing' );
				expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
				return retPromise.then(() => {
					expect( testedEntity, 'id should be a defined value on synced items' ).to.be.an( 'object' ).that.have.property( 'id' );
					expect( testedEntity, 'idHash should be a hash on synced items' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
					expect( testedEntity.getState()).to.be.eql( 'sync' );
					expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
					return Promise.resolve();
				});
			});
			it( '- Persist changed in-Memory Datastore', () => {
				const inMemoryStore = ModelExtension.dataSources.test.inMemory;
				expect( inMemoryStore.store ).to.have.property( 'testModel' );
				const collection = inMemoryStore.store.testModel;
				expect( collection.items ).to.deep.include( testedEntity.toObject());
			});
			it( '- Fetch', () => {
				testedEntity.foo = 'baz';
				expect( testedEntity.getState()).to.be.not.eql( 'orphan' );
				expect( testedEntity.getLastDataSource()).to.be.not.eql( null );
				expect( testedEntity ).to.respondTo( 'fetch' );
				expect( testedEntity, 'id should be a defined value on synced items' ).to.be.an( 'object' ).that.have.property( 'id' );
				expect( testedEntity, 'idHash should be a hash on synced items' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
				const retPromise = testedEntity.fetch();
				expect( testedEntity.getState()).to.be.eql( 'syncing' );
				expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
				return retPromise.then(() => {
					//console.log(require('util').inspect(ModelExtension.dataSources.test.inMemory, {colors: true, depth: 8}));
					expect( testedEntity.getState()).to.be.eql( 'sync' );
					expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
					expect( testedEntity, 'id should be a defined value on synced items' ).to.be.an( 'object' ).that.have.property( 'id' );
					expect( testedEntity, 'idHash should be a hash on synced items' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
					expect( testedEntity, '"foo" should be reset to "bar"' ).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.eql( 'bar' );
					return Promise.resolve();
				});
			});
			it( '- Destroy should change the entity', () => {
				expect( testedEntity.getState()).to.be.not.eql( 'orphan' );
				expect( testedEntity.getLastDataSource()).to.be.not.eql( null );
				expect( testedEntity ).to.respondTo( 'destroy' );
				expect( testedEntity, 'id should be a defined value on synced items' ).to.be.an( 'object' ).that.have.property( 'id' );
				expect( testedEntity, 'idHash should be a hash on synced items' ).to.be.an( 'object' ).that.have.property( 'idHash' ).that.is.an( 'object' );
				const retPromise = testedEntity.destroy();
				expect( testedEntity.getState()).to.be.eql( 'syncing' );
				expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
				return retPromise.then(() => {
					//console.log(require('util').inspect(ModelExtension.dataSources.test.inMemory, {colors: true, depth: 8}));
					expect( testedEntity.getState()).to.be.eql( 'orphan' );
					expect( testedEntity.getLastDataSource()).to.be.eql( 'inMemory' );
					expect( testedEntity, 'id should be a undefined value or key on orphan items' ).to.be.an( 'object' ).that.not.have.property( 'id' );
					expect( testedEntity, 'idHash should be undefined on orphan items' ).to.be.an( 'object' ).that.not.have.property( 'idHash' );
					expect( testedEntity, '"foo" should still be set to "bar"' ).to.be.an( 'object' ).that.have.property( 'foo' ).that.is.eql( 'bar' );
					return Promise.resolve();
				});
			});
			it( '- Destroy changed in-Memory Datastore', () => {
				const inMemoryStore = ModelExtension.dataSources.test.inMemory;
				expect( inMemoryStore.store ).to.have.property( 'testModel' );
				const collection = inMemoryStore.store.testModel;
				expect( collection.items ).to.not.deep.include( testedEntity.toObject());
			});
		});
		describe( 'Should be able to use model methods to find, update, delete & create', () => {
			let entities;
			describe( '- Create instances', () => {
				it( 'Create a single instance', () => {
					expect( testModel ).to.respondTo( 'insert' );
					return testModel.insert({
						foo: 'bar',
					}).then( newEntity => {
						expect( newEntity.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
						entities = [ newEntity ];
						return Promise.resolve();
					});
				});
				it( 'Create multiple instances', () => {
					expect( testModel ).to.respondTo( 'insertMany' );
					return testModel.insertMany([
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
					]).then( newEntities => {
						expect( newEntities ).to.be.an( 'array' ).that.have.lengthOf( 4 );
						l.forEach( newEntities, newEntity => {
							expect( newEntity.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
						});
						entities = entities.concat( newEntities );
						return Promise.resolve();
					});
				});
			});
			describe( '- Find instances', () => {
				function checkFind( query, many = true ) {
					return testModel[many ? 'findMany' : 'find']( query ).then( foundEntities => {
						function checkSingle( entity ) {
							l.forEach( query, ( val, key ) => {
								expect( entity ).to.have.property( key ).that.is.equal( val );
							});
						}

						if ( many ) {
							expect( foundEntities ).to.be.an( 'array' );
							l.forEach( foundEntities, checkSingle );
						} else {
							expect( foundEntities.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
							checkSingle( foundEntities );
						}
						return Promise.resolve( foundEntities );
					});
				}
				it( 'Find a single instance', () => {
					expect( testModel ).to.respondTo( 'find' );
					return Promise.all([
						checkFind({
							foo: undefined,
						}, false ),
						checkFind({
							foo: 'baz',
						}, false ),
						checkFind({
							foo: 'bar',
						}, false ),
					]);
				});
				it( 'Find multiple instances', () => {
					expect( testModel ).to.respondTo( 'findMany' );
					return Promise.all([
						checkFind({
							foo: undefined,
						}, true ).then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 2 );
						}),
						checkFind({
							foo: 'baz',
						}, true ).then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 2 );
						}),
						checkFind({
							foo: 'bar',
						}, true ).then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 1 );
						}),
					]);
				});
			});
			describe( '- Update instances', () => {
				function checkUpdate( query, update, many = true ) {
					return testModel[many ? 'updateMany' : 'update']( query, update ).then( updatedEntities => {
						function checkSingle( entity ) {
							l.forEach( update, ( val, key ) => {
								expect( entity ).to.have.property( key ).that.is.equal( val );
							});
						}

						if ( many ) {
							expect( updatedEntities ).to.be.an( 'array' );
							l.forEach( updatedEntities, checkSingle );
						} else {
							expect( updatedEntities.constructor ).to.have.property( 'name' ).that.is.equal( `${ modelName  }Entity` );
							checkSingle( updatedEntities );
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
					expect( testModel ).to.respondTo( 'updateMany' );
					return Promise.resolve()
						.then(() => checkUpdate({
							foo: undefined,
						}, {
							foo: 'bar',
						}, true ).then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 2 );
						}))
						.then(() => checkUpdate({
							foo: 'baz',
						}, {
							foo: undefined,
						}, true ).then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 1 );
						}))
						.then(() => checkUpdate({
							foo: 'bat',
						}, {
							foo: 'twy',
						}, true )
						.then( foundEntities => {
							expect( foundEntities ).to.have.lengthOf( 0 );
						}));
				});
			});
		});
	});
});
