import * as _ from 'lodash';

import { Constructable, OPERATORS } from './adapter-utils';
import { AdapterEntity, IRawAdapterEntityAttributes } from './entity';
import { QueryLanguage } from '../../types/queryLanguage';

export const SelfMatchingAdapterEntity = <
	T extends Constructable<AdapterEntity>
>(
	adapterEntity: T
): T => {
	return class SelfMatchingAdapterEntity extends adapterEntity {
		/**
		 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
		 *
		 * @author gerkin
		 */
		public static matches(
			attributes: IRawAdapterEntityAttributes,
			query: QueryLanguage.SelectQuery
		): boolean {
			// Iterate over every query keys to check each predicates
			const matchResult = _.every( _.toPairs( query ), ( [key, desc] ) => {
				if ( _.isObject( desc ) ) {
					const entityVal = attributes[key];
					// Iterate over each matchers in the query for this attribute
					return _.every( desc, ( val, operationName ) => {
						// Try to execute the rule's matcher if any
						const operationFunction = OPERATORS[operationName];
						if ( operationFunction ) {
							return operationFunction( entityVal, val );
						} else {
							return false;
						}
					} );
				}
				return false;
			} );
			return matchResult;
		}

		/**
		 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
		 *
		 * @author gerkin
		 */
		public matches( query: QueryLanguage.SelectQuery ): boolean {
			return SelfMatchingAdapterEntity.matches( this._attributes, query );
		}
	};
};
