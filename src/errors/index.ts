import { EntityStateError as _EntityStateError } from './entityStateError';
import { EntityValidationError as _EntityValidationError } from './entityValidationError';
import { SetValidationError as _SetValidationError } from './setValidationError';

import { ExtendableError as _ExtendableError } from './extendableError';
import { ValidationError as _ValidationError } from './validationError';

export namespace Errors {
  export const ExtendableError = _ExtendableError;
  export type ExtendableError = _ExtendableError;
  export const ValidationError = _ValidationError;
  export type ValidationError = _ValidationError;

  export const EntityStateError = _EntityStateError;
  export type EntityStateError = _EntityStateError;
  export const EntityValidationError = _EntityValidationError;
  export type EntityValidationError = _EntityValidationError;
  export const SetValidationError = _SetValidationError;
  export type SetValidationError = _SetValidationError;
}
