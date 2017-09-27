'use strict';

let testModel;
const modelName = 'testModel';
const SOURCE = 'inMemory';
it( 'Should create a model', () => {
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
		});
		it( 'Create multiple instances', () => {
			expect( testModel ).to.respondTo( 'insertMany' );
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