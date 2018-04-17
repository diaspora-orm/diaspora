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
