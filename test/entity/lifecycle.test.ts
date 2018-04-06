import * as _ from 'lodash';

import { Diaspora } from '../../src/diaspora';
import { lifecycleEvents, createMockModel } from '../utils';
import { Model } from '../../src/model';
import { InMemoryAdapter } from '../../src/adapters/inMemory';
import { Entity } from '../../src/entity/entityFactory';
import { IEventHandler } from 'sequential-event';
import { Set } from '../../src/entity/set';

const { model, adapter, MODEL_NAME, SOURCE } = createMockModel(
	'entity-lifecycle'
);

export interface IEventMock {
	mock: IEventHandler | IEventHandler[];
	index: number;
	name: string;
}

export const bindEvents = ( category: string, entity: Entity | Set ) => {
	const eventCatList: string[] = lifecycleEvents[category];
	const eventsFlags: IEventMock[] = _.map(
		eventCatList,
		( eventName: string, eventIndex ) => ( {
			mock: [jest.fn( () => eventIndex ), jest.fn()],
			index: eventIndex,
			name: eventName,
		} )
	);

	_.forEach( eventsFlags, eventDescriptor => {
		const parts = _.partition( eventsFlags, eventFlags => {
			return eventDescriptor.index <= eventFlags.index;
		} );
		const bindEntity = ( entity: Entity ) => {
			entity.once( eventDescriptor.name, () => {
				_.forEach( parts[0], subEventDescriptor => {
					_.chain( subEventDescriptor.mock )
						.castArray()
						.forEach( mock => {
							expect( mock ).not.toHaveBeenCalledTimes( 1 );
						} );
				} );
				_.forEach( parts[1], subEventDescriptor => {
					_.chain( subEventDescriptor.mock )
						.castArray()
						.forEach( mock => {
							expect( mock ).toHaveBeenCalledTimes( 1 );
						} );
				} );
			} );
			entity.on( eventDescriptor.name, eventDescriptor.mock );
		};
		if ( entity instanceof Entity ) {
			bindEntity( entity );
		} else {
			entity.entities.forEach( bindEntity );
		}
	} );
	return eventsFlags;
};
export const checkFlags = ( eventsFlags: IEventMock[] ) => {
	_.forEach( eventsFlags, eventFlags => {
		_.chain( eventFlags.mock )
			.castArray()
			.forEach( ( mock, index ) => {
				expect( mock ).toHaveBeenCalledTimes( 1 );
				if ( index > 0 ) {
					expect( mock ).toHaveBeenCalledWith( SOURCE, {}, eventFlags.index );
				} else {
					expect( mock ).toHaveBeenCalledWith( SOURCE, {} );
				}
			} );
	} );
};

describe( 'Check lifecycle events', () => {
	it( 'before/after persist (create)', async () => {
		const testEntity = model.spawn( {} );
		const eventsFlags = bindEvents( 'create', testEntity );
		await testEntity.persist();
		checkFlags( eventsFlags );
	} );
	it( 'before/after persist (update)', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'update', testEntity );
		await testEntity.persist();
		checkFlags( eventsFlags );
	} );
	it( 'before/after fetch', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'find', testEntity );
		await testEntity.fetch();
		checkFlags( eventsFlags );
	} );
	it( 'before/after destroy', async () => {
		const testEntity = model.spawn( {} );
		await testEntity.persist();
		const eventsFlags = bindEvents( 'delete', testEntity );
		await testEntity.destroy();
		checkFlags( eventsFlags );
	} );
} );
