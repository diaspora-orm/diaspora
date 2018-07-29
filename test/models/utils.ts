import { Diaspora } from '../../src/diaspora';

import '../utils';
import { Raw, EFieldType } from '../../src/types/modelDescription';

export const createMockModel = ( scope: string, attributesDescription: Raw.IAttributesDescription = {
	foo: {
		type: EFieldType.STRING,
	},
	baz: {
		type: EFieldType.STRING,
	},
} ) => {
	const MODEL_NAME = `${scope}-test`;
	const SOURCE = `inMemory-${scope}-test`;

	const dal = Diaspora.createNamedDataSource( SOURCE, 'inMemory' );
	return {
		dal,
		adapter: dal.adapter,
		model: Diaspora.declareModel( MODEL_NAME, {
			sources: [SOURCE],
			attributes: attributesDescription,
		} ),
		MODEL_NAME,
		SOURCE,
	};
};
