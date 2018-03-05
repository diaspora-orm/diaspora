import _ from 'lodash';
import { Validator } from '../src/validator';
import { EntityValidationError } from '../src/errors';

interface IPartition<T> extends Array<T[]> {
	0: Array<T>;
	1: Array<T>;
}

export const explain = (expectation: () => void, ...explanation: any[]) => {
	try {
		expectation();
	} catch (e) {
		console.log(...explanation);
		throw e;
	}
};

const date1 = new Date();
const date2 = new Date(0);
const obj1 = {};
const obj2 = { foo: 'bar' };
const arr1 = [];
const arr2 = [1, 2, 3];
const exampleValues = {
	any: ['', 'foo', 0, 1, 1.5, date1, obj1, arr1] as any[],
	string: ['', 'foo'] as string[],
	integer: [0, 1] as number[],
	float: [1.5, 0, 1] as number[],
	date: [date1, date2] as Date[],
	object: [obj1, date1, arr1, obj2, date2, arr2] as object[],
	array: [arr1, arr2] as any[][],
};
const getValues = (keys: string | string[] = []): [any[], any[]] => {
	keys = _.castArray(keys);
	const partition = [_.pick(exampleValues, keys), _.omit(exampleValues, keys)];
	const partedValues = _.map(partition, val => {
		return _.reduce(
			val,
			(acc, valSub) => {
				const vals = _.isArray(valSub) ? valSub : _.values(valSub);
				return _.union(acc, vals);
			},
			[]
		);
	});
	const partedFiltered = [
		partedValues[0],
		_.difference(partedValues[1], partedValues[0]),
	] as [any[], any[]];
	if (keys.indexOf('any') > -1) {
		return [_.union(...partedFiltered), []];
	}
	return partedFiltered;
};

const THROWING = (desc, obj) => {
	return `Validation ${JSON.stringify(desc)} throwing for ${JSON.stringify(
		obj
	)}`;
};
const NOT_THROWING = (desc, obj) => {
	return `Validation ${JSON.stringify(
		desc
	)} NOT throwing correctly for ${JSON.stringify(obj)}`;
};

const runTests = (
	validator: Validator,
	[accepted, rejected]: IPartition<object>
) => {
	//console.log({validator, accepted, rejected});
	_.forEach(accepted, value => {
		explain(
			() => expect(() => validator.validate(value)).not.toThrowError(),
			THROWING(validator.modelAttributes, value)
		);
	});
	//expect(() => explain(() => validator.validate( aze , THROWING( validator.modelDesc, aze )).not.toThrowError();
	_.forEach(rejected, value => {
		explain(
			() =>
				expect(() => validator.validate(value)).toThrowError(EntityValidationError),
			NOT_THROWING(validator.modelAttributes, value)
		);
	});
};

const wrapTest = (partition: IPartition<any>): IPartition<{ test: any }> => {
	const partitionMapped = partition.map((values: any[]) => {
		return values.map((value: any) => ({ test: value }));
	});
	return partitionMapped as IPartition<{ test: any }>;
};
const canBeNil = (partition: IPartition<any>) => {
	partition[0] = _.concat(partition[0], [undefined, null]);
	return partition;
};
const cannotBeNil = (partition: IPartition<any>) => {
	partition[1] = _.concat(partition[1], [undefined, null]);
	return partition;
};

describe('"check" feature', () => {
	describe('Basic tests with types', () => {
		describe('Not required', () => {
			_.forEach(exampleValues, (v, type) => {
				it(`Check type "${type}"`, () => {
					const validator = new Validator({
						test: {
							type,
						},
					});
					const partition = canBeNil(getValues(type));
					const testObjects = wrapTest(partition);
					return runTests(validator, testObjects);
				});
			});
		});
		describe('Required', () => {
			_.forEach(exampleValues, (v, type) => {
				it(`Check type "${type}"`, () => {
					const validator = new Validator({
						test: {
							type,
							required: true,
						},
					});
					const partition = cannotBeNil(getValues(type));
					const testObjects = wrapTest(partition);
					return runTests(validator, testObjects);
				});
			});
		});
	});
	describe('Sub-elements checking', () => {
		describe('Objects', () => {
			it('Optional property in optional object', () => {
				const validator = new Validator({
					test: {
						type: 'object',
						attributes: {
							string: {
								type: 'string',
							},
						},
					},
				});
				const testObjects = wrapTest([
					[undefined, null, { string: 'foo' }, {}, { string: '' }],
					['foo'],
				]);
				return runTests(validator, testObjects);
			});
			it('Optional property in required object', () => {
				const validator = new Validator({
					test: {
						type: 'object',
						required: true,
						attributes: {
							string: {
								type: 'string',
							},
						},
					},
				});
				const testObjects = wrapTest([
					[{ string: 'foo' }, {}, { string: '' }],
					[undefined, null, 'foo'],
				]);
				return runTests(validator, testObjects);
			});
			it('Required property in optional object', () => {
				const validator = new Validator({
					test: {
						type: 'object',
						attributes: {
							string: {
								type: 'string',
								required: true,
							},
						},
					},
				});
				const testObjects = wrapTest([
					[{ string: 'foo' }, { string: '' }, undefined, null],
					[{}, 'foo'],
				]);
				return runTests(validator, testObjects);
			});
			it('Required property in required object', () => {
				const validator = new Validator({
					test: {
						type: 'object',
						required: true,
						attributes: {
							string: {
								type: 'string',
								required: true,
							},
						},
					},
				});
				const testObjects = wrapTest([
					[{ string: 'foo' }, { string: '' }],
					['foo', undefined, null, {}],
				]);
				return runTests(validator, testObjects);
			});
			it('In-depth required property in required object', () => {
				const validator = new Validator({
					test: {
						type: 'object',
						required: true,
						attributes: {
							obj: {
								type: 'object',
								required: true,
								attributes: {
									obj: {
										type: 'object',
										required: true,
										attributes: {
											test: {
												type: 'string',
												required: true,
											},
										},
									},
								},
							},
						},
					},
				});
				const testObjects = wrapTest([
					[{ obj: { obj: { test: 'foo' } } }],
					[undefined, null, {}, { obj: {} }, { obj: { obj: {} } }],
				]);
				return runTests(validator, testObjects);
			});
		});
		describe('Arrays', () => {
			describe('Single definition', () => {
				it('Optional single definition in optional object', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							of: {
								type: 'integer',
							},
						},
					});
					const testObjects = wrapTest([
						[undefined, null, [], [1], [1, 2, 3], [1, 2, null, undefined]],
						[['foo'], [{}]],
					]);
					return runTests(validator, testObjects);
				});
				it('Optional single definition in required object', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: {
								type: 'integer',
							},
						},
					});
					const testObjects = wrapTest([
						[[], [1], [1, 2, 3], [1, 2, null, undefined]],
						[undefined, null, ['foo'], [{}]],
					]);
					return runTests(validator, testObjects);
				});
				it('Required single definition in optional object', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							of: {
								type: 'integer',
								required: true,
							},
						},
					});
					const testObjects = wrapTest([
						[undefined, null, [], [1], [1, 2, 3]],
						[['foo'], [{}], [1, 2, null, undefined]],
					]);
					return runTests(validator, testObjects);
				});
				it('Required single definition in required object', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: {
								type: 'integer',
								required: true,
							},
						},
					});
					const testObjects = wrapTest([
						[[], [1], [1, 2, 3]],
						[undefined, null, ['foo'], [{}], [1, 2, null, undefined]],
					]);
					return runTests(validator, testObjects);
				});
				it('In-depth required element in required arrays', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: {
								type: 'array',
								required: true,
								of: {
									type: 'array',
									required: true,
									of: {
										type: 'string',
										required: true,
									},
								},
							},
						},
					});
					const testObjects = wrapTest([
						[[[['foo']]], [[[]]], [[]], []],
						[undefined, null, [[[['foo', 1]]]], [1]],
					]);
					return runTests(validator, testObjects);
				});
			});
			describe('Multiple definition', () => {
				it('Optional multiple definitions in optional array', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							of: [{ type: 'integer' }, { type: 'date' }],
						},
					});
					const testObjects = wrapTest([
						[
							undefined,
							null,
							[],
							[1],
							[1, 2, 3],
							[1, 2, null, undefined],
							[date1],
							[date1, undefined, date2],
							[date1, date2],
							[date1, 1, undefined, null],
							[date1, 1],
						],
						[['foo'], [{}]],
					]);
					return runTests(validator, testObjects);
				});
				it('Optional multiple definitions in required array', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: [{ type: 'integer' }, { type: 'date' }],
						},
					});
					const testObjects = wrapTest([
						[
							[],
							[1],
							[1, 2, 3],
							[1, 2, null, undefined],
							[date1],
							[date1, undefined, date2],
							[date1, date2],
							[date1, 1, undefined, null],
							[date1, 1],
						],
						[undefined, null, ['foo'], [{}]],
					]);
					return runTests(validator, testObjects);
				});
				it('Required multiple definitions in optional array', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							of: [
								{
									type: 'integer',
									required: true,
								},
								{
									type: 'date',
									required: true,
								},
							],
						},
					});
					const testObjects = wrapTest([
						[
							undefined,
							null,
							[],
							[1],
							[1, 2, 3],
							[date1],
							[date1, date2],
							[date1, 1],
						],
						[
							['foo'],
							[{}],
							[1, 2, null, undefined],
							[date1, undefined, date2],
							[date1, 1, undefined, null],
						],
					]);
					return runTests(validator, testObjects);
				});
				it('Required multiple definitions in required array', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: [
								{
									type: 'integer',
									required: true,
								},
								{
									type: 'date',
									required: true,
								},
							],
						},
					});
					const testObjects = wrapTest([
						[[], [1], [1, 2, 3], [date1], [date1, date2], [date1, 1]],
						[
							undefined,
							null,
							['foo'],
							[{}],
							[1, 2, null, undefined],
							[date1, undefined, date2],
							[date1, 1, undefined, null],
						],
					]);
					return runTests(validator, testObjects);
				});
				it('Required & optional definitions in array', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							of: [
								{
									type: 'integer',
									required: true,
								},
								{ type: 'date' },
							],
						},
					});
					const testObjects = wrapTest([
						[
							undefined,
							null,
							[],
							[1],
							[1, 2, 3],
							[1, 2, null, undefined],
							[date1],
							[date1, undefined, date2],
							[date1, date2],
							[date1, 1, undefined, null],
							[date1, 1],
						],
						[['foo'], [{}]],
					]);
					return runTests(validator, testObjects);
				});
				it('In-depth required element in required arrays', () => {
					const validator = new Validator({
						test: {
							type: 'array',
							required: true,
							of: [
								{
									type: 'array',
									required: true,
									of: [
										{
											type: 'array',
											required: true,
											of: [
												{
													type: 'integer',
													required: true,
												},
											],
										},
										{
											type: 'integer',
											required: true,
										},
									],
								},
								{
									type: 'integer',
									required: true,
								},
							],
						},
					});
					const testObjects = wrapTest([
						[[[[1]]], [[[1]]], [[]], [], [1]],
						[undefined, null, [[[['foo', 1]]]]],
					]);
					return runTests(validator, testObjects);
				});
			});
		});
	});
	describe('"enum" property', () => {
		describe('Not required', () => {
			it('Not required enum of any type', () => {
				const validator = new Validator({
					test: {
						type: 'any',
						enum: [1, 2, 'aze'],
					},
				});
				const testObjects = wrapTest([
					[1, 2, 'aze', undefined, null],
					[3, 4, 5, [], {}, new Date()],
				]);
				return runTests(validator, testObjects);
			});
			it('Not required enum of a specific type', () => {
				const validator = new Validator({
					test: {
						type: 'integer',
						enum: [1, 2, 'aze'],
					},
				});
				const testObjects = wrapTest([
					[1, 2, undefined, null],
					['aze', 3, 4, 5, [], {}, new Date()],
				]);
				return runTests(validator, testObjects);
			});
			it('Not required enum matching with regex', () => {
				const validator = new Validator({
					test: {
						type: 'string',
						enum: [/^foo/, /bar$/],
					},
				});
				const testObjects = wrapTest([
					['foobaz', 'bazbar', 'foobar', undefined, null],
					['aze', 'barfoo'],
				]);
				return runTests(validator, testObjects);
			});
		});
		describe('Required', () => {
			it('Required enum of any type', () => {
				const validator = new Validator({
					test: {
						type: 'any',
						required: true,
						enum: [1, 2, 'aze'],
					},
				});
				const testObjects = wrapTest([
					[1, 2, 'aze'],
					[3, 4, 5, [], {}, new Date(), undefined, null],
				]);
				return runTests(validator, testObjects);
			});
			it('Required enum of a specific type', () => {
				const validator = new Validator({
					test: {
						type: 'integer',
						required: true,
						enum: [1, 2, 'aze'],
					},
				});
				const testObjects = wrapTest([
					[1, 2],
					['aze', 3, 4, 5, [], {}, new Date(), undefined, null],
				]);
				return runTests(validator, testObjects);
			});
			it('Required enum matching with regex', () => {
				const validator = new Validator({
					test: {
						type: 'string',
						required: true,
						enum: [/^foo/, /bar$/],
					},
				});
				const testObjects = wrapTest([
					['foobaz', 'bazbar', 'foobar'],
					['aze', 'barfoo', undefined, null],
				]);
				return runTests(validator, testObjects);
			});
		});
	});
});
