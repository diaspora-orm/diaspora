import { DefaultTransformer } from '../../src/entityTransformers';

describe( 'Default values', () => {
	it( 'Default field', async () => {
		const validator = new DefaultTransformer( {
			foo:{
				type: 'string',
				default: 'bar',
			},
		} );
		expect( validator.applyField( {}, ['foo'] ) ).resolves.toEqual( 'bar' );
	} );
	it( 'Default all', async () => {
		const validator = new DefaultTransformer( {
			foo:{
				type: 'string',
				default: 'bar',
			},
		} );
		expect( validator.apply( {} ) ).resolves.toEqual( {foo:'bar'} );
	} );
} );
