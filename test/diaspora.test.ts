import _ from 'lodash';

import { importTest, getStyle } from './utils';
import { Diaspora } from '../src/diaspora';

expect(
	Diaspora.default(
		{
			aze: 123,
		},
		{
			foo: {
				type: 'text',
				default: 'bar',
			},
		}
	)
).toEqual({
	aze: 123,
	foo: 'bar',
});
/* const now = _.now();
expect( Diaspora.default({
	aze: 123,
}, {
	foo: {
		type:    'datetime',
		default: () => now,
	},
})).toEqual({
	aze: 123,
	foo: now,
});
expect( Diaspora.default({
	aze: 'baz',
}, {
	aze: {
		type:    'text',
		default: 'bar',
	},
})).toEqual({
	aze: 'baz',
});
expect( Diaspora.default({
	aze: 'baz',
}, {
	aze: {
		type:    'datetime',
		default: () => 'bar',
	},
})).toEqual({
	aze: 'baz',
}); */

//importTest( getStyle( 'category', 'Adapters' ), `${ __dirname  }/adapters/index.js` );
//importTest( getStyle( 'category', 'Models' ), `${ __dirname  }/models/index.js` );
