'use strict';

const {_} = require( '../../dependencies' );

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
			let limitOpt = opts.limit;
			if ( _.isString( limitOpt )) {
				limitOpt = parseInt( limitOpt );
			}
			if ( !_.isInteger( limitOpt ) && isFinite( limitOpt )) {
				throw new TypeError( 'Expect "options.limit" to be a integer' );
			} else if ( limitOpt < 0 ) {
				throw new RangeError( `Expect "options.limit" to be an integer equal to or above 0, have ${ limitOpt }` );
			}
			opts.limit = limitOpt;
		},
		skip( opts ) {
			let skipOpt = opts.skip;
			if ( _.isString( skipOpt )) {
				skipOpt = parseInt( skipOpt );
			}
			if ( !_.isInteger( skipOpt ) && isFinite( skipOpt )) {
				throw new TypeError( 'Expect "options.skip" to be a integer' );
			} else if ( !isFinite( skipOpt ) || skipOpt < 0 ) {
				throw new RangeError( `Expect "options.skip" to be a finite integer equal to or above 0, have ${ skipOpt }` );
			}
			opts.skip = skipOpt;
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
			let pageOpt = opts.page;
			if ( _.isString( pageOpt )) {
				pageOpt = parseInt( pageOpt );
			}
			if ( !_.isInteger( pageOpt ) && isFinite( pageOpt )) {
				throw new TypeError( 'Expect "options.page" to be a integer' );
			} else if ( !isFinite( pageOpt ) || pageOpt < 0 ) {
				throw new RangeError( `Expect "options.page" to be a finite integer equal to or above 0, have ${ pageOpt }` );
			}
			opts.skip = pageOpt * opts.limit;
			delete opts.page;
		},
	},
};
