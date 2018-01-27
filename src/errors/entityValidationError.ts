import { _ } from '../dependencies';
import { ValidationError } from './validationError';
import { Validation } from '../';

import ErrorObjectFinal = Validation.ErrorObjectFinal;

const stringifyValidationObject = (validationErrors: ErrorObjectFinal[]) => {
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
	private validationErrors: ErrorObjectFinal[];
	/**
	 * Construct a new validation error.
	 */
	constructor(
		validationErrors: ErrorObjectFinal[],
		message: string,
		...errorArgs: any[]
	) {
		message += `
${stringifyValidationObject(validationErrors)}`;
		super(message, ...errorArgs);
		this.validationErrors = validationErrors;
	}
}
