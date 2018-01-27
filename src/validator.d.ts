import * as Diaspora from '.';
import { EntityObject } from '.';

declare module '.' {
	export namespace Validation {
		interface ErrorObject {}
		export type CheckFunction = (
			keys: PathStack,
			fieldDesc: { type: string },
			value: any
		) => ErrorObject | undefined;

		export type TypeChecker = (value: any) => boolean;
		export interface TypeErrorObject extends ErrorObject {
			type: string;
		}

		export interface ValidationStepArgs {
			error: ErrorObject;
			fieldDesc: Diaspora.Model.FieldDescriptor;
			keys: PathStack;
			value: any;
		}

		/**
		 * The PathStack class allows model validation to follow different paths in model description & entity.
		 */
		class PathStack {
			private segmentsEntity: string[];
			private segmentsValidation: string[];
			/**
			 * Constructs a pathstack.
			 *
			 * @author gerkin
			 */
			constructor(segmentsEntity: string[], segmentsValidation: string[]);

			/**
			 * Add a path segment for entity navigation.
			 *
			 * @param   {...string} prop - Properties to add.
			 * @returns {module:Validator~PathStack} Returns `this`.
			 */
			pushEntityProp(...prop: string[]): this;

			/**
			 * Add a path segment for model description navigation.
			 */
			pushValidationProp(...prop: string[]): this;

			/**
			 * Add a path segment for both entity & model description navigation.
			 */
			pushProp(...prop: string[]): this;

			/**
			 * Get a string version of entity segments.
			 */
			toValidatePath(): string;

			/**
			 * Cast this PathStack to its representing arrays.
			 */
			toArray(): string[][];

			/**
			 * Duplicate this PathStack, detaching its state from the new.
			 */
			clone(): PathStack;
		}
		/**
		 * The Validator class is used to check an entity or its fields against a model description.
		 */
		class Validator {
			private _modelDesc: object;
			/**
			 * Construct a Validator configured for the provided model.
			 */
			constructor(_modelDesc: object);

			/**
			 * Check if the value matches the field description provided, thus verify if it is valid.
			 */
			validate(entity: EntityObject): ErrorObject[];

			/**
			 * Check if the value matches the field description provided, thus verify if it is valid.
			 */
			check(value: any, keys: PathStack, options: object): ErrorObject;

			modelDesc(): object;

			/**
			 * Get the PathStack constructor.
			 */
			static PathStack(): typeof PathStack;
		}
	}
}
