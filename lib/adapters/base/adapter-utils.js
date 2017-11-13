'use strict';

const {_} = require( '../../dependencies' );

const getNum = ( fullMatch, sign, val ) => {
	if ( '∞' === val ) {
		if ( '-' === sign ) {
			return -Infinity;
		} else {
			return Infinity;
		}
	} else {
		return parseInt( fullMatch );
	}
};

const validations = {
	type: {
		int( key, val ) {
			if ( _.isString( val )) {
				val = parseInt( val );
			}
			if ( !_.isInteger( val ) && isFinite( val )) {
				throw new TypeError( `Expect "${ key }" to be an integer`	 );
			}
			return val;
		},
	},
	rng( key, val, range ) {
		const rangeMatch = range.match( /^([[\]])((-)?(\d+|∞)),((-)?(\d+|∞))([[\]])$/ );
		if ( rangeMatch ) {
			const lower = getNum( ...( rangeMatch.splice( 2, 3 )));
			const upper = getNum( ...( rangeMatch.splice( 2, 3 )));
			const isInRangeLower = '[' === rangeMatch[1] ? val >= lower : val > lower;
			const isInRangeUpper = ']' === rangeMatch[2] ? val <= upper : val < upper;
			if ( !( isInRangeLower && isInRangeUpper )) {
				throw new RangeError( `Expect "${ key }" to be within ${ range }, have "${ val }"` );
			}
		}
		return val;
	},
};
const validateOption = ( key, val, config ) => {
	if ( validations.type[config.type]) {
		val = validations.type[config.type]( key, val );
	}
	if ( config.rng ) {
		val = validations.rng( key, val, config.rng );
	}
	return val;
};

module.exports = {
	OPERATORS: {
		$exists:       ( entityVal, targetVal ) => targetVal === !_.isUndefined( entityVal ),
		$equal:        ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal === targetVal,
		$diff:         ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal !== targetVal,
		$less:         ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal < targetVal,
		$lessEqual:    ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal <= targetVal,
		$greater:      ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal > targetVal,
		$greaterEqual: ( entityVal, targetVal ) => !_.isUndefined( entityVal ) && entityVal >= targetVal,
	},
	CANONICAL_OPERATORS: {
		'~':  '$exists',
		'==': '$equal',
		'!=': '$diff',
		'<':  '$less',
		'<=': '$lessEqual',
		'>':  '$greater',
		'>=': '$greaterEqual',
	},
	QUERY_OPTIONS_TRANSFORMS: {
		limit( opts ) {
			opts.limit = validateOption( 'limit', opts.limit, {
				type: 'int',
				rng:  '[0,∞]',
			});
		},
		skip( opts ) {
			opts.skip = validateOption( 'skip', opts.skip, {
				type: 'int',
				rng:  '[0,∞[',
			});
		},
		page( opts ) {
			if ( !opts.hasOwnProperty( 'limit' )) {
				throw new ReferenceError( 'Usage of "options.page" requires "options.limit" to be defined.' );
			}
			if ( !isFinite( opts.limit )) {
				throw new RangeError( 'Usage of "options.page" requires "options.limit" to not be infinite' );
			}
			if ( opts.hasOwnProperty( 'skip' )) {
				throw new ReferenceError( 'Use either "options.page" or "options.skip"' );
			}
			opts.skip = validateOption( 'page', opts.page, {
				type: 'int',
				rng:  '[0,∞[',
			}) * opts.limit;
			delete opts.page;
		},
	},
};
