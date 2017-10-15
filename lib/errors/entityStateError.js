'use strict';

const ExtendableError = require('./extendableError');

/**
 * This class represents an error related to validation.
 * @extends Error
 */
class EntityStateError extends ExtendableError {
	/**
	 * Construct a new error related to an invalide state of the entity.
	 * 
	 * @author gerkin
	 * @memberof Errors
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor( ...errorArgs ) {
		super( ...errorArgs );
	}
}

module.exports = EntityStateError;
