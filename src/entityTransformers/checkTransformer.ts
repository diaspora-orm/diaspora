import * as _ from 'lodash';

import { EntityTransformer } from './entityTransformer';
import { PathStack } from './pathStack';
import { EntityValidationError } from '../errors/entityValidationError';
import {
	FieldDescriptor,
	IArrayFieldDescriptor,
	IRelationalFieldDescriptor,
	IObjectFieldDescriptor,
	FieldDescriptorTypeChecks,
	EType
} from '../types/modelDescription';
import { IEntityAttributes } from '../types/entity';

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
	fieldDesc: IArrayFieldDescriptor,
	keys: PathStack
) => (
	propVal: any,
	index: number
): IErrorObjectFinal[] | IErrorObjectFinal | null => {
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

const messageRequired = ( keys: PathStack, fieldDesc: FieldDescriptor ) =>
`${keys.toValidatePath()} is a required property of ${
	_.isNil( fieldDesc.type ) || fieldDesc.type === EType.RELATION
	? `model "${( fieldDesc as IRelationalFieldDescriptor ).model}"`
	: `type "${fieldDesc.type}"`
}`;

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

export type TypeChecker = ( value: any ) => boolean;

export interface ITypeErrorObject extends IErrorObject {
	type: string;
}

/**
 * A checker is a function that can return an error component with provided standard args.
 *
 * @callback Checker
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
) => IErrorObjectFinal | undefined;

/**
 * Execute the simple tester and return an error component if it returns falsey.
 *
 * @param   tester - The test function to invoke.
 * @returns Function to execute to validate the type.
 */
const validateWrongType = ( tester: TypeChecker ): CheckFunction => (
	keys: PathStack,
	fieldDesc: FieldDescriptor,
	value: any
): IErrorObjectFinal | undefined => {
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
		[EType.STRING]: validateWrongType( _.isString ),
		/**
		 * Integer type checker
		 *
		 * @author Gerkin
		 */
		[EType.INTEGER]: validateWrongType( _.isInteger ),
		/**
		 * Float type checker. Any numeric other NaN or ±Infinity is accepted
		 *
		 * @author Gerkin
		 */
		[EType.FLOAT]: validateWrongType( _.isNumber ),
		/**
		 * Date type checker
		 *
		 * @author Gerkin
		 */
		[EType.DATETIME]: validateWrongType( _.isDate ),
		/**
		 * Boolean type checker
		 *
		 * @author Gerkin
		 */
		[EType.BOOLEAN]: validateWrongType( _.isBoolean ),
		/**
		 * Object type checker
		 *
		 * @param this      - Current validator to use
		 * @param keys      - PathStack containing keys to access this property
		 * @param fieldDesc - Description of the current field to check
		 * @param value     - Entity attributes to check
		 * @author Gerkin
		 */
		[EType.OBJECT](
			this: CheckTransformer,
			keys: PathStack,
			fieldDesc: IObjectFieldDescriptor,
			value: IEntityAttributes
		): IErrorObjectFinal | undefined {
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
				} )
				.omitBy( _.isEmpty )
				.omitBy( _.isNil )
				.value()
				: {} ) as { [key: string]: IErrorObjectFinal };
				if ( !_.isEmpty( deepTest ) ) {
					return { children: deepTest, value };
				} else {
					return undefined;
				}
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
		[EType.ARRAY](
			this: CheckTransformer,
			keys: PathStack,
			fieldDesc: IArrayFieldDescriptor,
			value: any[]
		): IErrorObjectFinal | undefined {
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
				: [] ) as IErrorObjectFinal[];
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
		[EType.ANY](
			this: CheckTransformer,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): IErrorObjectFinal | undefined {
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
		): IErrorObjectFinal | undefined {
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
 * This object can be passed through each validation steps.
 *
 * @author Gerkin
 */
interface IValidationStepArgs {
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

/**
 * Those validation steps are called one after one during the validation of a single field.
 *
 * @author Gerkin
 */
const VALIDATION_STEPS = [
	/**
	 * Apply the custom `validate` function or function array, if it exists.
	 *
	 * @param   validationArgs - Validation step argument.
	 * @returns This function returns nothing.
	 */
	function checkCustoms(
		this: CheckTransformer,
		validationArgs: IValidationStepArgs
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
		validationArgs: IValidationStepArgs
	) {
		const { error, fieldDesc, keys, value } = validationArgs;
		// Check the type and the required status
		// Apply the `required` modifier
		if ( true === fieldDesc.required && _.isNil( value ) ) {
			error.required = messageRequired( keys, fieldDesc );
		} else if ( !_.isNil( value ) ) {
			_.assign(
				error,
				// Get the validator. Default to unhandled type
				_.get(
					VALIDATIONS,
					// TODO: If relation, check is done another way
					!FieldDescriptorTypeChecks.isRelationalFieldDescriptor( fieldDesc )
					? ['TYPE', fieldDesc.type]
					: [],
					VALIDATIONS.TYPE._
				).call( this, keys, fieldDesc, value )
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
		validationArgs: IValidationStepArgs
	) {
		const { error, keys, value } = validationArgs;
		const fieldDesc = validationArgs.fieldDesc;
		// Check enum values
		if (
			!_.isNil( value ) &&
			!FieldDescriptorTypeChecks.isRelationalFieldDescriptor( fieldDesc ) &&
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
 * The Validator class is used to check an entity or its fields against a model description.
 */
export class CheckTransformer extends EntityTransformer {
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
		.value() as { [key: string]: IErrorObjectFinal };
		if ( !_.isNil( checkResults ) && !_.isEmpty( checkResults ) ) {
			throw new EntityValidationError( checkResults, 'Validation failed' );
		}
		return entity;
	}
	
	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   value                  - Value to check.
	 * @param   keys                   - Pathstack representing path to this validation.
	 * @param   options                - Hash of options.
	 * @param   options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
	 * @returns Hash describing errors.
	 */
	public applyField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): IErrorObjectFinal | null {
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
		
		const error: IErrorObject = {};
		
		const stepsArgs = {
			error,
			fieldDesc,
			keys,
			value: val,
		};
		
		_.forEach( VALIDATION_STEPS, validationStep =>
			validationStep.call( this, stepsArgs )
		);
		
		if ( !_.isEmpty( error ) ) {
			const finalError = _.defaults( { value } as IErrorObjectFinal, error );
			return finalError;
		} else {
			return null;
		}
	}
}
