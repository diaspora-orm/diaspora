import _ from 'lodash';

import { ValidationError } from './validationError';
import { ErrorObjectFinal } from '../validator';

const stringifyValidationObject = (validationErrors: {
	[key: string]: ErrorObjectFinal;
}) => {
	return _(validationErrors)
		.mapValues((error: ErrorObjectFinal, key) => {
			return `${key} => ${JSON.stringify(error.value)}
* ${_(error)
				.omit(['value'])
				.values()
				.map(_.identity)
				.value()}`;
		})
		.values()
		.join('\n* ');
};

/**
 * This class represents an error related to validation on an entity.
 */
export class EntityValidationError extends ValidationError {
	private validationErrors: { [key: string]: ErrorObjectFinal };
	/**
	 * Construct a new validation error.
	 */
	constructor(
		validationErrors: { [key: string]: ErrorObjectFinal },
		message: string,
		...errorArgs: any[]
	) {
		message += `
${stringifyValidationObject(validationErrors)}`;
		super(message, ...errorArgs);
		this.validationErrors = validationErrors;
		Object.setPrototypeOf(this, EntityValidationError.prototype);
	}
}
