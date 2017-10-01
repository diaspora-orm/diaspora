'use strict';

//require("../index");
//let inMemoryAdapter = require("../../lib/adapters/inMemoryAdapter");
//let inMemoryEntity = require("../../lib/dataStoreEntities/inMemoryEntity");
let Diaspora = require( '../../diaspora' );

let testModel;
let testedEntity;
const modelName = 'testModel';

let IMsource = Diaspora.createDataSource( 'in-memory', {});
Diaspora.registerDataSource( 'test', 'proute', IMsource );

testModel = Diaspora.declareModel( 'test', modelName, {
	sources:    [ 'proute' ],
	attributes: {
		foo: {
			type: 'string',
		},
	},
	methods: {
		myFunc() {
			// "this" is entity
			let promise = this.persist();
			promise.then(() => {
				//this is still entity 
			});
		},
	},
});

const entity1 = testModel.spawn();
const entity2 = testModel.spawn({
	foo: 'bar',
});


const entities = testModel.spawnMulti([
	{
		foo: 'bar',
	},
	undefined,
]);

console.log( entities.map( entity=>entity.toObject()));

testedEntity = testModel.spawn({
	foo: 'bar',
});
/*
const retPromise = testedEntity.persist();
return retPromise.then(() => {
    return Promise.resolve();
});

const inMemoryStore = Diaspora.dataSources.test.inMemory;
const collection = inMemoryStore.store.testModel;


testedEntity.foo = 'baz';
const retPromise = testedEntity.fetch();
return retPromise.then(() => {
    return Promise.resolve();
});

const retPromise = testedEntity.destroy();
return retPromise.then(() => {
	return Promise.resolve();
});

const inMemoryStore = Diaspora.dataSources.test.inMemory;
const collection = inMemoryStore.store.testModel;


let entities;
return testModel.insert({
    foo: 'bar',
}).then( newEntity => {
    entities = [ newEntity ];
    return Promise.resolve();
});


return testModel.insertMany([
    {
        foo: 'baz',
    },
	undefined,
	{
	   foo: undefined,
    },
	{
	   foo: 'baz',
    },
]).then( newEntities => {
    l.forEach( newEntities, newEntity => {
        entities = entities.concat( newEntities );
        return Promise.resolve();
    });
});

function checkFind( query, many = true ) {
    return testModel[many ? 'findMany' : 'find']( query ).then( foundEntities => {
        function checkSingle( entity ) {
            l.forEach( query, ( val, key ) => {
                
            });
        }

        if ( many ) {
            l.forEach( foundEntities, checkSingle );
        } else {
            checkSingle( foundEntities );
        }
        return Promise.resolve( foundEntities );
    });
}


return Promise.all([
    checkFind({
        foo: undefined,
    }, false ),
    checkFind({
        foo: 'baz',
    }, false ),
    checkFind({
        foo: 'bar',
    }, false ),
]);
		

return Promise.all([
    checkFind({
	   foo: undefined,
    }, true ).then( foundEntities => {
    }),
    checkFind({
        foo: 'baz',
    }, true ).then( foundEntities => {
    }),
    checkFind({
        foo: 'bar',
    }, true ).then( foundEntities => {
    }),
]);


function checkUpdate( query, update, many = true ) {
    return testModel[many ? 'updateMany' : 'update']( query, update ).then( updatedEntities => {
        function checkSingle( entity ) {
            l.forEach( update, ( val, key ) => {
            });
        }

        if ( many ) {
            l.forEach( updatedEntities, checkSingle );
        } else {
            checkSingle( updatedEntities );
        }
        
        return Promise.resolve( updatedEntities );
    });
}


return Promise.resolve()
    .then(() => checkUpdate({
        foo: undefined,
    }, {
        foo: 'qux',
    }, false ))
    .then(() => checkUpdate({
        foo: 'baz',
    }, {
        foo: 'qux',
    }, false ))
    .then(() => checkUpdate({
        foo: 'bar',
    }, {
        foo: undefined,
    }, false ));


return Promise.resolve()
    .then(() => checkUpdate({
        foo: undefined,
    }, {
        foo: 'bar',
    }, true ).then( foundEntities => {
    }))
    .then(() => checkUpdate({
        foo: 'baz',
    }, {
        foo: undefined,
    }, true ).then( foundEntities => {
    }))
    .then(() => checkUpdate({
        foo: 'bat',
    }, {
        foo: 'twy',
    }, true )
    .then( foundEntities => {
    }));
		

function checkDestroy( query, many = true ) {
    return testModel.findMany(query).then(entities => {
        return Promise.resolve(entities.length);
    }).then(beforeCount => {
        return testModel[many ? 'deleteMany' : 'delete']( query ).then( () => Promise.resolve(beforeCount));
    }).then(beforeCount => {
        return testModel.findMany(query).then(entities => {
            return Promise.resolve({before: beforeCount, after: entities.length});
        });
    }).then(result => {
        if(many || 0 === result.before){
        } else {
        }
    });
}

return Promise.resolve()
    .then(() => checkDestroy({
        foo: undefined,
    }, false ))
    .then(() => checkDestroy({
        foo: 'bar',
    }, false ));
		
return Promise.resolve().then(() => checkDestroy({
    foo: undefined,
}, true )).then(() => checkDestroy({
    foo: 'baz',
}, true )).then(() => checkDestroy({
    foo: 'qux',
}, true ));
*/
