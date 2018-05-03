import {EntityStateError as _EntityStateError} from './entityStateError';
import {EntityValidationError as _EntityValidationError} from './entityValidationError';
import {SetValidationError as _SetValidationError} from './setValidationError';

export namespace Errors{
	export const EntityStateError = _EntityStateError;
	export const EntityValidationError = _EntityValidationError;
	export const SetValidationError = _SetValidationError;
}
