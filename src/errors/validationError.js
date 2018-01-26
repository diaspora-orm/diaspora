'use strict';

const ExtendableError = require( './extendableError' );

/**
 * This class represents an error related to validation.
 *
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class ValidationError extends ExtendableError {}

module.exports = ValidationError;
