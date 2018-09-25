import { Diaspora } from '../../../../src/diaspora';
import { createMockModel } from '../../utils';
import { EntityStateError } from '../../../../src/errors/entityStateError';
import { EEntityState } from '../../../../src/types/entity';

const { model, MODEL_NAME, SOURCE } = createMockModel(
	'entity-actions'
);

describe( 'Entity', () => {
	describe( 'Persist', () => {
		it( 'Persist should save the entity', async () => {
			const object = {
				foo: 'bar',
			};
			const testedEntity = model.spawn( object );
			expect( testedEntity ).toBeAnEntity( model, object, true );
			const retPromise = testedEntity.persist();
			expect( testedEntity.state ).toEqual( EEntityState.SYNCING );
			expect( testedEntity ).toBeAnEntity( model, object, null );

			await retPromise;
			expect( testedEntity ).toBeAnEntity( model, object, SOURCE );
		} );
	} );
	describe( 'Fetch', () => {
		it( 'Fetch should change the entity', async () => {
			const object = {
				foo: 'bar',
			};
			const entity = await model.find( object );
			expect( entity ).toImplementMethod( 'fetch' );
			expect( entity ).toBeAnEntity( model, object, SOURCE );
			entity.attributes.foo = 'baz';
			expect( entity ).toBeAnEntity( model, { foo: 'baz' }, SOURCE );
			const retPromise = entity.fetch();
			expect( entity.state ).toEqual( EEntityState.SYNCING );

			await retPromise;
			expect( entity ).toBeAnEntity( model, object, SOURCE );
		} );
		it( 'Fetch should be rejected with an error on orphan items', () => {
			const object = {
				foo: 'bar',
			};
			const testedEntity = model.spawn( object );
			expect( testedEntity ).toBeAnEntity( model, object, true );
			const retPromise = testedEntity.fetch();
			expect( testedEntity.state ).toEqual( EEntityState.SYNCING );
			expect( testedEntity ).toBeAnEntity( model, object, null );
			expect( retPromise ).rejects.toBeInstanceOf( EntityStateError );
		} );
	} );
	describe( 'Destroy', () => {
		it( 'Destroy should change the entity', async () => {
			const object = {
				foo: 'bar',
			};
			const entity = await model.find( object );
			expect( entity ).toImplementMethod( 'destroy' );
			expect( entity ).toBeAnEntity( model, object, SOURCE );
			const retPromise = entity.destroy();
			expect( entity.state ).toEqual( EEntityState.SYNCING );

			await retPromise;
			expect( entity.lastDataSource ).toEqual( Diaspora.dataSources[SOURCE] );
			expect( entity.state ).toEqual( 'orphan' );
			expect( entity ).toBeAnEntity( model, {}, null );
		} );
		it( 'Destroy should be rejected with an error on orphan items', () => {
			const object = {
				foo: 'bar',
			};
			const testedEntity = model.spawn( object );
			expect( testedEntity ).toBeAnEntity( model, object, true );
			const retPromise = testedEntity.destroy();
			expect( testedEntity.state ).toEqual( EEntityState.SYNCING );
			expect( testedEntity ).toBeAnEntity( model, object, null );
			expect( retPromise ).rejects.toBeInstanceOf( EntityStateError );
		} );
	} );
} );
