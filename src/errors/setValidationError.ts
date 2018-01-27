import { _ } from '../dependencies';
import { ValidationError } from './validationError';
import { EntityValidationError } from './entityValidationError';

/**
 * This class represents an error related to validation on a set.
 */
export class SetValidationError extends ValidationError {
	private validationErrors: EntityValidationError[];

	/**
	 * Construct a new validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @param {string}                                                      message          - Message of this error.
	 * @param {module:Errors/EntityValidationError~EntityValidationError[]} validationErrors - Array of validation errors.
	 * @param {*}                                                           errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor(
		message: string,
		validationErrors: EntityValidationError[],
		...errorArgs: any[]
	) {
		message += `[\n${_(validationErrors)
			.map((error, index) => {
				if (_.isNil(error)) {
					return false;
				} else {
					return `${index}: ${error.message.replace(/\n/g, '\n	')}`;
				}
			})
			.filter(_.identity)
			.join(',\n')}\n]`;
		super(message, ...errorArgs);
		this.validationErrors = validationErrors;
	}
}
