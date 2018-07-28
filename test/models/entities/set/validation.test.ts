import { createMockModel } from '../../utils';
import { SetValidationError } from '../../../../src/errors/setValidationError';
import { EntityValidationError } from '../../../../src/errors/entityValidationError';
import { EFieldType } from '../../../../src';

const { model, adapter, MODEL_NAME, SOURCE } = createMockModel( 'entity-validation', {
	prop1: {
		type: EFieldType.STRING,
	},
	prop2: {
		type:     EFieldType.INTEGER,
		enum:     [ 1, 2, 3, 4, 'foo' ],
		required: true,
	},
	prop3: {
		type:    EFieldType.FLOAT,
		default: 0.1,
	},
} );

it( 'Should reject persistance of badly configured entities (spawnMany).', async () => {
	const fail1 = model.spawnMany( [
		{ prop1: 1, prop2: 2 },
		{ prop2: 2 },
	] ).persist();
	expect( fail1 ).rejects.toBeInstanceOf( SetValidationError );
	await fail1.catch( error => {
		const validationErrors = error.validationErrors;
		expect( validationErrors ).toHaveLength( 2 );
		expect( validationErrors[0] ).toBeInstanceOf( EntityValidationError );
		expect( validationErrors[0] ).toHaveProperty( 'message' );
		expect( validationErrors[0].message ).toMatch( /(\W|^)prop1\W[\s\S]*\Wstring(\W|$)/m );
		expect( validationErrors[1] ).toBeUndefined();
		return true;
		} );

	const fail2 = model.spawnMany( [
		{ prop2: 0 },
		{ prop2: 'foo' },
	] ).persist();
	expect( fail2 ).rejects.toBeInstanceOf( SetValidationError );
	await fail2.catch( error => {
		const validationErrors = error.validationErrors;
		expect( validationErrors ).toHaveLength( 2 );
		expect( validationErrors[0] ).toBeInstanceOf( EntityValidationError );
		expect( validationErrors[0] ).toHaveProperty( 'message' );
		expect( validationErrors[0].message ).toMatch( /(\W|^)prop2\W[\s\S]*\Wenumerat(ed|ion)(\W|$)/m );
		expect( validationErrors[1] ).toBeInstanceOf( EntityValidationError );
		expect( validationErrors[1] ).toHaveProperty( 'message' );
		expect( validationErrors[1].message ).toMatch( /(\W|^)prop2\W[\s\S]*\Winteger(\W|$)/m );
		return true;
	} );
} );
