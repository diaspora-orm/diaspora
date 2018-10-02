import { applyUpdateEntity, getDefaultFunction, getDefaultValue} from '../../src/utils';
import { namedFunctions } from '../../src/staticStores';
import * as _ from 'lodash';

describe( 'Testing "applyUpdateEntity', () => {
	it( 'Adding prop', () => {
		expect( applyUpdateEntity( {b:2}, {a:1} ) ).toEqual( {a:1,b:2} );
	} );
	it( 'Replacing prop', () => {
		expect( applyUpdateEntity( {a:2}, {a:1} ) ).toEqual( {a:2} );
	} );
	it( 'Deleting prop', () => {
		expect( applyUpdateEntity( {a:undefined}, {a:1} ) ).toEqual( {} );
	} );
} );

describe( 'Default functions', () => {
	describe( 'Get default function', () => {
		it( 'With existing string', () => {
			expect( getDefaultFunction( 'Diaspora::Date.now()' ) ).toEqual( namedFunctions.Diaspora['Date.now()'] );
		} );
		it( 'With string', () => {
			expect( getDefaultFunction( 'unknown' ) ).toEqual( _.identity );
		} );
	} );
	describe( 'Test default functions', () => {
		it( 'Date default', () => {
			const now = new Date().getTime();
			const defaultReturn = ( getDefaultFunction( 'Diaspora::Date.now()' )() as Date ).getTime();
			expect( defaultReturn ).toBeGreaterThanOrEqual( now );
			expect( defaultReturn ).toBeLessThan( now + 100 );
		} );
	} );
	describe( 'Get default value', () => {
		it( 'Should return value as is', () => {
			expect( getDefaultValue( 1 ) ).toEqual( 1 );
			expect( getDefaultValue( 'aze' ) ).toEqual( 'aze' );
			expect( getDefaultValue( {} ) ).toEqual( {} );
			expect( getDefaultValue( undefined ) ).toEqual( undefined );
		} );
		it( 'Should apply default function', () => {
			expect( getDefaultValue( () => 1 ) ).toEqual( 1 );
			expect( getDefaultValue( () => 'foo' ) ).toEqual( 'foo' );
		} );
	} );
} );
