import { createMockModel } from '../../utils';
import { bindEvents, checkFlags } from '../utils';

const { model, adapter, MODEL_NAME, SOURCE } = createMockModel( 'set-lifecycle' );

describe( 'Check lifecycle events', () => {
	it( 'before/after persist (create)', async () => {
		const testEntities = model.spawnMany( [{}, { foo: 'bar' }] );
		const eventsFlags = bindEvents( 'create', testEntities );
		await testEntities.persist();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after persist (update)', async () => {
		const testEntities = model.spawnMany( [{}, { foo: 'bar' }] );
		await testEntities.persist();
		const eventsFlags = bindEvents( 'update', testEntities );
		await testEntities.persist();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after fetch', async () => {
		const testEntities = model.spawnMany( [{}, { foo: 'bar' }] );
		await testEntities.persist();
		const eventsFlags = bindEvents( 'find', testEntities );
		await testEntities.fetch();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after destroy', async () => {
		const testEntities = model.spawnMany( [{}, { foo: 'bar' }] );
		await testEntities.persist();
		const eventsFlags = bindEvents( 'delete', testEntities );
		await testEntities.destroy();
		checkFlags( SOURCE, eventsFlags );
	} );
} );
