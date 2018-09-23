import * as _ from 'lodash';

import { EntityTransformers as EntityTransformers_CheckTransformer } from '../../src/entityTransformers';
import CheckTransformer = EntityTransformers_CheckTransformer.CheckTransformer;
import { Errors } from '../../src/errors';
import { EFieldType } from '../../src';


interface IPartition<TData> extends Array<TData[]> {
	0: TData[];
	1: TData[];
}

export const explain = ( expectation: () => void, ...explanation: any[] ) => {
	try {
		expectation();
	} catch ( e ) {
		console.log( ...explanation );
		throw e;
	}
};

const date1 = new Date();
const date2 = new Date( 0 );
const obj1 = {};
const obj2 = { foo: 'bar' };
const arr1 = [];
const arr2 = [1, 2, 3];
const exampleValues = {
	[EFieldType.ANY]: ['', 'foo', 0, 1, 1.5, date1, obj1, arr1] as any[],
	[EFieldType.STRING]: ['', 'foo'] as string[],
	[EFieldType.INTEGER]: [0, 1] as number[],
	[EFieldType.FLOAT]: [1.5, 0, 1] as number[],
	[EFieldType.DATETIME]: [date1, date2] as Date[],
	[EFieldType.OBJECT]: [obj1, date1, arr1, obj2, date2, arr2] as object[],
	[EFieldType.ARRAY]: [arr1, arr2] as any[][],
};
const getValues = ( keys: string | string[] = [] ): [any[], any[]] => {
	keys = _.castArray( keys );
	const partition = [_.pick( exampleValues, keys ), _.omit( exampleValues, keys )];
	const partedValues = _.map( partition, val =>
		_.reduce(
			val,
			( acc, valSub ) => {
				const vals = _.isArray( valSub ) ? valSub : _.values( valSub );
				return _.union( acc, vals );
			},
			[]
		) );
	const partedFiltered = [
		partedValues[0],
		_.difference( partedValues[1], partedValues[0] ),
	] as [any[], any[]];
	if ( keys.indexOf( 'any' ) > -1 ) {
		return [_.union( ...partedFiltered ), []];
	}
	return partedFiltered;
};

const THROWING = ( desc, obj ) =>
	`Validation ${JSON.stringify( desc )} throwing for ${JSON.stringify(
		obj
	)}`;
const NOT_THROWING = ( desc, obj ) =>
	`Validation ${JSON.stringify(
		desc
	)} NOT throwing correctly for ${JSON.stringify( obj )}`;

const runTests = (
	validator: CheckTransformer,
	[accepted, rejected]: IPartition<object>
) => {
	_.forEach( accepted, value => {
		explain(
			() => expect( () => validator.apply( value ) ).not.toThrowError(),
			THROWING( validator.modelAttributes, value )
		);
	} );
	_.forEach( rejected, value => {
		explain(
			() =>
				expect( () => validator.apply( value ) ).toThrowError( Errors.EntityValidationError ),
			NOT_THROWING( validator.modelAttributes, value )
		);
	} );
};

const wrapTest = ( partition: IPartition<any> ): IPartition<{ test: any }> => {
	const partitionMapped = partition.map( ( values: any[] ) =>
		values.map( ( value: any ) => ( { test: value } ) ) );
	return partitionMapped as IPartition<{ test: any }>;
};
const canBeNil = ( partition: IPartition<any> ) => {
	partition[0] = _.concat( partition[0], [undefined, null] );
	return partition;
};
const cannotBeNil = ( partition: IPartition<any> ) => {
	partition[1] = _.concat( partition[1], [undefined, null] );
	return partition;
};



describe( 'Default values', () => {
	it( 'Check field', async () => {
		const validator = new CheckTransformer( {
			foo:{
				type: EFieldType.STRING,
				default: 'bar',
				required: false,
			},
		} );
		expect( validator.applyField( {foo:1}, ['foo'] ) ).toBeInstanceOf( Object );
	} );
	describe( 'Check all', async () => {
		describe( 'Basic tests with types', () => {
			describe( 'Not required', () => {
				_.forEach( exampleValues, ( v, type: any ) => {
					it( `Check type "${type}"`, () => {
						const validator = new CheckTransformer( {
							test: {
								type,
								required: false,
							},
						} );
						const partition = canBeNil( getValues( type ) );
						const testObjects = wrapTest( partition );
						return runTests( validator, testObjects );
					} );
				} );
			} );
			describe( 'Required', () => {
				_.forEach( exampleValues, ( v, type: any ) => {
					it( `Check type "${type}"`, () => {
						const validator = new CheckTransformer( {
							test: {
								type,
								required: true,
							},
						} );
						const partition = cannotBeNil( getValues( type ) );
						const testObjects = wrapTest( partition );
						return runTests( validator, testObjects );
					} );
				} );
			} );
		} );
		describe( 'Sub-elements checking', () => {
			describe( 'Objects', () => {
				it( 'Optional property in optional object', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.OBJECT,
							attributes: {
								string: {
									type: EFieldType.STRING,
									required: false,
								},
							},
							required: false,
						},
					} );
					const testObjects = wrapTest( [
						[undefined, null, { string: 'foo' }, {}, { string: '' }],
						['foo'],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Optional property in required object', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.OBJECT,
							required: true,
							attributes: {
								string: {
									type: EFieldType.STRING,
									required: false,
								},
							},
						},
					} );
					const testObjects = wrapTest( [
						[{ string: 'foo' }, {}, { string: '' }],
						[undefined, null, 'foo'],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Required property in optional object', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.OBJECT,
							attributes: {
								string: {
									type: EFieldType.STRING,
									required: true,
								},
							},
							required: false,
						},
					} );
					const testObjects = wrapTest( [
						[{ string: 'foo' }, { string: '' }, undefined, null],
						[{}, 'foo'],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Required property in required object', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.OBJECT,
							required: true,
							attributes: {
								string: {
									type: EFieldType.STRING,
									required: true,
								},
							},
						},
					} );
					const testObjects = wrapTest( [
						[{ string: 'foo' }, { string: '' }],
						['foo', undefined, null, {}],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'In-depth required property in required object', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.OBJECT,
							required: true,
							attributes: {
								obj: {
									type: EFieldType.OBJECT,
									required: true,
									attributes: {
										obj: {
											type: EFieldType.OBJECT,
											required: true,
											attributes: {
												test: {
													type: EFieldType.STRING,
													required: true,
												},
											},
										},
									},
								},
							},
						},
					} );
					const testObjects = wrapTest( [
						[{ obj: { obj: { test: 'foo' } } }],
						[undefined, null, {}, { obj: {} }, { obj: { obj: {} } }],
					] );
					return runTests( validator, testObjects );
				} );
			} );
			describe( 'Arrays', () => {
				describe( 'Single definition', () => {
					it( 'Optional single definition in optional object', () => {
						const validator = new CheckTransformer( {
							test: {
								type: EFieldType.ARRAY,
								of: {
									type: EFieldType.INTEGER,
									required: false,
								},
								required: false,
							},
						} );
						const testObjects = wrapTest( [
							[undefined, null, [], [1], [1, 2, 3], [1, 2, null, undefined]],
							[['foo'], [{}]],
						] );
						return runTests( validator, testObjects );
					} );
					it( 'Optional single definition in required object', () => {
						const validator = new CheckTransformer( {
							test: {
								type: EFieldType.ARRAY,
								required: true,
								of: {
									type: EFieldType.INTEGER,
									required: false,
								},
							},
						} );
						const testObjects = wrapTest( [
							[[], [1], [1, 2, 3], [1, 2, null, undefined]],
							[undefined, null, ['foo'], [{}]],
						] );
						return runTests( validator, testObjects );
					} );
					it( 'Required single definition in optional object', () => {
						const validator = new CheckTransformer( {
							test: {
								type: EFieldType.ARRAY,
								of: {
									type: EFieldType.INTEGER,
									required: true,
								},
								required: false,
							},
						} );
						const testObjects = wrapTest( [
							[undefined, null, [], [1], [1, 2, 3]],
							[['foo'], [{}], [1, 2, null, undefined]],
						] );
						return runTests( validator, testObjects );
					} );
					it( 'Required single definition in required object', () => {
						const validator = new CheckTransformer( {
							test: {
								type: EFieldType.ARRAY,
								required: true,
								of: {
									type: EFieldType.INTEGER,
									required: true,
								},
							},
						} );
						const testObjects = wrapTest( [
							[[], [1], [1, 2, 3]],
							[undefined, null, ['foo'], [{}], [1, 2, null, undefined]],
						] );
						return runTests( validator, testObjects );
					} );
					it( 'In-depth required element in required arrays', () => {
						const validator = new CheckTransformer( {
							test: {
								type: EFieldType.ARRAY,
								required: true,
								of: {
									type: EFieldType.ARRAY,
									required: true,
									of: {
										type: EFieldType.ARRAY,
										required: true,
										of: {
											type: EFieldType.STRING,
											required: true,
										},
									},
								},
							},
						} );
						const testObjects = wrapTest( [
							[[[['foo']]], [[[]]], [[]], []],
							[undefined, null, [[[['foo', 1]]]], [1]],
						] );
						return runTests( validator, testObjects );
					} );
				} );
			} );
		} );
		describe( '"enum" property', () => {
			describe( 'Not required', () => {
				it( 'Not required enum of any type', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.ANY,
							enum: [1, 2, 'aze'],
							required: false,
						},
					} );
					const testObjects = wrapTest( [
						[1, 2, 'aze', undefined, null],
						[3, 4, 5, [], {}, new Date()],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Not required enum of a specific type', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.INTEGER,
							enum: [1, 2, 'aze'],
							required: false,
						},
					} );
					const testObjects = wrapTest( [
						[1, 2, undefined, null],
						['aze', 3, 4, 5, [], {}, new Date()],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Not required enum matching with regex', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.STRING,
							enum: [/^foo/, /bar$/],
							required: false,
						},
					} );
					const testObjects = wrapTest( [
						['foobaz', 'bazbar', 'foobar', undefined, null],
						['aze', 'barfoo'],
					] );
					return runTests( validator, testObjects );
				} );
			} );
			describe( 'Required', () => {
				it( 'Required enum of any type', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.ANY,
							required: true,
							enum: [1, 2, 'aze'],
						},
					} );
					const testObjects = wrapTest( [
						[1, 2, 'aze'],
						[3, 4, 5, [], {}, new Date(), undefined, null],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Required enum of a specific type', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.INTEGER,
							required: true,
							enum: [1, 2, 'aze'],
						},
					} );
					const testObjects = wrapTest( [
						[1, 2],
						['aze', 3, 4, 5, [], {}, new Date(), undefined, null],
					] );
					return runTests( validator, testObjects );
				} );
				it( 'Required enum matching with regex', () => {
					const validator = new CheckTransformer( {
						test: {
							type: EFieldType.STRING,
							required: true,
							enum: [/^foo/, /bar$/],
						},
					} );
					const testObjects = wrapTest( [
						['foobaz', 'bazbar', 'foobar'],
						['aze', 'barfoo', undefined, null],
					] );
					return runTests( validator, testObjects );
				} );
			} );
		} );
	} );
} );
