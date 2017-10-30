'use strict';

/* globals l: false, it: false, describe: false, require: false, expect: false, Diaspora: false */

let testModel;
let testEntity;
let testSet;
const MODEL_NAME = 'testModelComponents';
const SOURCE = 'inMemory';


it( 'Should create a model', () => {
	testModel = Diaspora.declareModel( MODEL_NAME, {
		sources:    [ SOURCE ],
		schema:     false,
		attributes: {},
	});
	expect( testModel ).to.be.an( 'object' );
	if ( !process.browser ) {
		expect( testModel.constructor.name ).to.be.eql( 'Model' );
	}
	testEntity = testModel.spawn({});
	testSet = testModel.spawnMany([{}, {}]);
});
const randomTimeout = ( time ) => {
	//return Promise.resolve();
	return new Promise( resolve => {
		setTimeout( resolve, time || l.random( 0, 100 ));
	});
};
const events = {
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
	find: [
		'beforeFetch',
		'afterFetch',
	],
	delete: [
		'beforeDestroy',
		'afterDestroy',
	],
};
describe( 'Test entity', () => {
	describe( 'Check lifecycle events', () => {
		it( 'before/after persist (create)', () => {
			const eventCat = 'create';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, l.constant( false )));
			l.forEach( eventCatList, ( eventName, eventIndex ) => {
				const parts = l.partition( eventCatList, subEventName => {
					const subEventIndex = l.indexOf( eventCatList, subEventName );
					return eventIndex <= subEventIndex;
				});
				testEntity.once( eventName, () => {
					l.forEach( parts[0], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
					});
					l.forEach( parts[1], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
					return randomTimeout().then(() => {
						eventsFlags[eventCatList[eventIndex]] = true;
					});
				});
			});
			return testEntity.persist().then(() => {
				l.forEach( eventsFlags, ( eventFlag, eventName ) => {
					expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
				});
			});
		});
		it( 'before/after persist (update)', () => {
			const eventCat = 'update';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, l.constant( false )));
			l.forEach( eventCatList, ( eventName, eventIndex ) => {
				const parts = l.partition( eventCatList, subEventName => {
					const subEventIndex = l.indexOf( eventCatList, subEventName );
					return eventIndex <= subEventIndex;
				});
				testEntity.once( eventName, () => {
					l.forEach( parts[0], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
					});
					l.forEach( parts[1], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
					return randomTimeout().then(() => {
						eventsFlags[eventCatList[eventIndex]] = true;
					});
				});
			});
			return testEntity.persist().then(() => {
				l.forEach( eventsFlags, ( eventFlag, eventName ) => {
					expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
				});
			});
		});
		it( 'before/after fetch', () => {
			const eventCat = 'find';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, l.constant( false )));
			l.forEach( eventCatList, ( eventName, eventIndex ) => {
				const parts = l.partition( eventCatList, subEventName => {
					const subEventIndex = l.indexOf( eventCatList, subEventName );
					return eventIndex <= subEventIndex;
				});
				testEntity.once( eventName, () => {
					l.forEach( parts[0], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
					});
					l.forEach( parts[1], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
					return randomTimeout().then(() => {
						eventsFlags[eventCatList[eventIndex]] = true;
					});
				});
			});
			return testEntity.fetch().then(() => {
				l.forEach( eventsFlags, ( eventFlag, eventName ) => {
					expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
				});
			});
		});
		it( 'before/after destroy', () => {
			const eventCat = 'delete';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, l.constant( false )));
			l.forEach( eventCatList, ( eventName, eventIndex ) => {
				const parts = l.partition( eventCatList, subEventName => {
					const subEventIndex = l.indexOf( eventCatList, subEventName );
					return eventIndex <= subEventIndex;
				});
				testEntity.once( eventName, () => {
					l.forEach( parts[0], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
					});
					l.forEach( parts[1], subEventName => {
						expect( eventsFlags[subEventName], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
					return randomTimeout().then(() => {
						eventsFlags[eventCatList[eventIndex]] = true;
					});
				});
			});
			return testEntity.destroy().then(() => {
				l.forEach( eventsFlags, ( eventFlag, eventName ) => {
					expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
				});
			});
		});
	});
});

describe( 'Test set', () => {
	describe( 'Check lifecycle events', () => {
		it( 'before/after persist (create)', () => {
			const eventCat = 'create';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, () => l.times( testSet.length, l.constant( false ))));
			testSet.forEach(( entity, entityIndex ) => {
				l.forEach( eventCatList, ( eventName, eventIndex ) => {
					const parts = l.partition( eventCatList, subEventName => {
						const subEventIndex = l.indexOf( eventCatList, subEventName );
						return eventIndex <= subEventIndex;
					});
					entity.once( eventName, () => {
						l.forEach( parts[0], subEventName => {
							expect( eventsFlags[subEventName][entityIndex], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
						});
						l.forEach( parts[1], subEventName => {
							expect( eventsFlags[subEventName][entityIndex], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
						});
						return randomTimeout( /*index * 50*/ ).then(() => {
							eventsFlags[eventCatList[eventIndex]][entityIndex] = true;
						});
					});
				});
			});
			return testSet.persist().then(() => {
				l.forEach( eventsFlags, eventFlagEntity => {
					l.forEach( eventFlagEntity, ( eventFlag, eventName ) => {
						expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
				});
			});
		});
		it( 'before/after persist (update)', () => {
			const eventCat = 'update';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, () => l.times( testSet.length, l.constant( false ))));
			testSet.forEach(( entity, index ) => {
				l.forEach( eventCatList, ( eventName, eventIndex ) => {
					const parts = l.partition( eventCatList, subEventName => {
						const subEventIndex = l.indexOf( eventCatList, subEventName );
						return eventIndex <= subEventIndex;
					});
					entity.once( eventName, () => {
						l.forEach( parts[0], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
						});
						l.forEach( parts[1], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
						});
						return randomTimeout( index * 50 ).then(() => {
							eventsFlags[eventCatList[eventIndex]][index] = true;
						});
					});
				});
			});
			return testSet.persist().then(() => {
				l.forEach( eventsFlags, eventFlagEntity => {
					l.forEach( eventFlagEntity, ( eventFlag, eventName ) => {
						expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
				});
			});
		});
		it( 'before/after fetch', () => {
			const eventCat = 'find';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, () => l.times( testSet.length, l.constant( false ))));
			testSet.forEach(( entity, index ) => {
				l.forEach( eventCatList, ( eventName, eventIndex ) => {
					const parts = l.partition( eventCatList, subEventName => {
						const subEventIndex = l.indexOf( eventCatList, subEventName );
						return eventIndex <= subEventIndex;
					});
					entity.once( eventName, () => {
						l.forEach( parts[0], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
						});
						l.forEach( parts[1], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
						});
						return randomTimeout( index * 50 ).then(() => {
							eventsFlags[eventCatList[eventIndex]][index] = true;
						});
					});
				});
			});
			return testSet.fetch().then(() => {
				l.forEach( eventsFlags, eventFlagEntity => {
					l.forEach( eventFlagEntity, ( eventFlag, eventName ) => {
						expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
				});
			});
		});
		it( 'before/after destroy', () => {
			const eventCat = 'delete';
			const eventCatList = events[eventCat];
			const eventsFlags = l.zipObject( eventCatList, l.times( eventCatList.length, () => l.times( testSet.length, l.constant( false ))));
			testSet.forEach(( entity, index ) => {
				l.forEach( eventCatList, ( eventName, eventIndex ) => {
					const parts = l.partition( eventCatList, subEventName => {
						const subEventIndex = l.indexOf( eventCatList, subEventName );
						return eventIndex <= subEventIndex;
					});
					entity.once( eventName, () => {
						l.forEach( parts[0], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be false: ${ JSON.stringify( eventsFlags ) }` ).to.be.false;
						});
						l.forEach( parts[1], subEventName => {
							expect( eventsFlags[subEventName][index], `Event ${ subEventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
						});
						return randomTimeout( index * 50 ).then(() => {
							eventsFlags[eventCatList[eventIndex]][index] = true;
						});
					});
				});
			});
			return testSet.destroy().then(() => {
				l.forEach( eventsFlags, eventFlagEntity => {
					l.forEach( eventFlagEntity, ( eventFlag, eventName ) => {
						expect( eventFlag, `Event ${ eventName } should be true: ${ JSON.stringify( eventsFlags ) }` ).to.be.true;
					});
				});
			});
		});
	});
});
