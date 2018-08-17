import * as _ from 'lodash';

import { Adapter } from './adapter';
import { QueryLanguage } from '../../types/queryLanguage';
import { IEnumeratedHash } from '../../types/dataSourceQuerier';
import { IEntityAttributes } from '../../types/entity';

export interface IConstructable<TClass> {
	new ( ...args: any[] ): TClass;
}

const getNum = ( ...params: Array<string | string[]> ) => {
	const flatten = _.flattenDeep( params ) as string[];
	const [fullMatch, sign, val] = flatten;
	if ( '∞' === val ) {
		if ( '-' === sign ) {
			return -Infinity;
		} else {
			return Infinity;
		}
	} else {
		return parseInt( fullMatch, 10 );
	}
};

const validations = {
	type: {
		int( key: string, val: string | number ) {
			if ( _.isString( val ) ) {
				val = parseInt( val, 10 );
			}
			if ( !_.isInteger( val ) && isFinite( val ) ) {
				throw new TypeError( `Expect "${key}" to be an integer` );
			}
			return val;
		},
	},
	rng( key: string, val: string | number, range: string ) {
		const rangeMatch = range.match(
			/^([[\]])((-)?(\d+|∞)),((-)?(\d+|∞))([[\]])$/
		);
		if ( rangeMatch ) {
			const lower = getNum( rangeMatch.splice( 2, 3 ) );
			const upper = getNum( rangeMatch.splice( 2, 3 ) );
			const isInRangeLower = '[' === rangeMatch[1] ? val >= lower : val > lower;
			const isInRangeUpper = ']' === rangeMatch[2] ? val <= upper : val < upper;
			if ( !( isInRangeLower && isInRangeUpper ) ) {
				throw new RangeError(
					`Expect "${key}" to be within ${range}, have "${val}"`
				);
			}
		}
		return val;
	},
};
const validateOption = (
	key: string,
	val: string | number,
	config: { type: string; rng?: string }
): any => {
	const valTypes: any = validations.type;
	if ( valTypes[config.type] ) {
		val = valTypes[config.type]( key, val );
	}
	if ( config.rng ) {
		val = validations.rng( key, val, config.rng );
	}
	return val;
};

/**
 * TODO.
 *
 * @author gerkin
 * @see TODO remapping.
 */
export const remapIO = <TEntity extends IEntityAttributes>(
	adapter: Adapter<any>,
	tableName: string,
	query: TEntity,
	input: boolean
) => {
	const direction = input ? 'input' : 'output';
	const filtered = _.mapValues( query, ( value, key ) => {
		const filter = _.get(
			adapter,
			['filters', tableName, direction, key],
			undefined
		);
		if ( _.isFunction( filter ) ) {
			return filter( value );
		}
		return value;
	} );
	const remapType = input ? 'normal' : 'inverted';
	const remaped = _.mapKeys( filtered, ( value, key ) => _.get( adapter, ['remaps', tableName, remapType, key], key ) );
	return remaped as TEntity;
};

export type IQueryCheckFunction = ( entityVal: any, targetVal: any ) => boolean;

export const OPERATORS: IEnumeratedHash<IQueryCheckFunction | undefined> = {
	$exists: ( entityVal: any, targetVal: any ) =>
	targetVal === !_.isUndefined( entityVal ),
	$equal: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal === targetVal,
	$diff: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal !== targetVal,
	$less: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal < targetVal,
	$lessEqual: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal <= targetVal,
	$greater: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal > targetVal,
	$greaterEqual: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) && entityVal >= targetVal,
	$contains: ( entityVal: any, targetVal: any ) =>
	!_.isUndefined( entityVal ) &&
	_.isArray( entityVal ) &&
	_.some( entityVal, val => _.isEqual( val, targetVal ) ),
};
export const CANONICAL_OPERATORS: IEnumeratedHash<string> = {
	'~': '$exists',
	'==': '$equal',
	'!=': '$diff',
	'<': '$less',
	'<=': '$lessEqual',
	'>': '$greater',
	'>=': '$greaterEqual',
};
export const QUERY_OPTIONS_TRANSFORMS: IEnumeratedHash<
( ( ops: QueryLanguage.Raw.IQueryOptions ) => void )
> = {
	limit( opts: QueryLanguage.Raw.IQueryOptions ) {
		opts.limit = validateOption( 'limit', opts.limit as number, {
			type: 'int',
			rng: '[0,∞]',
		} );
	},
	skip( opts: QueryLanguage.Raw.IQueryOptions ) {
		opts.skip = validateOption( 'skip', opts.skip as number, {
			type: 'int',
			rng: '[0,∞[',
		} );
	},
	page( opts: QueryLanguage.Raw.IQueryOptions ) {
		if ( !_.isNumber( opts.limit ) ) {
			throw new ReferenceError(
				'Usage of "options.page" requires "options.limit" to be defined.'
			);
		}
		if ( !isFinite( opts.limit as number ) ) {
			throw new RangeError(
				'Usage of "options.page" requires "options.limit" to not be infinite'
			);
		}
		if ( !_.isNil( opts.skip ) ) {
			throw new ReferenceError( 'Use either "options.page" or "options.skip"' );
		}
		opts.skip =
		validateOption( 'page', opts.page as number, {
			type: 'int',
			rng: '[0,∞[',
		} ) * ( opts.limit as number );
		delete opts.page;
	},
};
