import * as Diaspora from '../';
import { Validation } from '../';

declare module '../' {
	export namespace Errors {
		class ValidationError {
			private validationErrors: Validation.ErrorObjectFinal[];
		}
		export class EntityStateError {}
		export class EntityValidationError extends ValidationError {}
		export class SetValidationError extends ValidationError {}

		//class ExtendableError{}
	}
}
