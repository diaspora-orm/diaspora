import { _ } from './dependencies';

import { FieldDescriptor } from './model';
import { Entity, EntityObject } from './entityFactory';
import { EntityValidationError } from './errors';

/**
 * Prepare the check of each items in the array.
 *
 * @param   {module:Validator~Validator} validator - Validator instance that do this call.
 * @param   {Object}                     fieldDesc - Description of the field to check.
 * @param   {module:Validator~PathStack} keys      - Keys so far.
 * @returns {Function} Function to execute to validate array items.
 */
const validateArrayItems = (
	validator: Validator,
	fieldDesc: FieldDescriptor,
	keys: PathStack
) => {
	return (propVal: any, index: number) => {
		if (fieldDesc.hasOwnProperty('of')) {
			const ofArray = _.castArray(fieldDesc.of);
			const subErrors = _(ofArray).map((desc, subIndex) =>
				validator.check(
					propVal,
					keys
						.clone()
						.pushValidationProp('of', (_.isArray(fieldDesc.of)
							? String(subIndex)
							: undefined) as string)
						.pushEntityProp(String(index)),
					{ getProps: false }
				)
			);
			if (!_.isArray(fieldDesc.of)) {
				return subErrors.get(0);
			} else if (subErrors.compact().value().length === ofArray.length) {
				return subErrors
					.toPlainObject()
					.omitBy(_.isNil)
					.value();
			}
		}
		return {};
	};
};

const messageRequired = (keys: PathStack, fieldDesc: FieldDescriptor) => {
	return `${keys.toValidatePath()} is a required property of ${
		fieldDesc.type ? `type "${fieldDesc.type}"` : `model "${fieldDesc.model}"`
	}`;
};

export interface ErrorObject {
	validate?: string;
	type?: string;
	spec?: string;
	required?: string;
	enum?: string;
	//	children?:
}

export interface ErrorObjectFinal extends ErrorObject {
	value: any;
}

export type TypeChecker = (value: any) => boolean;

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
) => ErrorObject | undefined;

/**
 * Execute the simple tester and return an error component if it returns falsey.
 *
 * @param   tester - The test function to invoke.
 * @returns Function to execute to validate the type.
 */
const validateWrongType = (tester: TypeChecker): CheckFunction => {
	return (
		keys: PathStack,
		fieldDesc: FieldDescriptor,
		value: any
	): ErrorObject | undefined => {
		if (!tester(value)) {
			return {
				type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
			};
		}
		return undefined;
	};
};

/**
 * Store for validation functions.
 *
 * @property TYPE - Type checkers.
 * @property TYPE.string - String type checker.
 * @property TYPE.integer - Integer type checker.
 * @property TYPE.float - Float type checker.
 * @property TYPE.date - Date type checker.
 * @property TYPE.object - Object type checker.
 * @property TYPE.array - Array type checker.
 * @property TYPE.any - Type checker for type 'any'.
 * @property TYPE._ - Default function for unhandled type.
 */
const VALIDATIONS = {
	TYPE: {
		string: validateWrongType(_.isString),
		integer: validateWrongType(_.isInteger),
		float: validateWrongType(_.isNumber),
		date: validateWrongType(_.isDate),
		boolean: validateWrongType(_.isBoolean),
		object(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): ErrorObject | undefined {
			if (!_.isObject(value)) {
				return {
					type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
				};
			} else {
				const deepTest = _.isObject(fieldDesc.attributes)
					? _(_.assign({}, fieldDesc.attributes, value))
							.mapValues((pv, propName) => {
								const propVal = value[propName];
								return this.check(
									propVal,
									keys
										.clone()
										.pushValidationProp('attributes')
										.pushProp(propName),
									{ getProps: false }
								);
							})
							.omitBy(_.isEmpty)
							.value()
					: {};
				if (!_.isEmpty(deepTest)) {
					return { children: deepTest };
				} else {
					return undefined;
				}
			}
		},
		array(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): ErrorObject | undefined {
			if (!_.isArray(value)) {
				return {
					type: `${keys.toValidatePath()} expected to be a "${fieldDesc.type}"`,
				};
			} else {
				const deepTest = _.isObject(fieldDesc.of)
					? _(value)
							.map(validateArrayItems(this, fieldDesc, keys))
							.omitBy(_.isEmpty)
							.value()
					: {};
				if (!_.isEmpty(deepTest)) {
					return { children: deepTest };
				} else {
					return undefined;
				}
			}
		},
		any(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor,
			value: any
		): ErrorObject | undefined {
			return {
				type: `${keys.toValidatePath()} expected to be assigned with any type`,
			};
		},
		_(
			this: Validator,
			keys: PathStack,
			fieldDesc: FieldDescriptor
		): ErrorObject | undefined {
			return {
				type: `${keys.toValidatePath()} requires to be unhandled type "${
					fieldDesc.type
				}"`,
			};
		},
	},
};
// Add aliases
_.assign(VALIDATIONS.TYPE, {
	bool: VALIDATIONS.TYPE.boolean,
	int: VALIDATIONS.TYPE.integer,
	str: VALIDATIONS.TYPE.string,
	text: VALIDATIONS.TYPE.string,
});

/**
 * Standard function that can be used to add steps to the validation process..
 *
 * @callback ValidationStep
 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Object of arguments.
 * @returns {undefined} This function returns nothing.
 */

/**
 * This object can be passed through each validation steps.
 *
 * @typedef  {Object} ValidationStepsArgs
 * @property {Object}                     error     - Error object to extend.
 * @property {Object}                     fieldDesc - Description of the field.
 * @property {module:Validator~PathStack} keys      - Pathstack representing keys so far.
 * @property {*}                          value     - Value to check.
 */
interface ValidationStepArgs {
	error: ErrorObject;
	fieldDesc: FieldDescriptor;
	keys: PathStack;
	value: any;
}

const VALIDATION_STEPS = [
	/**
	 * Apply the custom `validate` function or function array, if it exists.
	 *
	 * @function module:Validator~checkCustoms
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkCustoms(this: Validator, validationArgs: ValidationStepArgs) {
		const { error, fieldDesc, keys, value } = validationArgs;
		// It the field has a `validate` property, try to use it
		const validateFcts = _(fieldDesc.validate as Function[])
			.castArray()
			.compact();
		validateFcts.forEach(validateFct => {
			if (!validateFct.call(this, value, fieldDesc)) {
				error.validate = `${keys.toValidatePath()} custom validation failed`;
			}
		});
	},

	/**
	 * Check if the type & the existence matches the `type` & `required` specifications.
	 *
	 * @function module:Validator~checkTypeRequired
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkTypeRequired(
		this: Validator,
		validationArgs: ValidationStepArgs
	) {
		const { error, fieldDesc, keys, value } = validationArgs;
		// Check the type and the required status
		const typeKeys = _.intersection(_.keys(fieldDesc), ['type', 'model']);
		if (typeKeys.length > 1) {
			error.spec = `${keys.toValidatePath()} spec can't have multiple keys from ${typeKeys.join(
				','
			)}`;
			// Apply the `required` modifier
		} else if (true === fieldDesc.required && _.isNil(value)) {
			error.required = messageRequired(keys, fieldDesc);
		} else if (!_.isNil(value)) {
			if (fieldDesc.hasOwnProperty('type')) {
				if (_.isString(fieldDesc.type)) {
					_.assign(
						error,
						// Get the validator. Default to unhandled type
						_.get(VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._).call(
							this,
							keys,
							fieldDesc,
							value
						)
					);
				} else {
					error.spec = `${keys.toValidatePath()} spec "type" must be a string`;
				}
			} else if (fieldDesc.hasOwnProperty('model')) {
				if (_.isString(fieldDesc.model)) {
					// TODO Wrong so far: fallback to another type of check.
					const tester = _.get(
						VALIDATIONS,
						['TYPE', fieldDesc.model],
						VALIDATIONS.TYPE._
					);
					_.assign(error, tester.call(this, keys, fieldDesc, value));
				} else {
					error.spec = `${keys.toValidatePath()} spec "model" must be a string`;
				}
			}
		}
	},

	/**
	 * Verify if the value correspond to a value in the `enum` property.
	 *
	 * @function module:Validator~checkEnum
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkEnum(this: Validator, validationArgs: ValidationStepArgs) {
		const { error, fieldDesc, keys, value } = validationArgs;
		// Check enum values
		if (!_.isNil(value) && !_.isNil(fieldDesc.enum)) {
			const result = _.some(fieldDesc.enum, enumVal => {
				if (enumVal instanceof RegExp) {
					return null !== value.match(enumVal);
				} else {
					return value === enumVal;
				}
			});
			if (false === result) {
				error.enum = `${keys.toValidatePath()} expected to have one of enumerated values "${JSON.stringify(
					fieldDesc.enum
				)}"`;
			}
		}
	},
];
/**
 * Those validation steps are called one after one during the validation of a single field.
 *
 * @const VALIDATION_STEPS
 * @type {module:Validator~ValidationStep[]}
 * @property {module:Validator~checkCustoms}      '0' - Check for `validate` field.
 * @property {module:Validator~checkTypeRequired} '1' - Check for `type` & `required` fields.
 * @property {module:Validator~checkEnum}         '2' - Check for `enum` field.
 */

/**
 * The PathStack class allows model validation to follow different paths in model description & entity.
 */
export class PathStack {
	/**
	 * Constructs a pathstack.
	 *
	 * @author gerkin
	 */
	constructor(
		public segmentsEntity: string[] = [],
		public segmentsValidation: string[] = []
	) {}

	/**
	 * Add a path segment for entity navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushEntityProp(...prop: string[]): this {
		this.segmentsEntity = _(this.segmentsEntity)
			.concat(prop)
			.filter(_.isNil)
			.value();
		return this;
	}

	/**
	 * Add a path segment for model description navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushValidationProp(...prop: string[]): this {
		this.segmentsValidation = _(this.segmentsValidation)
			.concat(prop)
			.filter(val => !_.isNil(val))
			.value();
		return this;
	}

	/**
	 * Add a path segment for both entity & model description navigation.
	 *
	 * @param   {...string} prop - Properties to add.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushProp(...prop: string[]): this {
		return this.pushEntityProp(...prop).pushValidationProp(...prop);
	}

	/**
	 * Get a string version of entity segments.
	 *
	 * @returns {string} String representation of path in entity.
	 */
	toValidatePath(): string {
		return this.segmentsEntity.join('.');
	}

	/**
	 * Cast this PathStack to its representing arrays.
	 */
	toArray(): string[][] {
		return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
	}

	/**
	 * Duplicate this PathStack, detaching its state from the new.
	 *
	 * @returns {module:Validator~PathStack} Clone of caller PathStack.
	 */
	clone(): PathStack {
		return new PathStack(...this.toArray());
	}
}

/**
 * The Validator class is used to check an entity or its fields against a model description.
 */
export class Validator {
	/**
	 * Construct a Validator configured for the provided model.
	 *
	 * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
	 */
	constructor(private _modelDesc: object) {}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 */
	validate(entity: EntityObject) {
		// Apply method `checkField` on each field described
		const checkResults = _(this._modelDesc)
			.mapValues((fieldDesc, field) =>
				this.check(entity[field], new PathStack().pushProp(field), {
					getProps: false,
				})
			)
			.omitBy(_.isEmpty)
			.value();
		if (!_.isNil(checkResults) && !_.isEmpty(checkResults)) {
			throw new EntityValidationError(checkResults, 'Validation failed');
		}
	}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Any}                        value                  - Value to check.
	 * @param   {module:Validator~PathStack} keys                   - Pathstack representing path to this validation.
	 * @param   {Object}                     [options=(})]          - Hash of options.
	 * @param   {boolean}                    options.getProps=false - If `false`, it will use the value directly. If `true`, will try to get the property from value, as if it was an entity.
	 * @returns {Object} Hash describing errors.
	 */
	check(
		value: any,
		keys: PathStack | string[],
		options: { getProps: boolean } = { getProps: false }
	): ErrorObjectFinal | null {
		_.defaults(options, { getProps: true });
		if (!(keys instanceof PathStack)) {
			keys = new PathStack(keys);
		}

		const val = options.getProps ? _.get(value, keys.segmentsEntity) : value;
		const fieldDesc = _.get(this.modelDesc, keys.segmentsValidation);
		// TODO: Add checks for strict models (like if we are using MySQL)
		if (!_.isObject(fieldDesc)) {
			return null;
		}
		_.defaults(fieldDesc, { required: false });

		const error: ErrorObject = {};

		const stepsArgs = {
			error,
			fieldDesc,
			keys,
			value: val,
		};

		_.forEach(VALIDATION_STEPS, validationStep =>
			validationStep.call(this, stepsArgs)
		);

		if (!_.isEmpty(error)) {
			const finalError = _.defaults({ value } as ErrorObjectFinal, error);
			return finalError;
		} else {
			return null;
		}
	}

	/**
	 * Get the model description provided in constructor.
	 */
	get modelDesc(): object {
		return _.cloneDeep(this._modelDesc);
	}

	/**
	 * Get the PathStack constructor.
	 */
	static get PathStack() {
		return PathStack;
	}
}
