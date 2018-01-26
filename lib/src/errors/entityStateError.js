'use strict';
const ExtendableError = require('./extendableError');
/**
 * @module Errors/EntityStateError
 */
/**
 * This class represents an error related to validation.
 * @extends module:Errors/ExtendableError~ExtendableError
 */
class EntityStateError extends ExtendableError {
    /**
     * Construct a new error related to an invalide state of the entity.
     *
     * @author gerkin
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
    constructor(...errorArgs) {
        super(...errorArgs);
    }
}
module.exports = EntityStateError;
//# sourceMappingURL=entityStateError.js.map