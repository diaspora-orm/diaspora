import { isEmpty, isNil, get, defaultsDeep } from 'lodash';

import { Adapter as _WebApiAdapter } from '.';
import AWebApiAdapter = _WebApiAdapter.WebApi.AWebApiAdapter;

import { _QueryLanguage } from '../../types/queryLanguage';
import { EHttpVerb, IQueryDescriptor, IEventProviderFactory, QueryOptions } from './types';

export namespace Adapter.WebApi {
	type QueryStringObject = _QueryLanguage.SelectQueryOrCondition | {
		where?:_QueryLanguage.SelectQueryOrCondition;
		options?:QueryOptions;
	};
	export const makeQueryString = (
		query?: _QueryLanguage.SelectQueryOrCondition,
		options?: QueryOptions
	): QueryStringObject | undefined => {
		// Transforms {where:{foo:1}} to {foo:1}
		if ( isEmpty( options ) ){
			// Force wrap in `where` if search on field `options` or `where` like in {where{options:true}}
			if ( isNil( query ) || ( !( 'options' in query ) && !( 'where' in query ) ) ){
				// If empty query, return undefined
				return isEmpty( query ) ? undefined : query;
			} else {
				return {where:query};
			}
		} else {
			return {where: query, options};
		}
	};
	export const DefaultQueryTransformerFactory: IEventProviderFactory = (
		config: any
	) => {
		/**
		 * Get the plural name of an endpoint.
		 *
		 * @param   endPoint - Name of the endpoint.
		 * @returns Plural version of the endpoint name.
		 */
		const getPluralEndpoint = ( endPoint: string ) =>
		get( config, ['pluralApis', endPoint], `${endPoint}s` );
		return {
			beforeQuery(
				queryDesc: IQueryDescriptor
			): IQueryDescriptor {
				const {
					queryType,
					queryNum,
					modelName,
					select,
					update,
					options,
					apiDesc,
				} = queryDesc;
				const method = ( {
					find: 'GET',
					update: 'PATCH',
					delete: 'DELETE',
					insert: 'POST',
				} as any )[queryType] as EHttpVerb;
				
				return defaultsDeep( {
					apiDesc: {
						method,
						endPoint: ( queryNum === 'many' ? getPluralEndpoint( modelName ) : modelName ).toLowerCase(),
						queryString: makeQueryString( select, options ),
						body: update,
					},
				},                   queryDesc );
			},
		};
	};
}
