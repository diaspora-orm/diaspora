import * as _ from 'lodash';

import { ValidationError } from './validationError';
import { EntityValidationError } from './entityValidationError';

/**
 * This class represents an error related to validation on a set.
 */
export class SetValidationError extends ValidationError {
	public readonly validationErrors: EntityValidationError[];
	
	/**
	 * Construct a new set validation error.
	 *
	 * @author gerkin
	 * @see Diaspora.check
	 * @param message          - Message of this error.
	 * @param validationErrors - Array of validation errors.
	 * @param errorArgs        - Arguments to transfer to parent Error.
	 */
	public constructor(
		message: string,
		validationErrors: EntityValidationError[],
		...errorArgs: any[]
	) {
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
		this.message += `[\n${this.stringifyValidationError()}\n]`;
	}
	
	/**
	 * Concatenate each validation error to generate a readable message
	 *
	 * @author Gerkin
	 */
	protected stringifyValidationError() {
		return _.chain( this.validationErrors )
		.map( ( error, index ) => {
			if ( _.isNil( error ) ) {
				return false;
			} else {
				return `${index}: ${error.message.replace( /\n/g, '\n	' )}`;
			}
		} )
		.filter( _.identity )
		.join( ',\n' )
		.value();
	}
}
