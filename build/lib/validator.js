(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["core-js/modules/es6.symbol", "core-js/modules/es6.regexp.match"], factory);
  } else if (typeof exports !== "undefined") {
    factory(require("core-js/modules/es6.symbol"), require("core-js/modules/es6.regexp.match"));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.es6, global.es6Regexp);
    global.validator = mod.exports;
  }
})(this, function (_es, _es6Regexp) {
  'use strict';

  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

  var dependencies = require('./dependencies');

  var Diaspora = require('./diaspora');

  var EntityValidationError = Diaspora.components.Errors.EntityValidationError;
  var _ = dependencies._;
  /**
   * @module Validator
   */

  /**
   * Execute the simple tester and return an error component if it returns falsey.
   *
   * @param   {Function} tester - The test function to invoke.
   * @returns {module:Validator~Checker} Function to execute to validate the type.
   */

  var validateWrongType = function validateWrongType(tester) {
    return function (keys, fieldDesc, value) {
      if (!tester(value)) {
        return {
          type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
        };
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


  var validateArrayItems = function validateArrayItems(validator, fieldDesc, keys) {
    return function (propVal, index) {
      if (fieldDesc.hasOwnProperty('of')) {
        var ofArray = _.castArray(fieldDesc.of);

        var subErrors = _(ofArray).map(function (desc, subIndex) {
          return validator.check(propVal, keys.clone().pushValidationProp('of', _.isArray(fieldDesc.of) ? subIndex : undefined).pushEntityProp(index), {
            getProps: false
          });
        });

        if (!_.isArray(fieldDesc.of)) {
          return subErrors.get(0);
        } else if (subErrors.compact().value().length === ofArray.length) {
          return subErrors.toPlainObject().omitBy(_.isNil).value();
        }
      }

      return {};
    };
  };

  var messageRequired = function messageRequired(keys, fieldDesc) {
    return keys.toValidatePath() + " is a required property of " + (fieldDesc.type ? "type \"" + fieldDesc.type + "\"" : "model \"" + fieldDesc.model + "\"");
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


  var VALIDATIONS = {
    TYPE: {
      string: validateWrongType(_.isString),
      integer: validateWrongType(_.isInteger),
      float: validateWrongType(_.isNumber),
      date: validateWrongType(_.isDate),
      boolean: validateWrongType(_.isBoolean),
      object: function object(keys, fieldDesc, value) {
        var _this2 = this;

        if (!_.isObject(value)) {
          return {
            type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
          };
        } else {
          var deepTest = _.isObject(fieldDesc.attributes) ? _(_.assign({}, fieldDesc.attributes, value)).mapValues(function (pv, propName) {
            var propVal = value[propName];
            return _this2.check(propVal, keys.clone().pushValidationProp('attributes').pushProp(propName), {
              getProps: false
            });
          }).omitBy(_.isEmpty).value() : {};

          if (!_.isEmpty(deepTest)) {
            return {
              children: deepTest
            };
          }
        }
      },
      array: function array(keys, fieldDesc, value) {
        if (!_.isArray(value)) {
          return {
            type: keys.toValidatePath() + " expected to be a \"" + fieldDesc.type + "\""
          };
        } else {
          var deepTest = _.isObject(fieldDesc.of) ? _(value).map(validateArrayItems(this, fieldDesc, keys)).omitBy(_.isEmpty).value() : {};

          if (!_.isEmpty(deepTest)) {
            return {
              children: deepTest
            };
          }
        }
      },
      any: function any(keys, fieldDesc, value) {
        if (!_.stubTrue(value)) {
          return {
            type: keys.toValidatePath() + " expected to be assigned with any type"
          };
        }
      },
      _: function _(keys, fieldDesc) {
        return {
          type: keys.toValidatePath() + " requires to be unhandled type \"" + fieldDesc.type + "\""
        };
      }
    }
  }; // Add aliases

  _.assign(VALIDATIONS.TYPE, {
    bool: VALIDATIONS.TYPE.boolean,
    int: VALIDATIONS.TYPE.integer,
    str: VALIDATIONS.TYPE.string,
    text: VALIDATIONS.TYPE.string
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


  var VALIDATION_STEPS = [
  /**
   * Apply the custom `validate` function or function array, if it exists.
   *
   * @function module:Validator~checkCustoms
   * @type {module:Validator~ValidationStep}
   * @param   {module:Validator~ValidationStepsArgs} validationArgs - Validation step argument.
   * @returns {undefined} This function returns nothing.
   */
  function checkCustoms(validationArgs) {
    var _this3 = this;

    var error = validationArgs.error,
        fieldDesc = validationArgs.fieldDesc,
        keys = validationArgs.keys,
        value = validationArgs.value; // It the field has a `validate` property, try to use it

    var validateFcts = _(fieldDesc.validate).castArray().compact();

    validateFcts.forEach(function (validateFct) {
      if (!validateFct.call(_this3, value, fieldDesc)) {
        error.validate = keys.toValidatePath() + " custom validation failed";
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
  function checkTypeRequired(validationArgs) {
    var error = validationArgs.error,
        fieldDesc = validationArgs.fieldDesc,
        keys = validationArgs.keys,
        value = validationArgs.value; // Check the type and the required status

    var typeKeys = _.intersection(_.keys(fieldDesc), ['type', 'model']);

    if (typeKeys.length > 1) {
      error.spec = keys.toValidatePath() + " spec can't have multiple keys from " + typeKeys.join(','); // Apply the `required` modifier
    } else if (true === fieldDesc.required && _.isNil(value)) {
      error.required = messageRequired(keys, fieldDesc);
    } else if (!_.isNil(value)) {
      if (fieldDesc.hasOwnProperty('type')) {
        if (_.isString(fieldDesc.type)) {
          _.assign(error, // Get the validator. Default to unhandled type
          _.get(VALIDATIONS, ['TYPE', fieldDesc.type], VALIDATIONS.TYPE._).call(this, keys, fieldDesc, value));
        } else {
          error.spec = keys.toValidatePath() + " spec \"type\" must be a string";
        }
      } else if (fieldDesc.hasOwnProperty('model')) {
        if (_.isString(fieldDesc.model)) {
          var tester = _.get(VALIDATIONS, ['TYPE', fieldDesc.model], fieldDesc.model._);

          _.assign(error, tester.call(this, keys, fieldDesc, value));
        } else {
          error.spec = keys.toValidatePath() + " spec \"model\" must be a string";
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
  function checkEnum(validationArgs) {
    var error = validationArgs.error,
        fieldDesc = validationArgs.fieldDesc,
        keys = validationArgs.keys,
        value = validationArgs.value; // Check enum values

    if (!_.isNil(value) && !_.isNil(fieldDesc.enum)) {
      var result = _.some(fieldDesc.enum, function (enumVal) {
        if (enumVal instanceof RegExp) {
          return null !== value.match(enumVal);
        } else {
          return value === enumVal;
        }
      });

      if (false === result) {
        error.enum = keys.toValidatePath() + " expected to have one of enumerated values \"" + JSON.stringify(fieldDesc.enum) + "\"";
      }
    }
  }];
  /**
   * Those validation steps are called one after one during the validation of a single field.
   *
   * @const VALIDATION_STEPS
   * @type {module:Validator~ValidationStep[]}
   * @property {module:Validator~checkCustoms}      '0' - Check for `validate` field.
   * @property {module:Validator~checkTypeRequired} '1' - Check for `type` & `required` fields.
   * @property {module:Validator~checkEnum}         '2' - Check for `enum` field.
   */

  var PRIVATE = Symbol('PRIVATE');
  /**
   * The PathStack class allows model validation to follow different paths in model description & entity.
   */

  var PathStack =
  /*#__PURE__*/
  function () {
    /**
     * Constructs a pathstack.
     *
     * @author gerkin
     * @param {string[]} [segmentsEntity=[]]     - Keys to follow in entity.
     * @param {string[]} [segmentsValidation=[]] - Keys to follow in model description.
     */
    function PathStack(segmentsEntity, segmentsValidation) {
      if (segmentsEntity === void 0) {
        segmentsEntity = [];
      }

      if (segmentsValidation === void 0) {
        segmentsValidation = [];
      }

      _.assign(this, {
        segmentsEntity: segmentsEntity,
        segmentsValidation: segmentsValidation
      });
    }
    /**
     * Add a path segment for entity navigation.
     *
     * @param   {...string} prop - Properties to add.
     * @returns {module:Validator~PathStack} Returns `this`.
     */


    var _proto = PathStack.prototype;

    _proto.pushEntityProp = function pushEntityProp() {
      for (var _len = arguments.length, prop = new Array(_len), _key = 0; _key < _len; _key++) {
        prop[_key] = arguments[_key];
      }

      this.segmentsEntity = _(this.segmentsEntity).concat(prop).filter(_.isNil).value();
      return this;
    };
    /**
     * Add a path segment for model description navigation.
     *
     * @param   {...string} prop - Properties to add.
     * @returns {module:Validator~PathStack} Returns `this`.
     */


    _proto.pushValidationProp = function pushValidationProp() {
      for (var _len2 = arguments.length, prop = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        prop[_key2] = arguments[_key2];
      }

      this.segmentsValidation = _(this.segmentsValidation).concat(prop).filter(function (val) {
        return !_.isNil(val);
      }).value();
      return this;
    };
    /**
     * Add a path segment for both entity & model description navigation.
     *
     * @param   {...string} prop - Properties to add.
     * @returns {module:Validator~PathStack} Returns `this`.
     */


    _proto.pushProp = function pushProp() {
      var _pushEntityProp;

      return (_pushEntityProp = this.pushEntityProp.apply(this, arguments)).pushValidationProp.apply(_pushEntityProp, arguments);
    };
    /**
     * Get a string version of entity segments.
     *
     * @returns {string} String representation of path in entity.
     */


    _proto.toValidatePath = function toValidatePath() {
      return this.segmentsEntity.join('.');
    };
    /**
     * Cast this PathStack to its representing arrays.
     *
     * @returns {Array<Array<string>>} Array of paths. The first path represents the entity segments, second represents model description segments.
     */


    _proto.toArray = function toArray() {
      return [this.segmentsEntity.slice(), this.segmentsValidation.slice()];
    };
    /**
     * Duplicate this PathStack, detaching its state from the new.
     *
     * @returns {module:Validator~PathStack} Clone of caller PathStack.
     */


    _proto.clone = function clone() {
      return new (Function.prototype.bind.apply(PathStack, [null].concat(this.toArray())))();
    };

    return PathStack;
  }();
  /**
   * The Validator class is used to check an entity or its fields against a model description.
   */


  var Validator =
  /*#__PURE__*/
  function () {
    /**
     * Construct a Validator configured for the provided model.
     *
     * @param {ModelConfiguration.AttributesDescriptor} modelDesc - Model description to validate.
     */
    function Validator(modelDesc) {
      var _this = {
        modelDesc: modelDesc
      };
      this[PRIVATE] = _this;
    }
    /**
     * Check if the value matches the field description provided, thus verify if it is valid.
     *
     * @author gerkin
     * @param   {Object} entity - Entity to check.
     * @returns {Error[]} Array of errors.
     */


    var _proto2 = Validator.prototype;

    _proto2.validate = function validate(entity) {
      var _this4 = this;

      // Apply method `checkField` on each field described
      var checkResults = _(this[PRIVATE].modelDesc).mapValues(function (fieldDesc, field) {
        return _this4.check(entity[field], new PathStack().pushProp(field), {
          getProps: false
        });
      }).omitBy(_.isEmpty).value();

      if (!_.isNil(checkResults) && !_.isEmpty(checkResults)) {
        throw new EntityValidationError(checkResults, 'Validation failed');
      }
    };
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


    _proto2.check = function check(value, keys, options) {
      var _this5 = this;

      if (options === void 0) {
        options = {};
      }

      _.defaults(options, {
        getProps: true
      });

      if (!(keys instanceof PathStack)) {
        keys = new PathStack(keys);
      }

      var val = options.getProps ? _.get(value, keys.segmentsEntity) : value;

      var fieldDesc = _.get(this[PRIVATE].modelDesc, keys.segmentsValidation);

      if (!_.isObject(fieldDesc)) {
        return;
      }

      _.defaults(fieldDesc, {
        required: false
      });

      var error = {};
      var stepsArgs = {
        error: error,
        fieldDesc: fieldDesc,
        keys: keys,
        value: val
      };

      _.forEach(VALIDATION_STEPS, function (validationStep) {
        return validationStep.call(_this5, stepsArgs);
      });

      if (!_.isEmpty(error)) {
        error.value = value;
        return error;
      } else {
        return null;
      }
    };
    /**
     * Get the model description provided in constructor.
     *
     * @readonly
     * @type {ModelConfiguration.AttributesDescriptor}
     */


    _createClass(Validator, [{
      key: "modelDesc",
      get: function get() {
        return _.cloneDeep(this[PRIVATE].modelDesc);
      }
      /**
       * Get the PathStack constructor.
       *
       * @readonly
       * @type {module:Validator~PathStack}
       */

    }], [{
      key: "PathStack",
      get: function get() {
        return PathStack;
      }
    }]);

    return Validator;
  }();

  module.exports = Validator;
});
//# sourceMappingURL=validator.js.map
