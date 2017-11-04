'use strict';

const dependencies = require( './dependencies' );
const EntityValidationError = require( './errors/entityValidationError' );
const { _ } = dependencies;

/**
 * @module Validator
 */

const VALIDATE_WRONG_TYPE = tester => {
	return ( keys, fieldDesc, value ) => {
		if ( !tester( value )) {
			return {type: `${ keys.toValidatePath() } expected to be a "${ fieldDesc.type }"`};
		}
	};
};
const VALIDATE_ARRAY_ITEMS = ( validator, fieldDesc, keys ) => {
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

const VALIDATIONS = {
	TYPE: {
		string:  VALIDATE_WRONG_TYPE( _.isString ),
		integer: VALIDATE_WRONG_TYPE( _.isInteger ),
		float:   VALIDATE_WRONG_TYPE( _.isNumber ),
		date:    VALIDATE_WRONG_TYPE( _.isDate ),
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
				) ? _( value ).map( VALIDATE_ARRAY_ITEMS( this, fieldDesc, keys ))
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
const VALIDATION_STEPS = [
	function checkCustoms({
		error, fieldDesc, keys, value,
	}) {
		// It the field has a `validate` property, try to use it
		if ( fieldDesc.validate ) {
			if ( !fieldDesc.validate.call( Diaspora, value, fieldDesc )) {
				error.validate = `${ keys.toValidatePath() } custom validation failed`;
			}
		}
	},
	function checkTypeRequired({
		error, fieldDesc, keys, value,
	}) {
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
	function checkEnum({
		error, fieldDesc, keys, value,
	}) {
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
];

const PRIVATE = Symbol( 'PRIVATE' );

/**
 * TODO
 */
class PathStack {
	/**
	 * TODO
	 * 
	 * @author gerkin
	 * @param {string[]} {segmentsEntity = []}     - TODO
	 * @param {string[]} {segmentsValidation = []} - TODO
	 */
	constructor(segmentsEntity = [], segmentsValidation = []) {
		_.assign( this, {
			segmentsEntity,
			segmentsValidation,
		});
	}

	/**
	 * TODO
	 * 
	 * @param   {string} prop - TODO
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushEntityProp( prop ) {
		if ( !_.isNil( prop )) {
			this.segmentsEntity.push( _.toString( prop ));
		}
		return this;
	}

	/**
	 * TODO
	 * 
	 * @param   {string} prop - TODO
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushValidationProp( prop ) {
		if ( !_.isNil( prop )) {
			this.segmentsValidation.push( _.toString( prop ));
		}
		return this;
	}

	/**
	 * TODO
	 * 
	 * @param   {string} prop - TODO
	 * @returns {module:Validator~PathStack} Returns `this`.
	 */
	pushProp( prop ) {
		return this.pushEntityProp( prop ).pushValidationProp( prop );
	}

	/**
	 * TODO
	 * 
	 * @returns {string[][]} TODO
	 */
	toArray() {
		return [
			this.segmentsEntity,
			this.segmentsValidation,
		];
	}

	/**
	 * TODO
	 * 
	 * @returns {string} TODO
	 */
	toValidatePath() {
		return this.segmentsEntity.join( '.' );
	}

	/**
	 * TODO
	 * 
	 * @returns {module:Validator~PathStack} Clone of caller PathStack
	 */
	clone() {
		return new PathStack(this.segmentsEntity.slice(), this.segmentsValidation.slice());
	}
}


/**
 * TODO
 */
class Validator {
	/**
	 * TODO
	 * 
	 * @param {ModelConfiguration.AttributesDescriptor} modelDesc Model description to validate
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
	 * @param   {Any}                                   value     - Value to check.
	 * @param   {String[]}                              keys      - Array of keys from highest ancestor to this property.
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
			value,
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
	 * TODO
	 *
	 * @readonly
	 */
	get modelDesc() {
		return _.cloneDeep( this[PRIVATE].modelDesc );
	}
	
	/**
	 * TODO
	 *
	 * @readonly
	 * @type {module:Validator~PathStack}
	 */
	static get PathStack(){
		return PathStack;
	}
}

module.exports = Validator;
