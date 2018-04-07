import Diaspora from '../../src/diaspora';

import '../utils';

export const createMockModel = ( scope: string ) => {
	const MODEL_NAME = `${scope}-test`;
	const SOURCE = `inMemory-${scope}-test`;

	const dal = Diaspora.createNamedDataSource( SOURCE, 'inMemory' );
	return {
		dal,
		adapter: dal.adapter,
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
