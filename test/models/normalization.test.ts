import { Diaspora } from '../../src/diaspora';
import { generateUUID } from '../../src/utils';
import { dataSourceRegistry } from '../../src/staticStores';

describe( 'Checking model description normalization', () => {
	it( 'Should normalize key/string attributes', () => {
		Diaspora.createNamedDataSource( 'temp', 'inMemory' );
		const model = Diaspora.declareModel( 'model_' + generateUUID(), {
			sources: 'temp',
			attributes: {
				foo: 'string',
				bar: 'number',
			},
		} );
		expect( model.attributes ).toEqual( {
			foo: {
				type: 'string',
			},
			bar: {
				type: 'number',
			},
		} );
	} );
	it( 'Should reject unknown source', () => {
		expect( () => Diaspora.declareModel( 'model_' + generateUUID(), {
			sources: 'temp',
			attributes: {},
		} ) ).toThrow( Error );
	} );
	afterEach( () => {
		delete dataSourceRegistry.temp;
	} );
} );
