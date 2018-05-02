import { ExtendableError } from './extendableError';

/**
 * This class represents an error related to validation.
 * 
 * @author Gerkin
 */
export abstract class ValidationError extends ExtendableError {
	/**
	 * Returns a displayable string to resume the validation error.
	 * 
	 * @author Gerkin
	 */
	protected abstract stringifyValidationError(): string;
}
