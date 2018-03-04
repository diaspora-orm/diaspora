import { Validator } from '../src/validator';

let validator = new Validator({
	test: {
		type: 'any',
	},
});
validator.validate({ test: 'test' });

validator = new Validator({
	test: {
		type: 'string',
	},
});
validator.validate({ test: 'test' });

validator = new Validator({
	test: {
		type: 'integer',
	},
});
try {
	validator.validate({ test: 'test' });
} catch (e) {
	console.error({ e, name: e.constructor.name });
}

validator = new Validator({
	test: { type: 'array', of: [{ type: 'integer' }, { type: 'date' }] },
});
try {
	validator.validate({ test: [1] });
} catch (e) {
	console.error({ e, name: e.constructor.name });
}
it('Test', () => expect(true).toBeTruthy());
