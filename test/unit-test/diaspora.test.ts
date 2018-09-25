import { Diaspora, Adapter, DiasporaStatic } from '../src';
import AAdapter = Adapter.Base.AAdapter;
import AAdapterEntity = Adapter.Base.AAdapterEntity;

describe( 'registerAdapter', () => {
	const ADAPTER_LABEL = 'testRegisterAdapter';
	afterEach( () => {
		delete ( Diaspora as any ).adapters[ADAPTER_LABEL];
	} );
	it( 'Register OK adapter', () => {
		class Foo extends AAdapter<AAdapterEntity>{}
		expect( () => Diaspora.registerAdapter( ADAPTER_LABEL, Foo as any ) ).not.toThrow();
	} );
	it( 'Register NOK adapter not extending AAdapter', () => {
		class Foo extends AAdapter<AAdapterEntity>{}
		expect( () => Diaspora.registerAdapter( ADAPTER_LABEL, class{} as any ) ).toThrowError( Error );
	} );
	it( 'Register NOK adapter with duplicate label', () => {
		class Foo extends AAdapter<AAdapterEntity>{}
		expect( () => Diaspora.registerAdapter( ADAPTER_LABEL, Foo as any ) ).not.toThrow();
		expect( () => Diaspora.registerAdapter( ADAPTER_LABEL, class extends AAdapter{} as any ) ).toThrowError( Error );
	} );
} );
describe( 'createDataSource', () => {
	const FAKE_ADAPTER_LABEL = 'fooAdapter';
	const ADAPTER_LABEL = 'inMemory';
	const ADAPTER_NAME = 'testCreateDataSourceAdapter';
	afterEach( () => {
		delete ( Diaspora as any )._dataSources[ADAPTER_NAME];
		delete ( Diaspora as any ).adapters[FAKE_ADAPTER_LABEL];
	} );
	it( 'Use provided adapter name', () => {
		expect( Diaspora.createDataSource( ADAPTER_LABEL, ADAPTER_NAME ) ).toHaveProperty( 'name', ADAPTER_NAME );
	} );
	it( 'Use default adapter name', () => {
		expect( Diaspora.createDataSource( ADAPTER_LABEL ) ).toHaveProperty( 'name', ADAPTER_LABEL );
	} );
	describe( 'loadAdapter', () => {
		it( 'Should load OK for adapter', () => {
			expect( () => Diaspora.createDataSource( `./${FAKE_ADAPTER_LABEL}1.ts` ) ).not.toThrow();
			expect( ( Diaspora as any ).adapters ).toHaveProperty( FAKE_ADAPTER_LABEL + '1', require( `./${FAKE_ADAPTER_LABEL}1` ) );
		} );
		it( 'Should reject incorrect file', () => {
			expect( () => Diaspora.createDataSource( `./${FAKE_ADAPTER_LABEL}2.ts` ) ).toThrowError( Error );
		} );
		it( 'Should reject inexistent filename', () => {
			expect( () => Diaspora.createDataSource( `./${FAKE_ADAPTER_LABEL}3.ts` ) ).toThrowError( Error );
		} );
	} );
} );
describe( 'createNamedDataSource', () => {
	const ADAPTER_NAME = 'inMemory';
	const SOURCE_NAME = 'foo';
	afterEach( () => {
		delete ( Diaspora as any )._dataSources[SOURCE_NAME];
	} );
	it( 'Should call createDataSource', () => {
		const oldFct = Diaspora.createDataSource;
		Diaspora.createDataSource = jest.fn( oldFct );
		expect( () => Diaspora.createNamedDataSource( SOURCE_NAME, ADAPTER_NAME ) ).not.toThrow();
		expect( Diaspora.createDataSource ).toHaveBeenCalledWith( ADAPTER_NAME, SOURCE_NAME );
		Diaspora.createDataSource = oldFct;
	} );
	it( 'Should throw when recreating a data source', () => {
		expect( () => Diaspora.createNamedDataSource( SOURCE_NAME, ADAPTER_NAME ) ).not.toThrow();
		expect( () => Diaspora.createNamedDataSource( SOURCE_NAME, ADAPTER_NAME ) ).toThrow();
	} );
} );
it( 'instance should be singleton', () => {
	expect( DiasporaStatic.instance ).toStrictEqual( Diaspora );
} );
it( 'models should be clone', () => {
	expect( Diaspora.models ).toEqual( ( Diaspora as any )._models );
	expect( Diaspora.models ).not.toBe( ( Diaspora as any )._models );
} );
it( 'dataSources should be clone', () => {
	expect( Diaspora.dataSources ).toEqual( ( Diaspora as any )._dataSources );
	expect( Diaspora.dataSources ).not.toBe( ( Diaspora as any )._dataSources );
} );
