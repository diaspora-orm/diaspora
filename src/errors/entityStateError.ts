import { ExtendableError } from './extendableError';

/**
 * This class represents an error related to validation.
 */
export class EntityStateError extends ExtendableError {
	/**
	 * Construct a new error related to an invalide state of the entity.
	 *
	 * @author gerkin
	 * @param {*}      errorArgs        - Arguments to transfer to parent Error.
	 */
	constructor(message: string, ...errorArgs: any[]) {
		super(message, ...errorArgs);
	}
}
