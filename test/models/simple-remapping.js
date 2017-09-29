'use strict';

let testModel;
let store;
const modelName = 'remapped';
const SOURCE = 'inMemory';
it( 'Should create a model', () => {
	testModel = Diaspora.declareModel( 'test', modelName, {
		sources:    {
			[ SOURCE ]: {
				foo: 'bar',
			},
		},
		attributes: {
			foo: {
				type: 'string',
			},
		},
	});
	expect( testModel ).to.be.an( 'object' );
	expect( testModel.constructor.name ).to.be.eql( 'Model' );
	store = Diaspora.dataSources.test.inMemory.store.remapped;
	console.log(store);
});
it( 'Should be able to create an entity of the defined model.', () => {
});
it( 'Should be able to create multiple entities.', () => {
});
describe( 'Should be able to use model methods to find, update, delete & create', () => {
	let entities;
	describe( '- Create instances', () => {
		it( 'Create a single instance', () => {
			expect( testModel ).to.respondTo( 'insert' );
			return testModel.insert({foo: 'baz'}).then(newItem => {
				expect( newItem ).to.be.an.entity( testModel, {foo: 'baz'}, false );
				const dataStoreItem = l.find(store.items, {id: newItem.dataSources.inMemory.id});
				expect(dataStoreItem).to.be.an('object').that.have.property('bar', 'baz').and.not.have.property('foo');
			});
		});
	});
	describe( '- Find instances', () => {
		it( 'Find a single instance', () => {
			expect( testModel ).to.respondTo( 'find' );
		});
		it( 'Find multiple instances', () => {
			expect( testModel ).to.respondTo( 'findMany' );
		});
		it( 'Find all instances', () => {
		});
	});
	describe( '- Update instances', () => {
		it( 'Update a single instance', () => {
			expect( testModel ).to.respondTo( 'update' );
		});
		it( 'Update multiple instances', () => {
			expect( testModel ).to.respondTo( 'updateMany' );
		});
	});
	describe( '- Delete instances', () => {
		it( 'Delete a single instance', () => {
			expect( testModel ).to.respondTo( 'delete' );
		});
		it( 'Delete multiple instances', () => {
			expect( testModel ).to.respondTo( 'deleteMany' );
		});
		it( 'Delete all instances', () => {
			return testModel.deleteMany({})
		});
	});
});
describe( 'Should be able to persist, fetch & delete an entity of the defined model.', () => {
	it( 'Persist should change the entity', () => {
	});
	it( 'Fetch should change the entity', () => {
	});
	it( 'Destroy should change the entity', () => {
	});
});