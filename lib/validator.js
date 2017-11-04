'use strict';

const dependencies = require( './dependencies' );
const EntityValidationError = require( './errors/entityValidationError' );
const { _ } = dependencies;

/**
 * @module Validator
 */

/**
 * Execute the simple tester and return an error component if it returns falsey.
 * 
 * @param   {Function} tester - The test function to invoke.
 * @returns {module:Validator~Checker} Function to execute to validate the type.
 */
const validateWrongType = tester => {
	return ( keys, fieldDesc, value ) => {
		if ( !tester( value )) {
			return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
		}
	};
};

/**
 * Prepare the check of each items in the array.
 * 
 * @param   {module:Validator~Validator} validator - Validator instance that do this call.
 * @param   {Object}                     fieldDesc - Description of the field to check.
 * @param   {module:Validator~PathStack} keys      - Keys so far.
 * @returns {Function} Function to execute to validate array items.
 */
const validateArrayItems = ( validator, fieldDesc, keys ) => {
	return ( propVal, index ) => {
		if ( fieldDesc.hasOwnProperty( 'of' )) {
			const ofArray = _.castArray( fieldDesc.of );
			const subErrors = _( ofArray ).map(( desc, subIndex ) => validator.check(
				propVal,
				keys.clone().pushValidationProp( 'of' ).pushValidationProp( _.isArray( fieldDesc.of ) ? subIndex : undefined ).pushEntityProp( index ),
				{getProps: false}
			));
			if ( !_.isArray( fieldDesc.of )) {
				return subErrors.get( 0 );
			} else if ( subErrors.compact().value().length === ofArray.length ) {
				return subErrors.toPlainObject().omitBy( _.isNil ).value();
			}
		}
		return {};
	};
};

/**
 * A checker is a function that can return an error component with provided standard args.
 * 
 * @callback Checker
 * @param   {module:Validator~PathStack} keys      - Pathstack so far.
 * @param   {Object}                     fieldDesc - Description of the field.
 * @param   {Any}                        value     - Value to check.
 * @returns {Object} Error component.
 */

/**
 * Store for validation functions.
 *
 * @type {object}
 * @property {object<string, module:Validator~Checker>} TYPE - Type checkers.
 * @property {module:Validator~Checker} TYPE.string - String type checker.
 * @property {module:Validator~Checker} TYPE.integer - Integer type checker.
 * @property {module:Validator~Checker} TYPE.float - Float type checker.
 * @property {module:Validator~Checker} TYPE.date - Date type checker.
 * @property {module:Validator~Checker} TYPE.object - Object type checker.
 * @property {module:Validator~Checker} TYPE.array - Array type checker.
 * @property {module:Validator~Checker} TYPE.any - Type checker for type 'any'.
 * @property {module:Validator~Checker} TYPE._ - Default function for unhandled type.
 */
const VALIDATIONS = {
	TYPE: {
		string:  validateWrongType( _.isString ),
		integer: validateWrongType( _.isInteger ),
		float:   validateWrongType( _.isNumber ),
		date:    validateWrongType( _.isDate ),
		object( keys, fieldDesc, value ) {
			if ( !_.isObject( value )) {
				return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
			} else {
				const deepTest = _.isObject(
					fieldDesc.attributes
				) ? _( _.assign({}, fieldDesc.attributes, value )).mapValues(
						( pv, propName ) => {
							const propVal = value[propName];
							return this.check(
								propVal,
								keys.clone().pushValidationProp( 'attributes' ).pushProp( propName ),
								{getProps: false}
							);
						}
					)
						.omitBy( _.isEmpty )
						.value() : {};
				if ( !_.isEmpty( deepTest )) {
					return {children: deepTest};
				}
			}
		},
		array( keys, fieldDesc, value ) {
			if ( !_.isArray( value )) {
				return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
			} else {
				const deepTest = _.isObject(
					fieldDesc.of
				) ? _( value ).map( validateArrayItems( this, fieldDesc, keys ))
						.omitBy( _.isEmpty )
						.value() : {};
				if ( !_.isEmpty( deepTest )) {
					return {children: deepTest};
				}
			}
		},
		any( keys, fieldDesc, value ) {
			if ( !_.stubTrue( value )) {
				return {type: `${ keys.toValidatePath() } expected to be assigned with any type`};
			}
		},
		_( keys, fieldDesc ) {
			return {type: `${ keys.toValidatePath() } requires to be unhandled type "${ fieldDesc.type }"`};
		},
	},
};

/**
 * TODO.
 *
 * @callback ValidationStep
 * @param   {module:Validator~ValidationStepsArgs} validationArgs - TODO.
 * @returns {undefined} This function returns nothing.
 */

/**
 * TODO.
 * 
 * @typedef {object} ValidationStepsArgs
 */


const VALIDATION_STEPS = ([
	/**
	 * TODO.
	 * 
	 * @function module:Validator~checkCustoms
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkCustoms( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// It the field has a `validate` property, try to use it
		if ( fieldDesc.validate ) {
			if ( !fieldDesc.validate.call( this, value, fieldDesc )) {
				error.validate = `${ keys.toValidatePath() } custom validation failed`;
			}
		}
	},
	/**
	 * TODO.
	 * 
	 * @function module:Validator~checkTypeRequired
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkTypeRequired( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// Check the type and the required status
		if ( !_.isNil( fieldDesc.type ) && !_.isNil( fieldDesc.model )) {
			error.spec =  `${ keys.toValidatePath() } spec can't have both a type and a model`;
			// Apply the `required` modifier
		} else if ( true === fieldDesc.required && _.isNil( value )) {
			error.required = `${ keys.toValidatePath() } is a required property of type "${ fieldDesc.type }"`;
		} else if ( !_.isNil( value )) {
			if ( _.isString( fieldDesc.type )) {
				const tester = _.get( VALIDATIONS, [ 'TYPE', fieldDesc.type ], fieldDesc.type._ );
				_.assign( error, tester.call( this, keys, fieldDesc, value ));
			} else {
				error.spec =  `${ keys.toValidatePath() } spec "type" must be a string`;
			}
		}
	},
	/**
	 * TODO.
	 * 
	 * @function module:Validator~checkEnum
	 * @type {module:Validator~ValidationStep}
	 * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
	 * @returns {undefined} This function returns nothing.
	 */
	function checkEnum( validationArgs ) {
		const {
			error, fieldDesc, keys, value,
		} = validationArgs;
		// Check enum values
		if ( !_.isNil( value ) && !_.isNil( fieldDesc.enum )) {
			const result = _.some( fieldDesc.enum, enumVal => {
				if ( enumVal instanceof RegExp ) {
					return null !== value.match( enumVal );
				} else {
					return value === enumVal;
				}
			});
			if ( false === result ) {
				error.enum = `${ keys.toValidatePath() } expected to have one of enumerated values "${ JSON.stringify( fieldDesc.enum ) }"`;
			}
		}
	},
]);
/**
 * TODO.
 * 
 * @const VALIDATION_STEPS
 * @type {module:Validator~ValidationStep[]}
 * @property {module:Validator~checkCustoms}      '0' - TODO.
 * @property {module:Validator~checkTypeRequired} '1' - TODO.
 * @property {module:Validator~checkEnum}         '2' - TODO.
 */

const PRIVATE = Symbol( 'PRIVATE' );

/**
 * TODO.
 */
class PathStack {
	/**
	 * TODO.
	 * 
	 * @author gerkin
	 * @param {string[]} [segmentsEntity=[]]     - TODO.
	 * @param {string[]} [segmentsValidation=[]] - TODO.
	 */
	constructor( segmentsEntity = [], segmentsValidation = []) {
		_.assign( this, {
			segmentsEntity,
			segmentsValidation,
		});
	}

	/**
	 * TODO.
	 * 
	 * @param   {string} prop - TODO.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushEntityProp( prop ) {
		if ( !_.isNil( prop )) {
			this.segmentsEntity.push( _.toString( prop ));
		}
		return this;
	}

	/**
	 * TODO.
	 * 
	 * @param   {string} prop - TODO.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushValidationProp( prop ) {
		if ( !_.isNil( prop )) {
			this.segmentsValidation.push( _.toString( prop ));
		}
		return this;
	}

	/**
	 * TODO.
	 * 
	 * @param   {string} prop - TODO.
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushProp( prop ) {
		return this.pushEntityProp( prop ).pushValidationProp( prop );
	}

	/**
	 * TODO.
	 * 
	 * @returns {Array<Array<string>>} TODO.
	 */
	toArray() {
		return [
			this.segmentsEntity,
			this.segmentsValidation,
		];
	}

	/**
	 * TODO.
	 * 
	 * @returns {module:Validator~PathStack} Clone of caller PathStack.
	 */
	clone() {
		return new PathStack( this.segmentsEntity.slice(), this.segmentsValidation.slice());
	}
}


/**
 * TODO.
 */
class Validator {
	/**
	 * TODO.
	 * 
	 * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
	 */
	constructor( modelDesc ) {
		const _this = {modelDesc};
		this[PRIVATE] = _this;
	}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Object}                               entity    - Entity to check.
	 * @returns {Error[]} Array of errors.
	 */
	validate( entity ) {
		// Apply method `checkField` on each field described 
		const checkResults = _( this[PRIVATE].modelDesc )
			.mapValues(( fieldDesc, field ) => this.check( entity[field], new PathStack().pushProp( field ), {getProps: false}))
			.omitBy( _.isEmpty )
			.value();
		if ( !_.isNil( checkResults ) && !_.isEmpty( checkResults )) {
			throw new EntityValidationError( checkResults, 'Validation failed' );
		}
	}

	/**
	 * Check if the value matches the field description provided, thus verify if it is valid.
	 *
	 * @author gerkin
	 * @param   {Any}                        value                  - Value to check.
	 * @param   {module:Validator~PathStack} keys                   - TODO.
	 * @param   {Object}                     options                - TODO.
	 * @param   {boolean}                     options.getProps=false - TODO.
	 * @returns {Object} Hash describing errors.
	 */
	check( value, keys, options = {}) {
		_.defaults( options, {
			getProps: true,
		});
		if ( !( keys instanceof PathStack )) {
			keys = new PathStack( keys );
		}

		const val = options.getProps ? _.get( value, keys.segmentsEntity ) : value;
		const fieldDesc = _.get( this[PRIVATE].modelDesc, keys.segmentsValidation );

		if ( !_.isObject( fieldDesc )) {
			return;
		}
		_.defaults( fieldDesc, {
			required: false,
		});

		const error = {};

		const stepsArgs = {
			error,
			fieldDesc,
			keys,
			value: val,
		};

		_.forEach( VALIDATION_STEPS, validationStep => validationStep.call( this, stepsArgs ));

		if ( !_.isEmpty( error )) {
			error.value = value;
			return error;
		} else {
			return null;
		}
	}

	/**
	 * TODO.
	 *
	 * @readonly
	 * @type {ModelConfiguration.AttributesDescriptor}
	 */
	get modelDesc() {
		return _.cloneDeep( this[PRIVATE].modelDesc );
	}

	/**
	 * TODO.
	 *
	 * @readonly
	 * @type {module:Validator~PathStack}
	 */
	static get PathStack() {
		return PathStack;
	}
}

module.exports = Validator;
