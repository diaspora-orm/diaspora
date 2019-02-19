import { keys, isEmpty, isNil, get, defaultsDeep } from 'lodash';

import { Adapter as _WebApiAdapter } from '.';
import AWebApiAdapter = _WebApiAdapter.WebApi.AWebApiAdapter;

import { QueryLanguage } from '../../types/queryLanguage';

export namespace Adapter.WebApi {
	type QueryStringObject = QueryLanguage.SelectQueryOrCondition | {
		where?:QueryLanguage.SelectQueryOrCondition;
		options?:AWebApiAdapter.QueryOptions;
	};
	export const makeQueryString = (
		query?: QueryLanguage.SelectQueryOrCondition,
		options?: AWebApiAdapter.QueryOptions
	): QueryStringObject | undefined => {
		// Transforms {where:{foo:1}} to {foo:1}
		if ( isEmpty( options ) ){
			// Force wrap in `where` if search on field `options` or `where` like in {where{options:true}}
			if ( isNil( query ) || ( !( 'options' in query ) && !( 'where' in query ) ) ){
				// If query is only `id == ...`, return only the id
				if(!isNil(query) && keys(query).length === 1 && ('id' in query) && keys(query.id).length === 1 && ('$equal' in query.id)){
					return query.id.$equal;
				}
				// If empty query, return undefined
				return isEmpty( query ) ? undefined : query;
			} else {
				return {where:query};
			}
		} else {
			return {where: query, options};
		}
	};
	export const DefaultQueryTransformerFactory: AWebApiAdapter.IEventProviderFactory = (
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
				queryDesc: AWebApiAdapter.IQueryDescriptor
			): AWebApiAdapter.IQueryDescriptor {
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
				} as any )[queryType] as AWebApiAdapter.EHttpVerb;
				
				const queryStringObj = makeQueryString( select, options );
				if(typeof queryStringObj === 'string'){
					// Search single by id
					return defaultsDeep( {
						apiDesc: {
							method,
							endPoint: `${modelName.toLowerCase()}/${queryStringObj}`,
							queryString: undefined,
							body: update,
						},
					},                     queryDesc );
				} else {
					return defaultsDeep( {
						apiDesc: {
							method,
							endPoint: ( queryNum === 'many' ? getPluralEndpoint( modelName ) : modelName ).toLowerCase(),
							queryString: queryStringObj,
							body: update,
						},
					},                     queryDesc );
				}
			},
		};
	};
}
