
import { EntityTransformers as DefaultTransformer_CheckTransformer } from '../../../src/entityTransformers';
import DefaultTransformer = DefaultTransformer_CheckTransformer.DefaultTransformer;
import { EFieldType } from '../../../src';
import { Raw, IAttributesDescription } from '../../../src/types/modelDescription';

describe( 'Default values', () => {
	it( 'Default field', async () => {
		const validator = new DefaultTransformer( {
			foo:{
				type: EFieldType.STRING,
				default: 'bar',
				required: false,
			},
		} );
		expect( validator.applyField( {}, ['foo'], {getProps:true} ) ).toEqual( 'bar' );
	} );
	describe( 'Default all', async () => {
		it( 'Basic', () => {
			const validator = new DefaultTransformer( {
				foo:{
					type: EFieldType.STRING,
					default: 'bar',
					required: false,
				},
			} );
			expect( validator.apply( {} ) ).toEqual( {foo:'bar'} );
		} );
		describe( 'Object', () => {
			it( 'No default', () => {
				const validator = new DefaultTransformer( {
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
				expect( validator.apply( {} ) ).toEqual( {foo:undefined} );
				expect( validator.apply( {foo:{}} ) ).toEqual( {foo:{}} );
				expect( validator.apply( {foo:{bar:'string'}} ) ).toEqual( {foo:{bar:'string'}} );
			} );
			it( 'Default child', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.OBJECT,
						attributes: {
							bar: {
								type: EFieldType.STRING,
								required: false,
								default: 'qux',
							},
						},
						required: false,
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {foo:undefined} );
				expect( validator.apply( {foo:{}} ) ).toEqual( {foo:{bar:'qux'}} );
				expect( validator.apply( {foo:{bar:'string'}} ) ).toEqual( {foo:{bar:'string'}} );
			} );
			it( 'Default parent', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.OBJECT,
						attributes: {
							bar: {
								type: EFieldType.STRING,
								required: false,
							},
						},
						required: false,
						default: {
							bar: 'qux',
						},
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {foo:{bar:'qux'}} );
				expect( validator.apply( {foo:{}} ) ).toEqual( {foo:{}} );
				expect( validator.apply( {foo:{bar:'string'}} ) ).toEqual( {foo:{bar:'string'}} );
			} );
			it( 'Default both', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.OBJECT,
						attributes: {
							bar: {
								type: EFieldType.STRING,
								required: false,
								default: 'quux',
							},
						},
						required: false,
						default: {
							bar: 'qux',
						},
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {foo:{bar:'qux'}} );
				expect( validator.apply( {foo:{}} ) ).toEqual( {foo:{bar:'quux'}} );
				expect( validator.apply( {foo:{bar:'string'}} ) ).toEqual( {foo:{bar:'string'}} );
			} );
			describe( 'Check default functions call counts', () => {
				it( 'Parent only', () => {
					const model = {
						foo:{
							type: EFieldType.OBJECT,
							attributes: {
								bar: {
									type: EFieldType.STRING,
									required: false,
									default: jest.fn( () => 'foo' ),
								},
							},
							required: false,
							default: jest.fn( () => ( {bar: 'quux'} ) ),
						},
					};
					const validator = new DefaultTransformer( model as IAttributesDescription );
					
					expect( validator.apply( {} ) ).toEqual( {foo:{bar:'quux'}} );
					expect( model.foo.default ).toHaveBeenCalledTimes( 1 );
					expect( model.foo.attributes.bar.default ).toHaveBeenCalledTimes( 0 );
				} );
				it( 'Child only', () => {
					const model = {
						foo:{
							type: EFieldType.OBJECT,
							attributes: {
								bar: {
									type: EFieldType.STRING,
									required: false,
									default: jest.fn( () => 'baaz' ),
								},
							},
							required: false,
							default: jest.fn( () => ( {bar: 'quux'} ) ),
						},
					};
					const validator = new DefaultTransformer( model as IAttributesDescription );
					
					expect( validator.apply( {foo:{}} ) ).toEqual( {foo:{bar:'baaz'}} );
					expect( model.foo.default ).toHaveBeenCalledTimes( 0 );
					expect( model.foo.attributes.bar.default ).toHaveBeenCalledTimes( 1 );
				} );
				it( 'Both', () => {
					const model = {
						foo:{
							type: EFieldType.OBJECT,
							attributes: {
								bar: {
									type: EFieldType.STRING,
									required: false,
									default: jest.fn( () => 'baaz' ),
								},
							},
							required: false,
							default: jest.fn( () => ( {test: 'quux'} ) ),
						},
					};
					const validator = new DefaultTransformer( model as IAttributesDescription );
					
					expect( validator.apply( {} ) ).toEqual( {foo:{bar:'baaz', test:'quux'}} );
					expect( model.foo.default ).toHaveBeenCalledTimes( 1 );
					expect( model.foo.attributes.bar.default ).toHaveBeenCalledTimes( 1 );
				} );
				it( 'No default required', () => {
					const model = {
						foo:{
							type: EFieldType.OBJECT,
							attributes: {
								bar: {
									type: EFieldType.STRING,
									required: false,
									default: jest.fn( () => 'foo' ),
								},
							},
							required: false,
							default: jest.fn( () => ( {bar: 'quux'} ) ),
						},
					};
					const validator = new DefaultTransformer( model as IAttributesDescription );
					
					expect( validator.apply( {foo:{bar:'string'}} ) ).toEqual( {foo:{bar:'string'}} );
					expect( model.foo.default ).toHaveBeenCalledTimes( 0 );
					expect( model.foo.attributes.bar.default ).toHaveBeenCalledTimes( 0 );
				} );
			} );
		} );
		describe( 'Array', () => {
			it( 'No default', () => {
				const validator = new DefaultTransformer( {
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
				expect( validator.apply( {} ) ).toEqual( {} );
				expect( validator.apply( {foo:[]} ) ).toEqual( {foo:[]} );
				expect( validator.apply( {foo:['string']} ) ).toEqual( {foo:['string']} );
			} );
			it( 'Default parent', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.ARRAY,
						of: {
							type: EFieldType.STRING,
							required: false,
							default: undefined,
						},
						required: false,
						default: ['bar'],
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {foo:['bar']} );
				expect( validator.apply( {foo:[]} ) ).toEqual( {foo:[]} );
				expect( validator.apply( {foo:['string']} ) ).toEqual( {foo:['string']} );
			} );
			it( 'Deep default child object', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.ARRAY,
						of: {
							type: EFieldType.OBJECT,
							attributes: {
								baz: {
									type: EFieldType.STRING,
									required: false,
									default: 'qux',
								},
							},
							required: false,
							default: undefined,
						},
						required: false,
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {} );
				expect( validator.apply( {foo:[]} ) ).toEqual( {foo:[]} );
				expect( validator.apply( {foo:[{}]} ) ).toEqual( {foo:[{baz: 'qux'}]} );
			} );
			it( 'Deep default child object applied on default array', () => {
				const validator = new DefaultTransformer( {
					foo:{
						type: EFieldType.ARRAY,
						of: {
							type: EFieldType.OBJECT,
							attributes: {
								baz: {
									type: EFieldType.STRING,
									required: false,
									default: 'qux',
								},
							},
							required: false,
							default: undefined,
						},
						required: false,
						default: [{}],
					},
				} );
				expect( validator.apply( {} ) ).toEqual( {foo:[{baz: 'qux'}]} );
				expect( validator.apply( {foo:[]} ) ).toEqual( {foo:[]} );
				expect( validator.apply( {foo:[{}]} ) ).toEqual( {foo:[{baz: 'qux'}]} );
			} );
		} );
	} );
} );
