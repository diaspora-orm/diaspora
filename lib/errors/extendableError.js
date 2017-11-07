'use strict';

/**
 * @module Errors/ExtendableError
 */

/**
 * This class is the base class for custom Diaspora errors
 *
 * @extends Error
 */

class ExtendableError extends Error {
	/**
	 * Construct a new extendable error.
	 *
	 * @author gerkin
	 * @param {string} message          - Message of this error.
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( message, ...errorArgs ) {
		super( message, ...errorArgs );
		//		this.constructor = super.target;
		//		this.__proto__ = super.target;
		if ( 'function' === typeof Error.captureStackTrace ) {
			Error.captureStackTrace( this, super.target );
		} else {
			this.stack = ( new Error( message )).stack;
		}
	}
}

module.exports = ExtendableError;
