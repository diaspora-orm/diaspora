import * as _ from 'lodash';

import { Constructable, OPERATORS } from './adapter-utils';
import { QueryLanguage, AdapterEntity, IRawAdapterEntityAttributes } from '.';

export interface ISelfMatchingAdapterEntity {
	matches(query: QueryLanguage.SelectQuery): boolean;
}
export interface ISelfMatchingAdapterEntityStatic {
	new (...args: any[]): ISelfMatchingAdapterEntity;
	matches(
		attributes: IRawAdapterEntityAttributes,
		query: QueryLanguage.SelectQuery
	): boolean;
}

export type Built<T extends Constructable<AdapterEntity>> = T &
	ISelfMatchingAdapterEntityStatic;

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 */
export const SelfMatchingAdapterEntity = <
	T extends Constructable<AdapterEntity>
>(
	adapterEntity: T
): Built<T> => {
	return class SelfMatchingAdapterEntity extends adapterEntity {
		/**
		 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
		 *
		 * @author gerkin
		 */
		matches(query: QueryLanguage.SelectQuery): boolean {
			return SelfMatchingAdapterEntity.matches(this._attributes, query);
		}

		/**
		 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
		 *
		 * @author gerkin
		 */
		static matches(
			attributes: IRawAdapterEntityAttributes,
			query: QueryLanguage.SelectQuery
		): boolean {
			// Iterate over every query keys to check each predicates
			const matchResult = _.every(_.toPairs(query), ([key, desc]) => {
				if (_.isObject(desc)) {
					const entityVal = attributes[key];
					// Iterate over each matchers in the query for this attribute
					return _.every(desc, (val, operationName) => {
						// Try to execute the rule's matcher if any
						const operationFunction = OPERATORS[operationName];
						if (operationFunction) {
							return operationFunction(entityVal, val);
						} else {
							return false;
						}
					});
				}
				return false;
			});
			return matchResult;
		}
	};
};
