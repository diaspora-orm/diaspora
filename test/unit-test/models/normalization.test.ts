import { Diaspora } from '../../src/diaspora';
import { dataSourceRegistry } from '../../src/staticStores';
import { EFieldType } from '../../src';

const ADAPTER_LABEL = 'temp';
const MODEL_NAME = 'testModel';

describe( 'Checking model description normalization', () => {
	beforeEach( () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_LABEL];
		delete ( Diaspora as any )._models[MODEL_NAME];
	} );
	describe( 'Attributes normalization', () => {
		it( 'Only types as EFieldType', () => {
			Diaspora.createNamedDataSource( ADAPTER_LABEL, 'inMemory' );
			const model = Diaspora.declareModel( MODEL_NAME, {
				sources: ADAPTER_LABEL,
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
		it( 'Deep object', () => {
			Diaspora.createNamedDataSource( ADAPTER_LABEL, 'inMemory' );
			const model = Diaspora.declareModel( MODEL_NAME, {
				sources: ADAPTER_LABEL,
				attributes: {
					foo:{
						type: EFieldType.OBJECT,
						attributes: {
							bar: EFieldType.STRING,
						},
						required: false,
					},
				},
			} );
			expect( model.attributes ).toEqual( {
				foo:{
					type: EFieldType.OBJECT,
					attributes: {
						bar: {
							type: EFieldType.STRING,
							required: false,
							default: undefined,
						},
					},
					required: false,
				},
			} );
		} );
		it( 'Deep array', () => {
			Diaspora.createNamedDataSource( ADAPTER_LABEL, 'inMemory' );
			const model = Diaspora.declareModel( MODEL_NAME, {
				sources: ADAPTER_LABEL,
				attributes: {
					foo:{
						type: EFieldType.ARRAY,
						of: EFieldType.STRING,
						required: false,
					},
				},
			} );
			expect( model.attributes ).toEqual( {
				foo:{
					type: EFieldType.ARRAY,
					of: {
						type: EFieldType.STRING,
						required: false,
						default: undefined,
					},
					required: false,
				},
			} );
		} );
	} );
	it( 'Should reject unknown source', () => {
		expect( () => Diaspora.declareModel( MODEL_NAME, {
			sources: ADAPTER_LABEL,
			attributes: {},
		} ) ).toThrow( Error );
	} );
} );
