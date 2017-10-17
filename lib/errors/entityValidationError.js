'use strict';

const {
	_,
} = require( '../dependencies' );
const ExtendableError = require( './extendableError' );

const stringifyValidationObject = validationErrors => {
	return _( validationErrors ).mapValues(( error, key ) => {
		return `${ key } => ${ JSON.stringify( error.value ) }
* ${ _( error ).omit([ 'value' ]).values().map( _.identity ).value() }`;
	}).values().join( '\n* ' );
};

/**
 * This class represents an error related to validation.
 *
 * @extends Error
 * @memberof Errors
 */
class EntityValidationError extends ExtendableError {
	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @memberof Errors
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
