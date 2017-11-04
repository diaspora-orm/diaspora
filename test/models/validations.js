'use strict';

/* globals it: false, require: false, expect: false, Diaspora: false */

let testModel;
const MODEL_NAME = 'validatedModel';
const SOURCE = 'inMemory';
const {
	EntityValidationError, SetValidationError,
} = Diaspora.components.Errors;


it( 'Should create a model', () => {
	testModel = Diaspora.declareModel( MODEL_NAME, {
		sources:    [ SOURCE ],
		schema:     false,
		attributes: {
			prop1: {
				type: 'string',
			},
			prop2: {
				type:     'integer',
				enum:     [ 1, 2, 3, 4, 'foo' ],
				required: true,
			},
			prop3: {
				type:    'float',
				default: 0.1,
			},
		},
	});
	expect( testModel ).to.be.an( 'object' );
	if ( 'undefined' === typeof window ) {
		expect( testModel.constructor.name ).to.be.eql( 'Model' );
	}
});
it( 'Should reject persistance of badly configured entities (spawn).', () => {
	const fail1 = testModel.spawn({
		prop1: 1,
		prop2: 2,
	}).persist();
	const fail2 = testModel.spawn({
		prop2: 0,
	}).persist();
	const fail3 = testModel.spawn({
		prop2: 'foo',
	}).persist();
	const fail4 = testModel.spawn({}).persist();
	return Promise.all([
		expect( fail1 ).to.be.rejectedWith( EntityValidationError ).and.eventually.match( /(\W|^)prop1\W(.|\s)*\Wstring(\W|$)/m ),
		expect( fail2 ).to.be.rejectedWith( EntityValidationError ).and.eventually.match( /(\W|^)prop2\W(.|\s)*\Wenumerat(ed|ion)(\W|$)/m ),
		expect( fail3 ).to.be.rejectedWith( EntityValidationError ).and.eventually.match( /(\W|^)prop2\W(.|\s)*\Winteger(\W|$)/m ),
		expect( fail4 ).to.be.rejectedWith( EntityValidationError ).and.eventually.match( /(\W|^)prop2\W(?=(.|\s)*\Winteger(\W|$))(?=(.|\s)*\Wrequired(\W|$))/m ),
	]);
});
it( 'Should reject persistance of badly configured entities (spawnMany).', () => {
	const fail1 = testModel.spawnMany([
		{
			prop1: 1,
			prop2: 2,
		}, {
			prop2: 2,
		},
	]).persist();
	const fail2 = testModel.spawnMany([
		{
			prop2: 0,
		}, {
			prop2: 'foo',
		},
	]).persist();
	return Promise.all([
		expect( fail1 ).to.be.rejectedWith( SetValidationError ).and.eventually.satisfy( error => {
			const validationErrors = error.validationErrors;
			expect( validationErrors[0]).to.be.instanceof( EntityValidationError );
			expect( validationErrors[0].message ).to.match( /(\W|^)prop1\W(.|\s)*\Wstring(\W|$)/m );
			expect( validationErrors[1]).to.be.undefined;
			return true;
		}),
		expect( fail2 ).to.be.rejectedWith( SetValidationError ).and.eventually.satisfy( error => {
			const validationErrors = error.validationErrors;
			expect( validationErrors[0]).to.be.instanceof( EntityValidationError );
			expect( validationErrors[0].message ).to.match( /(\W|^)prop2\W(.|\s)*\Wenumerat(ed|ion)(\W|$)/m );
			expect( validationErrors[1]).to.be.instanceof( EntityValidationError );
			expect( validationErrors[1].message ).to.match( /(\W|^)prop2\W(.|\s)*\Winteger(\W|$)/m );
			return true;
		}),
	]);
});
it( 'Should define default values on valid items', () => {
	return Promise.all([
		testModel.spawn({
			prop2: 2,
		}).persist().then( entity => {
			expect( entity ).to.be.an.entity( testModel, {
				prop2: 2,
				prop3: 0.1,
			}, 'inMemory' );
		}),
		testModel.spawn({
			prop2: 3,
			prop3: 12,
		}).persist().then( entity => {
			expect( entity ).to.be.an.entity( testModel, {
				prop2: 3,
				prop3: 12,
			}, 'inMemory' );
		}),
	]);
});
