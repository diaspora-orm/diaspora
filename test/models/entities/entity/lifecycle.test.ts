import { Diaspora } from '../../../../src/diaspora';
import { Model } from '../../../../src/model';
import { InMemoryAdapter } from '../../../../src/adapters/inMemory';
import { Entity } from '../../../../src/entities/entityFactory';
import { Set } from '../../../../src/entities/set';
import { lifecycleEvents, bindEvents, checkFlags } from '../utils';
import { createMockModel } from '../../utils';

const { model, adapter, MODEL_NAME, SOURCE } = createMockModel(
	'entity-lifecycle'
);

describe( 'Check lifecycle events', () => {
	it( 'before/after persist (create)', async () => {
		const testEntity = model.spawn( {} );
		const eventsFlags = bindEvents( 'create', testEntity );
		await testEntity.persist();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after persist (update)', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'update', testEntity );
		await testEntity.persist();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after fetch', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'find', testEntity );
		await testEntity.fetch();
		checkFlags( SOURCE, eventsFlags );
	} );
	it( 'before/after destroy', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'delete', testEntity );
		await testEntity.destroy();
		checkFlags( SOURCE, eventsFlags );
	} );
} );
