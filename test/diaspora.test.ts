import * as _ from 'lodash';

import { importTest, getStyle } from './utils';
import Diaspora from '../src/diaspora';
import { Validator } from '../src/validator';
import { FieldDescriptor } from '../src/types/modelDescription';

const defaultCheck = (
	entity: any,
	modelDesc: { [key: string]: FieldDescriptor }
) => {
	return new Validator( modelDesc ).default( entity );
};

describe( 'Diaspora exposed methods', () => {
	it( 'Default', () => {
		const now = _.now();
		expect(
			defaultCheck(
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
		).toMatchObject( {
			aze: 123,
			foo: 'bar',
		} );

		expect(
			defaultCheck(
				{
					aze: 123,
				},
				{
					foo: {
						type: 'datetime',
						default: () => now,
					},
				}
			)
		).toMatchObject( {
			aze: 123,
			foo: now,
		} );

		expect(
			defaultCheck(
				{
					aze: 'baz',
				},
				{
					aze: {
						type: 'text',
						default: 'bar',
					},
				}
			)
		).toMatchObject( {
			aze: 'baz',
		} );
		expect(
			defaultCheck(
				{
					aze: 'baz',
				},
				{
					aze: {
						type: 'datetime',
						default: () => 'bar',
					},
				}
			)
		).toMatchObject( {
			aze: 'baz',
		} );
	} );
} );
