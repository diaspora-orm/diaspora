import * as _ from 'lodash';

import { IRawEntityAttributes } from './entities/entityFactory';
import { EntityValidationError } from './errors';
import { ArrayFieldDescriptor, RelationalFieldDescriptor, FieldDescriptor, FieldDescriptorTypeChecks, ObjectFieldDescriptor } from './types/modelDescription';
import { getDefaultFunction } from './staticStores';

/**
 * Prepare the check of each items in the array.
 *
 * @param   validator - Validator instance that do this call.
 * @param   fieldDesc - Description of the field to check.
 * @param   keys      - Keys so far.
 * @returns Function to execute to validate array items.
 */
const validateArrayItems = (
	validator: Validator,
	fieldDesc: ArrayFieldDescriptor,
	keys: PathStack
) => {
	return (
		propVal: any,
		index: number
	): ErrorObjectFinal[] | ErrorObjectFinal | null => {
		if ( fieldDesc.hasOwnProperty( 'of' ) ) {
			const ofArray = _.castArray( fieldDesc.of );
			const subErrors = _.chain( ofArray ).map( ( desc, subIndex ) =>
				validator.validateField(
					propVal,
					keys
						.clone()
						.pushValidationProp( 'of', ( _.isArray( fieldDesc.of )
							? String( subIndex )
							: undefined ) as string )
						.pushEntityProp( String( index ) ),
					{ getProps: false }
				)
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
};

const messageRequired = ( keys: PathStack, fieldDesc: FieldDescriptor ) => {
	return `${keys.toValidatePath()} is a required property of ${
		fieldDesc.type === 'Relation'
			? `model "${( fieldDesc as RelationalFieldDescriptor ).model}"`
			: `type "${fieldDesc.type}"`
	}`;
};

export interface ErrorObject {
	validate?: string;
	type?: string;
	spec?: string;
	required?: string;
	enum?: string;
	children?: ErrorObjectFinal[] | { [key: string]: ErrorObjectFinal };
}

export interface ErrorObjectFinal extends ErrorObject {
	value: any;
}

export type TypeChecker = ( value: any ) => boolean;

export interface TypeErrorObject extends ErrorObject {
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
	this: Validator,
	keys: PathStack,
	fieldDesc: FieldDescriptor,
	value: any
) => ErrorObjectFinal | undefined;

/**
 * Execute the simple tester and return an error component if it returns falsey.
 *
 * @param   tester - The test function to invoke.
 * @returns Function to execute to validate the type.
 */
const validateWrongType = ( tester: TypeChecker ): CheckFunction => {
	return (
		keys: PathStack,
		fieldDesc: FieldDescriptor,
		value: any
	): ErrorObjectFinal | undefined => {
		if ( !tester( value ) ) {
			return {
				type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
				value,
			};
		}
		return undefined;
	};
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
		string: validateWrongType( _.isString ),
		/**
		 * Integer type checker
		 *
		 * @author Gerkin
		 */
		integer: validateWrongType( _.isInteger ),
		/**
		 * Float type checker. Any numeric other NaN or ±Infinity is accepted
		 *
		 * @author Gerkin
		 */
		float: validateWrongType( _.isNumber ),
		/**
		 * Date type checker
		 *
		 * @author Gerkin
		 */
		date: validateWrongType( _.isDate ),
		/**
		 * Boolean type checker
		 *
		 * @author Gerkin
		 */
		boolean: validateWrongType( _.isBoolean ),
		/**
		 * Object type checker
		 *
		 * @param this      - Current validator to use
		 * @param keys      - PathStack containing keys to access this property
		 * @param fieldDesc - Description of the current field to check
		 * @param value     - Entity attributes to check
		 * @author Gerkin
		 */
		object(
			this: Validator,
			keys: PathStack,
			fieldDesc: ObjectFieldDescriptor,
			value: IRawEntityAttributes
		): ErrorObjectFinal | undefined {
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
								return this.validateField(
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
					: {} ) as { [key: string]: ErrorObjectFinal };
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
		array(
			this: Validator,
			keys: PathStack,
			fieldDesc: ArrayFieldDescriptor,
			value: any[]
		): ErrorObjectFinal | undefined {
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
					: [] ) as ErrorObjectFinal[];
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
		any(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): ErrorObjectFinal | undefined {
			return _.isNil( value )
				? {
						type: `${keys.toValidatePath()} expected to be assigned with any type`,
						value,
				  }
				: undefined;
		},
		_(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): ErrorObjectFinal | undefined {
			return {
				type: `${keys.toValidatePath()} requires to be unhandled type "${
					fieldDesc.type
				}"`,
				value,
			};
		},
	},
};
// Add aliases
_.assign( VALIDATIONS.TYPE, {
	bool: VALIDATIONS.TYPE.boolean,
	int: VALIDATIONS.TYPE.integer,
	str: VALIDATIONS.TYPE.string,
	text: VALIDATIONS.TYPE.string,
} );

/**
 * This object can be passed through each validation steps.
 *
 * @author Gerkin
 */
interface ValidationStepArgs {
	/**
	 * Error object to extend.
	 *
	 * @author Gerkin
	 */
	error: ErrorObject;
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
	function checkCustoms( this: Validator, validationArgs: ValidationStepArgs ) {
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
		this: Validator,
		validationArgs: ValidationStepArgs
	) {
		const { error, fieldDesc, keys, value } = validationArgs;
		// Check the type and the required status
		const typeKeys = _.intersection( _.keys( fieldDesc ), ['type', 'model'] );
		if ( typeKeys.length > 1 ) {
			error.spec = `${keys.toValidatePath()} spec can't have multiple keys from ${typeKeys.join(
				','
			)}`;
			// Apply the `required` modifier
		} else if ( true === fieldDesc.required && _.isNil( value ) ) {
			error.required = messageRequired( keys, fieldDesc );
		} else if ( !_.isNil( value ) ) {
			if ( fieldDesc.hasOwnProperty( 'type' ) && fieldDesc.type !== 'Relation' ) {
				if ( _.isString( fieldDesc.type ) ) {
					_.assign(
						error,
						// Get the validator. Default to unhandled type
						_.get( VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._ ).call(
							this,
							keys,
							fieldDesc,
							value
						)
					);
				} else {
					error.spec = `${keys.toValidatePath()} spec "type" must be a string`;
				}
			} else if ( fieldDesc.hasOwnProperty( 'model' ) ) {
				if ( _.isString( ( fieldDesc as any ).model ) ) {
					// TODO Wrong so far: fallback to another type of check.
					const tester = _.get(
						VALIDATIONS,
						['TYPE', ( fieldDesc as any ).model],
						VALIDATIONS.TYPE._
					);
					_.assign( error, tester.call( this, keys, fieldDesc, value ) );
				} else {
					error.spec = `${keys.toValidatePath()} spec "model" must be a string`;
				}
			}
		}
	},

	/**
	 * Verify if the value correspond to a value in the `enum` property.
	 *
	 * @param   validationArgs - Validation step argument.
	 * @returns This function returns nothing.
	 */
	function checkEnum( this: Validator, validationArgs: ValidationStepArgs ) {
		const { error, keys, value } = validationArgs;
		const fieldDesc = validationArgs.fieldDesc;
		// Check enum values
		if (
			!_.isNil( value ) &&
			FieldDescriptorTypeChecks.isEnumFieldDescriptor( fieldDesc )
		) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( enumVal instanceof RegExp ) {
					return null !== value.match( enumVal );
				} else {
					return value === enumVal;
				}
			} );
			if ( false === result ) {
				error.enum = `${keys.toValidatePath()} expected to have one of enumerated values "${JSON.stringify(
					fieldDesc.enum
				)}"`;
			}
		}
	},
];

/**
 * The PathStack class allows model validation to follow different paths in model description & entity.
 */
export class PathStack {
	/**
	 * Constructs a pathstack.
	 *
	 * @author gerkin
	 */
	public constructor(
		public segmentsEntity: string[] = [],
		public segmentsValidation: string[] = []
	) {}

	/**
	 * Add a path segment for entity navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushEntityProp( ...prop: string[] ): this {
		this.segmentsEntity = _.chain( this.segmentsEntity )
			.concat( _.flattenDeep( prop ) )
			.reject( _.isNil )
			.value();
		return this;
	}

	/**
	 * Add a path segment for model description navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushValidationProp( ...prop: string[] ): this {
		this.segmentsValidation = _.chain( this.segmentsValidation )
			.concat( prop )
			.reject( _.isNil )
			.value();
		return this;
	}

	/**
	 * Add a path segment for both entity & model description navigation.
	 *
	 * @param   prop - Properties to add.
	 * @returns Returns `this`.
	 */
	public pushProp( ...prop: string[] ): this {
		return this.pushEntityProp( ...prop ).pushValidationProp( ...prop );
	}

	/**
	 * Get a string version of entity segments.
	 *
	 * @returns String representation of path in entity.
	 */
	public toValidatePath(): string {
		return this.segmentsEntity.join( '.' );
	}

	/**
	 * Cast this PathStack to its representing arrays.
	 */
	public toArray(): string[][] {
		return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
	}

	/**
	 * Duplicate this PathStack, detaching its state from the new.
	 *
	 * @returns Clone of caller PathStack.
	 */
	public clone(): PathStack {
		return new PathStack( ...this.toArray() );
	}
}

/**
 * The Validator class is used to check an entity or its fields against a model description.
 */
export class Validator {
	/**
	 * Construct a Validator configured for the provided model.
	 *
	 * @param modelAttributes - Model description to validate.
	 */
	public constructor(
		private readonly _modelAttributes: { [key: string]: FieldDescriptor }
	) {}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 */
	public validate( entity: IRawEntityAttributes ) {
		// Apply method `checkField` on each field described
		const checkResults = _.chain( this._modelAttributes )
			.mapValues( ( fieldDesc, field ) =>
				this.validateField( entity[field], new PathStack().pushProp( field ), {
					getProps: false,
				} )
			)
			.omitBy( _.isEmpty )
			.value() as { [key: string]: ErrorObjectFinal };
		if ( !_.isNil( checkResults ) && !_.isEmpty( checkResults ) ) {
			throw new EntityValidationError( checkResults, 'Validation failed' );
		}
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
	public validateField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): ErrorObjectFinal | null {
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

		const error: ErrorObject = {};

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
			const finalError = _.defaults( { value } as ErrorObjectFinal, error );
			return finalError;
		} else {
			return null;
		}
	}

	/**
	 * Set default values if required.
	 *
	 * @author gerkin
	 * @param   entity    - Entity to set defaults in.
	 * @param   modelDesc - Model description.
	 * @returns  Entity merged with default values.
	 */
	public default( entity: IRawEntityAttributes ) {
		// Apply method `defaultField` on each field described
		return _.defaults(
			entity,
			_.chain( this._modelAttributes )
				.mapValues( ( fieldDesc, field ) =>
					this.defaultField( entity, new PathStack().pushProp( field ), {
						getProps: true,
					} )
				)
				.omitBy( _.isUndefined )
				.value()
		);
	}

	/**
	 * Set the default on a single field according to its description.
	 *
	 * @author gerkin
	 * @param   value     - Value to default.
	 * @param   fieldDesc - Description of the field to default.
	 * @returns Defaulted value.
	 */
	public defaultField(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): any {
		_.defaults( options, { getProps: true } );
		if ( !( keys instanceof PathStack ) ) {
			keys = new PathStack( keys );
		}

		const val = options.getProps ? _.get( value, keys.segmentsEntity ) : value;
		const fieldDesc = _.get(
			this.modelAttributes,
			keys.segmentsValidation
		) as FieldDescriptor;

		// Return the `default` if value is undefined
		const valOrBaseDefault =
			val ||
			( _.isFunction( fieldDesc.default )
				? getDefaultFunction( fieldDesc.default )()
				: fieldDesc.default );

		// Recurse if we are defaulting an object
		if (
			FieldDescriptorTypeChecks.isObjectFieldDescriptor( fieldDesc ) &&
			_.keys( fieldDesc.attributes ).length > 0 &&
			!_.isNil( valOrBaseDefault )
		) {
			return _.merge(
				valOrBaseDefault,
				_.chain( fieldDesc.attributes )
					.mapValues( ( fieldDesc, key ) => {
						const defaulted = this.defaultField(
							value,
							( keys as PathStack ).clone().pushProp( key )
						);
						return _.omitBy( defaulted, _.isNil );
					} )
					.omitBy( _.isUndefined )
					.value()
			);
		} else {
			return valOrBaseDefault;
		}
	}

	/**
	 * Get the model description provided in constructor.
	 */
	public get modelAttributes(): object {
		return _.cloneDeep( this._modelAttributes );
	}

	/**
	 * Get the PathStack constructor.
	 */
	public static get PathStack() {
		return PathStack;
	}
}
