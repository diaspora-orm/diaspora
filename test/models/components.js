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
	testSet = testModel.spawnMulti([{}, {}]);
});
const randomTimeout = ( time ) => {
	return new Promise( resolve => {
		setTimeout( resolve, time || l.random( 0, 100 ));
	});
};
describe( 'Test entity', () => {
	describe( 'Check events', () => {
		it( 'before/after update', () => {
			let beforeCalled = false;
			let afterCalled = false;
			testEntity.on( 'beforeUpdate', () => {
				expect( beforeCalled ).to.be.false;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					beforeCalled = true;
				});
			});
			testEntity.on( 'afterUpdate', () => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					afterCalled = true;
				});
			});
			return testEntity.persist().then(() => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.true;
			});
		});
		it( 'before/after find', () => {
			let beforeCalled = false;
			let afterCalled = false;
			testEntity.on( 'beforeFind', () => {
				expect( beforeCalled ).to.be.false;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					beforeCalled = true;
				});
			});
			testEntity.on( 'afterFind', () => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					afterCalled = true;
				});
			});
			return testEntity.fetch().then(() => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.true;
			});
		});
		it( 'before/after delete', () => {
			let beforeCalled = false;
			let afterCalled = false;
			testEntity.on( 'beforeDelete', () => {
				expect( beforeCalled ).to.be.false;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					beforeCalled = true;
				});
			});
			testEntity.on( 'afterDelete', () => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.false;
				return randomTimeout().then(() => {
					afterCalled = true;
				});
			});
			return testEntity.destroy().then(() => {
				expect( beforeCalled ).to.be.true;
				expect( afterCalled ).to.be.true;
			});
		});
	});
});

describe( 'Test set', () => {
	describe( 'Check events', () => {
		it( 'before/after update', () => {
			let beforeCalled = l.times( testSet.length, l.constant( false ));
			let afterCalled = l.times( testSet.length, l.constant( false ));
			testSet.forEach(( entity, index ) => {
				entity.on( 'beforeUpdate', () => {
					expect( beforeCalled[index]).to.be.false;
					testSet.forEach(( subentity, subindex ) => {
						expect( afterCalled[subindex]).to.be.false;
					});
					return randomTimeout( index * 20 ).then(() => {
						beforeCalled[index] = true;
					});
				});
				entity.on( 'afterUpdate', () => {
					testSet.forEach(( subentity, subindex ) => {
						expect( beforeCalled[subindex]).to.be.true;
					});
					expect( afterCalled[index]).to.be.false;
					return randomTimeout( index * 20 ).then(() => {
						afterCalled[index] = true;
					});
				});
			});
			return testSet.persist().then(() => {
				testSet.forEach(( subentity, subindex ) => {
					expect( beforeCalled[subindex]).to.be.true;
					expect( afterCalled[subindex]).to.be.true;
				});
			});
		});
		it( 'before/after find', () => {
			let beforeCalled = l.times( testSet.length, l.constant( false ));
			let afterCalled = l.times( testSet.length, l.constant( false ));
			testSet.forEach(( entity, index ) => {
				entity.on( 'beforeFind', () => {
					expect( beforeCalled[index]).to.be.false;
					testSet.forEach(( subentity, subindex ) => {
						expect( afterCalled[subindex]).to.be.false;
					});
					return randomTimeout( index * 20 ).then(() => {
						beforeCalled[index] = true;
					});
				});
				entity.on( 'afterFind', () => {
					testSet.forEach(( subentity, subindex ) => {
						expect( beforeCalled[subindex]).to.be.true;
					});
					expect( afterCalled[index]).to.be.false;
					return randomTimeout( index * 20 ).then(() => {
						afterCalled[index] = true;
					});
				});
			});
			return testSet.fetch().then(() => {
				testSet.forEach(( subentity, subindex ) => {
					expect( beforeCalled[subindex]).to.be.true;
					expect( afterCalled[subindex]).to.be.true;
				});
			});
		});
		it( 'before/after delete', () => {
			let beforeCalled = l.times( testSet.length, l.constant( false ));
			let afterCalled = l.times( testSet.length, l.constant( false ));
			testSet.forEach(( entity, index ) => {
				entity.on( 'beforeDelete', () => {
					expect( beforeCalled[index]).to.be.false;
					testSet.forEach(( subentity, subindex ) => {
						expect( afterCalled[subindex]).to.be.false;
					});
					return randomTimeout( index * 20 ).then(() => {
						beforeCalled[index] = true;
					});
				});
				entity.on( 'afterDelete', () => {
					testSet.forEach(( subentity, subindex ) => {
						expect( beforeCalled[subindex]).to.be.true;
					});
					expect( afterCalled[index]).to.be.false;
					return randomTimeout( index * 20 ).then(() => {
						afterCalled[index] = true;
					});
				});
			});
			return testSet.destroy().then(() => {
				testSet.forEach(( subentity, subindex ) => {
					expect( beforeCalled[subindex]).to.be.true;
					expect( afterCalled[subindex]).to.be.true;
				});
			});
		});
	});
});
