import { createMockModel } from '../../utils';

const { model, MODEL_NAME, SOURCE } = createMockModel(
	'entity-various'
);

it( 'Diff on entity', async () => {
	const object = {
		foo: 'bar',
	};
	const testedEntity = await model.insert( object );
	expect( testedEntity ).toBeAnEntity( model, object, SOURCE );
	
	testedEntity.attributes.foo = 'baz';
	expect( testedEntity.getDiff() ).toEqual( {foo: 'baz'} );
	
	testedEntity.attributes.qux = 1;
	expect( testedEntity.getDiff() ).toEqual( {foo: 'baz', qux: 1} );
	
	testedEntity.attributes.foo = undefined;
	expect( testedEntity.getDiff() ).toEqual( {foo: undefined, qux: 1} );
	
	testedEntity.attributes.qux = undefined;
	expect( testedEntity.getDiff() ).toEqual( {foo: undefined} );
} );
describe( 'Replace entity', () => {
	it( 'from spawn', async () => {
		const entity = model.spawn( {foo:1} );
		expect( entity ).toBeAnEntity( model, {foo:1}, true );
		entity.replaceAttributes( {bar:'qux'} );
		expect( entity.attributes ).toEqual( {bar:'qux'} );
		const insertedEntity = await entity.persist();
		expect( insertedEntity.attributes ).toEqual( {bar:'qux'} );
		insertedEntity.replaceAttributes( {baz:'quux'} );
		const updatedEntity = await insertedEntity.persist();
		expect( updatedEntity.attributes ).toEqual( {baz:'quux'} );
	} );
	it( 'from retrieving', async () => {
		await model.insert( {foo:'123'} );
		
		const retrievedEntity = await model.find( {foo:'123'} );
		expect( retrievedEntity ).toBeAnEntity( model, {foo:'123'}, false );
		retrievedEntity.replaceAttributes( {bar:'qux'} );
		expect( retrievedEntity.attributes ).toEqual( {bar:'qux'} );
		const replacedEntity = await retrievedEntity.persist();
		expect( replacedEntity.attributes ).toEqual( {bar:'qux'} );
		replacedEntity.replaceAttributes( {baz:'quux'} );
		const updatedEntity = await replacedEntity.persist();
		expect( updatedEntity.attributes ).toEqual( {baz:'quux'} );
	} );
} );
