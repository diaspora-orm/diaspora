import { Adapter } from '../../../src/adapters';

describe( 'instanceof EntityUid', () => {
	it( 'OK Non empty string', () => {
		expect( Adapter.EntityUid.isEntityUid( 'foo' ) ).toBe( true );
		expect( Adapter.EntityUid.isEntityUid( '' ) ).toBe( false );
	} );
	it( 'OK Non 0 integer', () => {
		expect( Adapter.EntityUid.isEntityUid( 42 ) ).toBe( true );
		expect( Adapter.EntityUid.isEntityUid( 0 ) ).toBe( false );
	} );
	it( 'Objects should not match', () => {
		expect( Adapter.EntityUid.isEntityUid( {} ) ).toBe( false );
		expect( Adapter.EntityUid.isEntityUid( [] ) ).toBe( false );
	} );
} );
