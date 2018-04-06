import { ExtendableError } from '../src/errors/extendableError';

describe( 'Test errors', () => {
	it( 'Extendable error', () => {
		class SubError extends ExtendableError {}
		const subError = new SubError();

		expect( subError ).toBeInstanceOf( ExtendableError );
		expect( subError ).toBeInstanceOf( Error );
	} );
} );
