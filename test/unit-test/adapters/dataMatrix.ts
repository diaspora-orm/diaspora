import * as _ from 'lodash';

export type RootType = string | Array<string & number & boolean & undefined> | undefined;
interface IDictionary<TValue> {
	[Key: string]: TValue;
}
type AnyDictionary<TValue> = IDictionary<TValue> | TValue[];
export type Concatenable = string | any[];
/**
 * Generate all combination of arguments when given arrays or strings
 * e.g. [['Ben','Jade','Darren'],['Smith','Miller']] to [['Ben','Smith'],[..]]
 * e.g. 'the','cat' to [['t', 'c'],['t', 'a'], ...]
 * 
 * @param args - 
 */
function _cartesianProductOf( args: Concatenable[] | Concatenable[][] ) {

	// strings to arrays of letters
	const arrayCharData = _.map( args, opt => typeof opt === 'string' ? _.toArray( opt ) : opt ) as Concatenable[][];

	return _.reduce(
		arrayCharData,
		( acc, rightOperands ) => _.flatten(
			_.map( acc, accItem =>
				_.map( rightOperands, ( rightOperand ) => 
					_.concat( accItem,[rightOperand] )
				)
			)
		),
		[ [] ] as Concatenable[][]
	) as Concatenable[][];
}

/**
 * Generate all combination of arguments from objects
 * @param opts - An object or arrays with keys describing options  {firstName:['Ben','Jade','Darren'],lastName:['Smith','Miller']}, or
 * an array of objects e.g. [{firstName:'Ben',LastName:'Smith'},{..]
 */
function _cartesianProductObj( optObj: IDictionary<Concatenable[]> | Array<AnyDictionary<Concatenable>> ){
	const keys = _.keys( optObj );
	const opts = _.values( optObj ) as Concatenable[][];
	const combs = _cartesianProductOf( opts );
	return _.map( combs, comb => _.zipObject( keys, comb ) );
}
/**
 * Generate the cartesian product of input objects, arrays, or strings
 *
 *    product('me','hi')
 *    // => [["m","h"],["m","i"],["e","h"],["e","i"]]
 *    product([1,2,3],['a','b','c']
 *    // => [[1,"a"],[1,"b"],[1,"c"],[2,"a"],[2,"b"],[2,"c"],[3,"a"],[3,"b"],[3,"c"]]
 *    product({who:['me','you'],say:['hi','by']})
 *    // => [{"who":"me","say":"hi"},{"who":"me","say":"by"},{"who":"you","say":"hi"},{"who":"you","say":"by"}]
 *    // It also takes in a single array of args
 *    product(['me','hi'])
 *    // => [["m","h"],["m","i"],["e","h"],["e","i"]]
 */
export function product( opts: IDictionary<any[]> ): Array<IDictionary<any>>;
export function product( opts: Concatenable[] | Concatenable[][] ): Concatenable[][];
export function product( opts: Concatenable[] | Concatenable[][] | IDictionary<any[]> ){
	if ( !_.isArray( opts ) ) {
		return _cartesianProductObj( opts );
	} else {
		return _cartesianProductOf( opts );
	}
}
