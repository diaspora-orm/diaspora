'use strict';

const {
	_,
} = require( '../dependencies' );
const ValidationError = require( './validationError' );

const stringifyValidationObject = validationErrors => {
	return _( validationErrors ).mapValues(( error, key ) => {
		return `${ key } => ${ JSON.stringify( error.value ) }
* ${ _( error ).omit([ 'value' ]).values().map( _.identity ).value() }`;
	}).values().join( '\n* ' );
};

/**
 * @module Errors/EntityValidationError
 */

/**
 * This class represents an error related to validation.
 *
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class EntityValidationError extends ValidationError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @param {Object} validationErrors - Object describing validation errors, usually returned by {@link Diaspora.check}.
	 * @param {string} message          - Message of this error.
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( validationErrors, message, ...errorArgs ) {
		message += `
${ stringifyValidationObject( validationErrors ) }`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
	}
}

module.exports = EntityValidationError;
