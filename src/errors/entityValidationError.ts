import * as _ from 'lodash';

import { ErrorObjectFinal } from '../validator';
import { ValidationError } from './validationError';

/**
 * This class represents an error related to validation on an entity.
 */
export class EntityValidationError extends ValidationError {
	private readonly validationErrors: { [key: string]: ErrorObjectFinal };
	/**
	 * Construct a new validation error.
	 */
	public constructor(
		validationErrors: { [key: string]: ErrorObjectFinal },
		message: string,
		...errorArgs: any[]
	) {
		super( message, ...errorArgs );
		this.validationErrors = validationErrors;
		this.message += `
		${this.stringifyValidationError()}`;
	}

	private static stringifyErrorComponent( error: ErrorObjectFinal ) {
		return `${JSON.stringify( error.value )}
		 * ${_.chain( error )
				.omit( ['value'] )
				.values()
				.map( _.identity )
				.value()}`;
	}

	protected stringifyValidationError() {
		return _.chain( this.validationErrors )
			.mapValues(
				( error, key ) =>
					`${key} => ${EntityValidationError.stringifyErrorComponent( error )}`
			)
			.values()
			.join( '\n* ' )
			.value();
	}
}
