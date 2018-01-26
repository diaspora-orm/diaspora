'use strict';
/**
 * @module Errors/ExtendableError
 */
/**
 * This class is the base class for custom Diaspora errors
 *
 * @extends Error
 */
class ExtendableError extends Error {
    /**
     * Construct a new extendable error.
     *
     * @author gerkin
     * @param {string} message          - Message of this error.
     * @param {*}      errorArgs        - Arguments to transfer to parent Error.
     */
    constructor(message, ...errorArgs) {
        super(message, ...errorArgs);
        this.name = this.constructor.name;
        this.message = message;
        if ('function' === typeof Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            this.stack = (new Error(message)).stack;
        }
    }
}
module.exports = ExtendableError;
//# sourceMappingURL=extendableError.js.map