import { get, isInteger, map, isEmpty, some, isNil, compact, flatten, values, every, chain, assign, defaults, forEach, Dictionary, isString, isNumber, isDate, isBoolean, isObject, isArray, castArray, mapValues, omitBy } from 'lodash';

import { EntityTransformers as EntityTransformers_EntityTransformer } from './entityTransformer';
import EntityTransformer = EntityTransformers_EntityTransformer.AEntityTransformer;
import { PathStack } from './pathStack';
import { EntityValidationError } from '../errors/entityValidationError';
import { _ModelDescription, EFieldType } from '../types/modelDescription';
import { IEntityAttributes } from '../types/entity';

export namespace EntityTransformers{
	const messageRequired = ( keys: PathStack, fieldDesc: _ModelDescription.FieldDescriptor ) => `${keys.toValidatePath()} is a required property of type "${fieldDesc.type}"`;
	
	/**
	 * A checker is a function that can return an error component with provided standard args.
	 *
	 * @param   keys      - Pathstack so far.
	 * @param   fieldDesc - Description of the field.
	 * @param   value     - Value to check.
	 * @returns Error component.
	 */
	type CheckFunction = (
		this: CheckTransformer,
		keys: PathStack,
		fieldDesc: _ModelDescription.FieldDescriptor,
		value: any
	) => CheckTransformer.IErrorObjectFinal | undefined;
	
	/**
	 * Execute the simple tester and return an error component if it returns falsey.
	 *
	 * @param   tester - The test function to invoke.
	 * @returns Function to execute to validate the type.
	 */
	const validateWrongType = ( tester: ( value: any ) => boolean ): CheckFunction => (
		keys: PathStack,
		fieldDesc: _ModelDescription.FieldDescriptor,
		value: any
	): CheckTransformer.IErrorObjectFinal | undefined => {
		if ( !tester( value ) ) {
			return {
				type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
				value,
			};
		}
		return undefined;
	};
	
	/**
	 * Store for validation functions.
	 *
	 * @author Gerkin
	 */
	const VALIDATIONS = {
		TYPE: {
			/**
			 * String type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.STRING]: validateWrongType( isString ),
			/**
			 * Integer type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.INTEGER]: validateWrongType( isInteger ),
			/**
			 * Float type checker. Any numeric other NaN or ±Infinity is accepted
			 *
			 * @author Gerkin
			 */
			[EFieldType.FLOAT]: validateWrongType( isNumber ),
			/**
			 * Date type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.DATETIME]: validateWrongType( isDate ),
			/**
			 * Boolean type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.BOOLEAN]: validateWrongType( isBoolean ),
			/**
			 * Object type checker
			 *
			 * @param this      - Current validator to use
			 * @param keys      - PathStack containing keys to access this property
			 * @param fieldDesc - Description of the current field to check
			 * @param value     - Entity attributes to check
			 * @author Gerkin
			 */
			[EFieldType.OBJECT](
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: _ModelDescription.FieldDescriptor.IObjectFieldDescriptor,
				value: IEntityAttributes
			): CheckTransformer.IErrorObjectFinal | undefined {
				if ( !isObject( value ) ) {
					return {
						type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
						value,
					};
				} else {
					// Try each definition
					const deepTestErrors: Array<Dictionary<CheckTransformer.IErrorObjectFinal> | undefined> = map(
						fieldDesc.attributes,
						( objdDesc, defIndex ) => {
							const defErrors = this.applyObject( value, keys.clone().pushValidationProp( 'attributes', String( defIndex ) ), { getProps: false } );
							// Substitute empty error object with `undefined`
							return isEmpty( defErrors ) ? undefined : defErrors;
						}
					);
					// Check if at least one definition was OK
					if ( deepTestErrors.length === 0 || some( deepTestErrors, deepTestError => isNil( deepTestError ) ) ){
						return undefined;
					} else {
						return { children: compact( flatten( map( deepTestErrors, deepTestError => values( deepTestError ) ) ) ), value };
					}
				}
			},
			
			/**
			 * Array type checker
			 *
			 * @param this      - Current validator to use
			 * @param keys      - PathStack containing keys to access this property
			 * @param fieldDesc - Description of the current field to check
			 * @param values    - Entity attributes to check
			 * @author Gerkin
			 */
			[EFieldType.ARRAY](
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: _ModelDescription.FieldDescriptor.IArrayFieldDescriptor,
				values: any[]
			): CheckTransformer.IErrorObjectFinal | undefined {
				if ( !isArray( values ) ) {
					return {
						type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
						value: values,
					};
				} else {
					// For each value element
					const valuesTestErrors = map( values, ( value, valIndex ) => {
						// Try each definition
						const valueErrors: Array<CheckTransformer.IErrorObjectFinal | undefined> = map(
							fieldDesc.of,
							( arrFieldDesc, defIndex ) => {
								const defErrors = this.applyField(
									value,
									keys.clone().pushEntityProp( String( valIndex ) ).pushValidationProp( 'of', String( defIndex ) ),
									{getProps: false}
								);
								// Substitute empty error object with `undefined`
								return isEmpty( defErrors ) || isNil( defErrors ) ? undefined : defErrors;
							}
						);
						return valueErrors;
					} );
					// Check if at least one definition was OK
					if (
						valuesTestErrors.length === 0 ||
						every(
							valuesTestErrors,
							valueTestErrors => valueTestErrors.length === 0 || some(
								valueTestErrors,
								valueTestError => isNil( valueTestError )
							)
						)
					){
						return undefined;
					} else {
						return { children: compact( flatten( valuesTestErrors ) ), value: values };
					}
				}
			},

			/**
			 * Match all type checker
			 *
			 * @param this      - Current validator to use
			 * @param keys      - PathStack containing keys to access this property
			 * @param fieldDesc - Description of the current field to check
			 * @param value     - Entity attributes to check
			 * @author Gerkin
			 */
			[EFieldType.ANY](
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: _ModelDescription.FieldDescriptor,
				value: any
			): CheckTransformer.IErrorObjectFinal | undefined {
				return isNil( value )
				? {
					type: `${keys.toValidatePath()} expected to be assigned with any type`,
					value,
				}
				: undefined;
			},
			_(
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: _ModelDescription.FieldDescriptor,
				value: any
			): CheckTransformer.IErrorObjectFinal | undefined {
				return {
					type: `${keys.toValidatePath()} requires to be unhandled type "${fieldDesc.type}"`,
					value,
				};
			},
		},
	};

	/**
	 * The CheckTransformer class is used to check an entity or its fields against a model description.
	 */
	export class CheckTransformer extends EntityTransformer {
		/**
		 * Those validation steps are called one after one during the validation of a single field.
		 *
		 * @author Gerkin
		 */
		protected static validationSteps = [
			/**
			 * Apply the custom `validate` function or function array, if it exists.
			 *
			 * @param   validationArgs - Validation step argument.
			 * @returns This function returns nothing.
			 */
			function checkCustoms(
				this: CheckTransformer,
				validationArgs: CheckTransformer.IValidationStepArgs
			) {
				const { error, fieldDesc, keys, value } = validationArgs;
				// It the field has a `validate` property, try to use it
				const validateFcts = compact( castArray( fieldDesc.validate ) );
				validateFcts.forEach( validateFct => {
					if ( !validateFct.call( this, value, fieldDesc ) ) {
						error.validate = `${keys.toValidatePath()} custom validation failed`;
					}
				} );
			},
			
			/**
			 * Check if the type & the existence matches the `type` & `required` specifications.
			 *
			 * @param   validationArgs - Validation step argument.
			 * @returns This function returns nothing.
			 */
			function checkTypeRequired(
				this: CheckTransformer,
				validationArgs: CheckTransformer.IValidationStepArgs
			) {
				const { error, fieldDesc, keys, value } = validationArgs;
				// Check the type and the required status
				// Apply the `required` modifier
				if ( fieldDesc.required && isNil( value ) ) {
					error.required = messageRequired( keys, fieldDesc );
				} else if ( !isNil( value ) ) {
					assign(
						error,
						// Get the validator. Default to unhandled type
						get( VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._ ).call( this, keys, fieldDesc, value )
					);
				}
			},
			
			/**
			 * Verify if the value correspond to a value in the `enum` property.
			 *
			 * @param   validationArgs - Validation step argument.
			 * @returns This function returns nothing.
			 */
			function checkEnum(
				this: CheckTransformer,
				validationArgs: CheckTransformer.IValidationStepArgs
			) {
				const { error, keys, value } = validationArgs;
				const fieldDesc = validationArgs.fieldDesc;
				// Check enum values
				if (
					!isNil( value ) &&
					isArray( fieldDesc.enum )
				) {
					const result = some( fieldDesc.enum, enumVal => {
						if ( enumVal instanceof RegExp ) {
							return null !== value.match( enumVal );
						} else {
							return value === enumVal;
						}
					} );
					if ( !result ) {
						error.enum = `${keys.toValidatePath()} expected to have one of enumerated values "${JSON.stringify(
							fieldDesc.enum
						)}"`;
					}
				}
			},
		];

		/**
		 * Check if the value matches the field description provided, thus verify if it is valid.
		 *
		 * @author gerkin
		 */
		public apply( entity: IEntityAttributes ) {
			// Apply method `checkField` on each field described
			const checkResults = this.applyObject( entity, [], { getProps: false } );
			if ( !isNil( checkResults ) ) {
				throw new EntityValidationError( checkResults, 'Validation failed' );
			}
			return entity;
		}

		/**
		 * Validates the given entity attributes at a defined path
		 * 
		 * @author gerkin
		 * @param value   - Entity's attributes to test
		 * @param keys    - Path to this point of the entity
		 * @param options - Additional options for the validation
		 */
		public applyObject(
			value: IEntityAttributes,
			keys: PathStack | string[],
			options: { getProps: boolean } = { getProps: false }
		){
			defaults( options, { getProps: true } );
			const keysPathStack = keys instanceof PathStack ? keys : new PathStack( keys );

			const subObj = options.getProps ? keysPathStack.getProp( value ) : value;
			const fieldDesc = keysPathStack.getDesc( this.modelAttributes );
			const outObjectErrors = omitBy(
				mapValues( fieldDesc, ( fieldDesc, field ) => this.applyField( subObj[field], keysPathStack.clone().pushProp( field ), {
					getProps: false,
				} ) ),
				isEmpty
			) as Dictionary<CheckTransformer.IErrorObjectFinal>;
			if ( isEmpty( outObjectErrors ) ){
				return undefined;
			} else {
				return outObjectErrors;
			}
		}
		
		/**
		 * Check if the value matches the field description provided, thus verify if it is valid.
		 *
		 * @author gerkin
		 * @param   value   - Value to check.
		 * @param   keys    - Pathstack representing path to this validation.
		 * @param   options - Hash of options.
		 * @returns Hash describing errors.
		 */
		public applyField(
			value: any,
			keys: PathStack | string[],
			options: { getProps: boolean } = { getProps: false }
		): CheckTransformer.IErrorObjectFinal | null {
			defaults( options, { getProps: true } );
			if ( !( keys instanceof PathStack ) ) {
				keys = new PathStack( keys );
			}
			
			const val = options.getProps ? get( value, keys.segmentsEntity ) : value;
			const fieldDesc = get( this.modelAttributes, keys.segmentsValidation );
			// TODO: Add checks for strict models (like if we are using MySQL)
			if ( !isObject( fieldDesc ) ) {
				return null;
			}
			
			const error: CheckTransformer.IErrorObject = {};
			
			const stepsArgs = {
				error,
				fieldDesc,
				keys,
				value: val,
			};
			
			forEach( CheckTransformer.validationSteps, validationStep =>
				validationStep.call( this, stepsArgs )
			);
			
			if ( !isEmpty( error ) ) {
				const finalError = defaults( { value } as CheckTransformer.IErrorObjectFinal, error );
				return finalError;
			} else {
				return null;
			}
		}
	}

	export namespace CheckTransformer{
		export interface IErrorObject {
			validate?: string;
			type?: string;
			spec?: string;
			required?: string;
			enum?: string;
			children?: IErrorObjectFinal[] | { [key: string]: IErrorObjectFinal };
		}

		export interface IErrorObjectFinal extends IErrorObject {
			value: any;
		}

		/**
		 * This object can be passed through each validation steps.
		 *
		 * @author Gerkin
		 */
		export interface IValidationStepArgs {
			/**
			 * Error object to extend.
			 *
			 * @author Gerkin
			 */
			error: IErrorObject;
			/**
			 * Description of the field.
			 *
			 * @author Gerkin
			 */
			fieldDesc: _ModelDescription.FieldDescriptor;
			/**
			 * Pathstack representing keys so far.
			 *
			 * @author Gerkin
			 */
			keys: PathStack;
			/**
			 * Value to check.
			 *
			 * @author Gerkin
			 */
			value: any;
		}
	}
}
