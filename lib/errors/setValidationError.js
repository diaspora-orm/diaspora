'use strict';

const {
	_,
} = require( '../dependencies' );
const ValidationError = require( './validationError' );

/**
 * @module Errors/SetValidationError
 */

/**
 * This class represents an error related to validation on a set.
 *
 * @extends module:Errors/ValidationError~ValidationError
 */
class SetValidationError extends ValidationError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @param {string}                                                      message          - Message of this error.
	 * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
	 * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( message, validationErrors, ...errorArgs ) {
		message += `[\n${ _( validationErrors ).map(( error, index ) => {
			if ( _.isNil( error )) {
				return false;
			} else {
				return `${ index  }: ${  error.message.replace( /\n/g, '\n	' ) }`;
			}
		}).filter( _.identity ).join( ',\n' ) }\n]`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
	}
}

module.exports = SetValidationError;
