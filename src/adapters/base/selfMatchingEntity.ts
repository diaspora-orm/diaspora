import * as _ from 'lodash';

import { Adapter as _Adapter } from '../base';
import AAdapterEntity = _Adapter.Base.AAdapterEntity;
import { Constructor, OPERATORS } from './adapter-utils';
import { _QueryLanguage } from '../../types/queryLanguage';
import { IEntityProperties } from '../../types/entity';

export const SelfMatchingAdapterEntity = <
TAdapterEntityCtor extends Constructor<AAdapterEntity>
>(
	adapterEntity: TAdapterEntityCtor
): TAdapterEntityCtor =>
class SelfMatchingAdapterEntity extends adapterEntity {
	/**
	 * Check if provided `entity` is matched by the query. Query must be in its canonical form before using this function.
	 *
	 * @author gerkin
	 */
	public static matches(
		attributes: IEntityProperties,
		query: _QueryLanguage.ISelectQuery
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
	public matches( query: _QueryLanguage.ISelectQuery ): boolean {
		return SelfMatchingAdapterEntity.matches( this._properties, query );
	}
};
