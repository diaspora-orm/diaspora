'use strict';

const _ = require('lodash');

const stringifyValidationObject = validationErrors => {
	return _(validationErrors).mapValues((error, key) => {
		return `${key} => ${JSON.stringify(error.value)}
* ${_(error).omit(['value']).values().map(_.identity).value()}`;
	}).values().join('\n* ');
}

class ValidationError extends Error{
	constructor(validationErrors, message, ...errorArgs){
		message += `
${stringifyValidationObject(validationErrors)}`
		super(message, ...errorArgs);
		this.validationErrors = validationErrors;
		if(Error.captureStackTrace){
			Error.captureStackTrace(this, this.constructor);
		}
	}
}

module.exports = ValidationError;