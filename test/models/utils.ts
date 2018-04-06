import { Diaspora } from '../../src/diaspora';

import '../utils';

export const createMockModel = ( scope: string ) => {
	const MODEL_NAME = `${scope}-test`;
	const SOURCE = `inMemory-${scope}-test`;
	return {
		adapter: Diaspora.createNamedDataSource( SOURCE, 'inMemory' ),
		model: Diaspora.declareModel( MODEL_NAME, {
			sources: [SOURCE],
			attributes: {
				foo: {
					type: 'string',
				},
				baz: {
					type: 'string',
				},
			},
		} ),
		MODEL_NAME,
		SOURCE,
	};
};
