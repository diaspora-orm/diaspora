import { ExtendableError } from './extendableError';

/**
 * This class represents an error related to validation.
 */
export abstract class ValidationError extends ExtendableError {
	protected abstract stringifyValidationError(): string;
}
