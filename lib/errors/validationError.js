'use strict';

const ExtendableError = require( './extendableError' );

class ValidationError extends ExtendableError {}

module.exports = ValidationError;
