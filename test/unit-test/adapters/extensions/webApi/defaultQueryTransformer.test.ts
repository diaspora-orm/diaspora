import { Adapter as _makeQueryString } from '../../../../src/adapters/webApi/defaultQueryTransformer';
import makeQueryString = _makeQueryString.WebApi.makeQueryString;

it( 'Empty query', () => {
	expect( makeQueryString() ).toEqual( undefined );
	expect( makeQueryString( {} ) ).toEqual( undefined );
} );
describe( 'Only query', () => {
	it( 'Simple', () => {
		expect( makeQueryString( {foo:1} ) ).toEqual( {foo: 1} );
		expect( makeQueryString( {baz:'aze'} ) ).toEqual( {baz:'aze'} );
		expect( makeQueryString( {foo:1, baz:'aze'} ) ).toEqual( {foo:1, baz:'aze'} );
	} );
	it( 'Split where & options if `options` or `where` field in search', () => {
		expect( makeQueryString( {options: 1} ) ).toEqual( {where:{options:1}} );
		expect( makeQueryString( {where: 1} ) ).toEqual( {where:{where:1}} );
		expect( makeQueryString( {options: 1, foo:true} ) ).toEqual( {where:{options:1, foo:true}} );
		expect( makeQueryString( {where: 1, foo:true} ) ).toEqual( {where:{where:1, foo:true}} );
		expect( makeQueryString( {options: 'aze', where: 1, foo:true} ) ).toEqual( {where:{options: 'aze', where:1, foo:true}} );
	} );
} );
describe( 'Only options', () => {
	it( 'Simple', () => {
		expect( makeQueryString( undefined, {skip:1} ) ).toEqual( {options: {skip: 1}} );
	} );
} );
describe( 'Query and options', () => {
	it( 'Simple', () => {
		expect( makeQueryString( {foo:1}, {limit:2} ) ).toEqual( {where: {foo: 1}, options: {limit: 2}} );
	} );
} );
