import { Diaspora } from '../../../../src';
import { EType } from '../../../../src/types/modelDescription';
import { EntityValidationError } from '../../../../src/errors/entityValidationError';
import { createMockModel } from '../../utils';

const { model, adapter, MODEL_NAME, SOURCE } = createMockModel( 'entity-validation', {
	prop1: {
		type: EType.STRING,
	},
	prop2: {
		type:     EType.INTEGER,
		enum:     [ 1, 2, 3, 4, 'foo' ],
		required: true,
	},
	prop3: {
		type:    EType.FLOAT,
		default: 0.1,
	},
} );
it( 'Should reject persistance of badly configured entities (spawn).', async () => {
	const fail1 = model.spawn( {
		prop1: 1,
		prop2: 2,
	} ).persist();
	expect( fail1 ).rejects.toBeInstanceOf( EntityValidationError );
	await fail1.catch( error => {
		expect( error ).toHaveProperty( 'message' );
		expect( error.message ).toMatch( /(\W|^)prop1\W[\s\S]*\Wstring(\W|$)/m );
	} );

	const fail2 = model.spawn( {
		prop2: 0,
	} ).persist();
	expect( fail2 ).rejects.toBeInstanceOf( EntityValidationError );
	await fail2.catch( error => {
		expect( error ).toHaveProperty( 'message' );
		expect( error.message ).toMatch( /(\W|^)prop2\W[\s\S]*\Wenumerat(ed|ion)(\W|$)/m );
	} );

	const fail3 = model.spawn( {
		prop2: 'foo',
	} ).persist();
	expect( fail3 ).rejects.toBeInstanceOf( EntityValidationError );
	await fail3.catch( error => {
		expect( error ).toHaveProperty( 'message' );
		expect( error.message ).toMatch( /(\W|^)prop2\W[\s\S]*\Winteger(\W|$)/m );
	} );

	const fail4 = model.spawn( {} ).persist();
	expect( fail4 ).rejects.toBeInstanceOf( EntityValidationError );
	await fail4.catch( error => {
		expect( error ).toHaveProperty( 'message' );
		expect( error.message ).toMatch( /(\W|^)prop2\W(?=[\s\S]*\Winteger(\W|$))(?=[\s\S]*\Wrequired(\W|$))/m );
	} );
} );
