/**
 * This class is the base class for custom Diaspora errors
 *
 * @extends Error
 */
export class ExtendableError extends Error {
	/**
	 * Construct a new extendable error.
	 *
	 * @author gerkin
	 * @param message   - Message of this error.
	 * @param errorArgs - Arguments to transfer to parent Error.
	 */
	constructor(message: string, ...errorArgs: any[]) {
		super(message);
		this.name = this.constructor.name;
		this.message = message;
		if ('function' === typeof Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = new Error(message).stack;
		}
		// restore prototype chain
		const actualProto = new.target.prototype;

		if (Object.setPrototypeOf) {
			Object.setPrototypeOf(this, actualProto);
		} else {
			(this as any).__proto__ = new.target.prototype;
		}
	}
}
