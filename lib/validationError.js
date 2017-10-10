'use strict';

const {
	_,
} = require( 'lib/dependencies' );

const stringifyValidationObject = validationErrors => {
	return _( validationErrors ).mapValues(( error, key ) => {
		return `${ key } => ${ JSON.stringify( error.value ) }
* ${ _( error ).omit([ 'value' ]).values().map( _.identity ).value() }`;
	}).values().join( '\n* ' );
};

class ValidationError extends Error {
	/**
	 * @class ValidationError
	 * @classdesc This class represents an error related to validation
	 * @extends Error
	 * @description Construct a new validation error
	 * @public
	 * @author gerkin
	 * @see Diaspora.check
	 * @param {Object} validationErrors Object describing validation errors, usually returned by {@link Diaspora.check}
	 * @param {String} message          Message of this error
	 * @param {*} errorArgs...        Arguments to transfer to parent Error
	 */
	constructor( validationErrors, message, ...errorArgs ) {
		message += `
${ stringifyValidationObject( validationErrors ) }`;
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
		if ( Error.captureStackTrace ) {
			Error.captureStackTrace( this, this.constructor );
		}
	}
}

module.exports = ValidationError;
