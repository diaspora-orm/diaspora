import { Diaspora } from '../../src/diaspora';
import { generateUUID } from '../../src/utils';
import { dataSourceRegistry } from '../../src/staticStores';
import { EFieldType } from '../../src';

describe( 'Checking model description normalization', () => {
	it( 'Should normalize key/string attributes', () => {
		Diaspora.createNamedDataSource( 'temp', 'inMemory' );
		const model = Diaspora.declareModel( 'model_' + generateUUID(), {
			sources: 'temp',
			attributes: {
				foo: EFieldType.STRING,
				bar: EFieldType.INTEGER,
			},
		} );
		expect( model.attributes ).toEqual( {
			foo: {
				type: EFieldType.STRING,
				required: false,
			},
			bar: {
				type: EFieldType.INTEGER,
				required: false,
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
