import { DefaultTransformer } from '../../src/entityTransformers';
import { EFieldType } from '../../src';

describe( 'Default values', () => {
	it( 'Default field', async () => {
		const validator = new DefaultTransformer( {
			foo:{
				type: EFieldType.STRING,
				default: 'bar',
			},
		} );
		expect( validator.applyField( {}, ['foo'], {getProps:true} ) ).toEqual( 'bar' );
	} );
	it( 'Default all', async () => {
		const validator = new DefaultTransformer( {
			foo:{
				type: EFieldType.STRING,
				default: 'bar',
			},
		} );
		expect( validator.apply( {} ) ).toEqual( {foo:'bar'} );
	} );
} );
