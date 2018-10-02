import * as _ from 'lodash';
import { IEventHandler } from 'sequential-event';

import { Entity, Set } from '../../../../src/entities';
import { IEntityAttributes } from '../../../../src/types/entity';

export const lifecycleEvents = {
	create: [
		'beforePersist',
		'beforeValidate',
		'afterValidate',
		'beforePersistCreate',
		'afterPersistCreate',
		'afterPersist',
	],
	update: [
		'beforePersist',
		'beforeValidate',
		'afterValidate',
		'beforePersistUpdate',
		'afterPersistUpdate',
		'afterPersist',
	],
	find: ['beforeFetch', 'afterFetch'],
	delete: ['beforeDestroy', 'afterDestroy'],
};


export interface IEventMock {
	mock: IEventHandler | IEventHandler[];
	index: number;
	name: string;
}

export const bindEvents = <TEntity extends IEntityAttributes>( category: string, entity: Entity<TEntity> | Set<TEntity> ) => {
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
		const parts = _.partition( eventsFlags, eventFlags =>
			eventDescriptor.index <= eventFlags.index );
		const bindEntity = ( entity: Entity<TEntity> ) => {
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
export const checkFlags = ( sourceName: string, eventsFlags: IEventMock[] ) => {
	_.forEach( eventsFlags, eventFlags => {
		_.chain( eventFlags.mock )
			.castArray()
			.forEach( ( mock, index ) => {
				expect( mock ).toHaveBeenCalledTimes( 1 );
				if ( index > 0 ) {
					expect( mock ).toHaveBeenCalledWith( sourceName, {}, eventFlags.index );
				} else {
					expect( mock ).toHaveBeenCalledWith( sourceName, {} );
				}
			} );
	} );
};
