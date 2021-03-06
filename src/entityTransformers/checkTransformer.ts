import * as _ from 'lodash';

import { EntityTransformers as EntityTransformers_EntityTransformer } from './entityTransformer';
import EntityTransformer = EntityTransformers_EntityTransformer.AEntityTransformer;
import { PathStack } from './pathStack';
import { EntityValidationError } from '../errors/entityValidationError';
import { FieldDescriptor, EFieldType, Raw } from '../types/modelDescription';
import { IEntityAttributes } from '../types/entity';

export namespace EntityTransformers{
	/**
	 * Prepare the check of each items in the array.
	 *
	 * @param   validator - Validator instance that do this call.
	 * @param   fieldDesc - Description of the field to check.
	 * @param   keys      - Keys so far.
	 * @returns Function to execute to validate array items.
	 */
	const validateArrayItems = (
		validator: CheckTransformer,
		fieldDesc: Raw.FieldDescriptor.IArrayFieldDescriptor,
		keys: PathStack
	) => (
		propVal: any,
		index: number
	): CheckTransformer.IErrorObjectFinal[] | CheckTransformer.IErrorObjectFinal | null => {
		if ( fieldDesc.hasOwnProperty( 'of' ) ) {
			const ofArray = _.castArray( fieldDesc.of );
			const subErrors = _.chain( ofArray ).map( ( desc, subIndex ) =>
			validator.applyField(
				propVal,
				keys
				.clone()
				.pushValidationProp( 'of', ( _.isArray( fieldDesc.of )
				? String( subIndex )
				: undefined ) as string )
				.pushEntityProp( String( index ) ),
				{ getProps: false } )
			);
			
			if ( !_.isArray( fieldDesc.of ) ) {
				// Just get the first or default to null
				return subErrors.get( 0 ).value();
			} else if ( subErrors.every( subError => !_.isNil( subError ) ).value() ) {
				return subErrors.compact().value();
			}
		}
		return null;
	};
	
	const messageRequired = ( keys: PathStack, fieldDesc: FieldDescriptor ) => `${keys.toValidatePath()} is a required property of $type "${fieldDesc.type}"`;
	
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
		fieldDesc: FieldDescriptor,
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
		fieldDesc: FieldDescriptor,
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
			[EFieldType.STRING]: validateWrongType( _.isString ),
			/**
			 * Integer type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.INTEGER]: validateWrongType( _.isInteger ),
			/**
			 * Float type checker. Any numeric other NaN or ±Infinity is accepted
			 *
			 * @author Gerkin
			 */
			[EFieldType.FLOAT]: validateWrongType( _.isNumber ),
			/**
			 * Date type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.DATETIME]: validateWrongType( _.isDate ),
			/**
			 * Boolean type checker
			 *
			 * @author Gerkin
			 */
			[EFieldType.BOOLEAN]: validateWrongType( _.isBoolean ),
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
				fieldDesc: FieldDescriptor.IObjectFieldDescriptor,
				value: IEntityAttributes
			): CheckTransformer.IErrorObjectFinal | undefined {
				if ( !_.isObject( value ) ) {
					return {
						type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
						value,
					};
				} else {
					const deepTest = ( _.isObject( fieldDesc.attributes )
					? _.chain( _.assign( {}, fieldDesc.attributes, value ) )
					.mapValues( ( pv, propName ) => {
						const propVal = value[propName];
						return this.applyField(
							propVal,
							keys
							.clone()
							.pushValidationProp( 'attributes' )
							.pushProp( propName ),
							{ getProps: false }
						);
					} ).omitBy( _.isEmpty ).omitBy( _.isNil ).value()
					: {} ) as { [key: string]: CheckTransformer.IErrorObjectFinal };
					return _.isEmpty( deepTest ) ? undefined : { children: deepTest, value };
				}
			},
			
			/**
			 * Array type checker
			 *
			 * @param this      - Current validator to use
			 * @param keys      - PathStack containing keys to access this property
			 * @param fieldDesc - Description of the current field to check
			 * @param value     - Entity attributes to check
			 * @author Gerkin
			 */
			[EFieldType.ARRAY](
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: FieldDescriptor.IArrayFieldDescriptor,
				value: any[]
			): CheckTransformer.IErrorObjectFinal | undefined {
				if ( !_.isArray( value ) ) {
					return {
						type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
						value,
					};
				} else {
					const deepTest = ( _.isObject( fieldDesc.of )
					? _.chain( value )
					.map( validateArrayItems( this, fieldDesc, keys ) )
					.omitBy( _.isEmpty )
					.omitBy( _.isNil )
					.value()
					: [] ) as CheckTransformer.IErrorObjectFinal[];
					if ( !_.isEmpty( deepTest ) ) {
						return { children: deepTest, value };
					} else {
						return undefined;
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
				fieldDesc: FieldDescriptor,
				value: any
			): CheckTransformer.IErrorObjectFinal | undefined {
				return _.isNil( value )
				? {
					type: `${keys.toValidatePath()} expected to be assigned with any type`,
					value,
				}
				: undefined;
			},
			_(
				this: CheckTransformer,
				keys: PathStack,
				fieldDesc: FieldDescriptor,
				value: any
			): CheckTransformer.IErrorObjectFinal | undefined {
				return {
					type: `${keys.toValidatePath()} requires to be unhandled type "${
						fieldDesc.type
					}"`,
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
				const validateFcts = _.chain( fieldDesc.validate as Function[] )
				.castArray()
				.compact()
				.value();
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
				if ( fieldDesc.required && _.isNil( value ) ) {
					error.required = messageRequired( keys, fieldDesc );
				} else if ( !_.isNil( value ) ) {
					_.assign(
						error,
						// Get the validator. Default to unhandled type
						_.get( VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._ ).call( this, keys, fieldDesc, value )
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
					!_.isNil( value ) &&
					_.isArray( fieldDesc.enum )
				) {
					const result = _.some( fieldDesc.enum, enumVal => {
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
			const checkResults = _.chain( this._modelAttributes )
			.mapValues( ( fieldDesc, field ) =>
			this.applyField( entity[field], new PathStack().pushProp( field ), {
				getProps: false,
			} ) )
			.omitBy( _.isEmpty )
			.value() as { [key: string]: CheckTransformer.IErrorObjectFinal };
			if ( !_.isNil( checkResults ) && !_.isEmpty( checkResults ) ) {
				throw new EntityValidationError( checkResults, 'Validation failed' );
			}
			return entity;
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
			_.defaults( options, { getProps: true } );
			if ( !( keys instanceof PathStack ) ) {
				keys = new PathStack( keys );
			}
			
			const val = options.getProps ? _.get( value, keys.segmentsEntity ) : value;
			const fieldDesc = _.get( this.modelAttributes, keys.segmentsValidation );
			// TODO: Add checks for strict models (like if we are using MySQL)
			if ( !_.isObject( fieldDesc ) ) {
				return null;
			}
			
			const error: CheckTransformer.IErrorObject = {};
			
			const stepsArgs = {
				error,
				fieldDesc,
				keys,
				value: val,
			};
			
			_.forEach( CheckTransformer.validationSteps, validationStep =>
				validationStep.call( this, stepsArgs )
			);
			
			if ( !_.isEmpty( error ) ) {
				const finalError = _.defaults( { value } as CheckTransformer.IErrorObjectFinal, error );
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
			fieldDesc: FieldDescriptor;
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
