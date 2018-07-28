import * as _ from 'lodash';
import { WebApiAdapter } from '.';

export const DefaultQueryTransformerFactory: WebApiAdapter.IEventProviderFactory = (
	config: any
) => {
	/**
	 * Get the plural name of an endpoint.
	 *
	 * @param   endPoint - Name of the endpoint.
	 * @returns Plural version of the endpoint name.
	 */
	function getPluralEndpoint( endPoint: string ) {
		return _.get( config, ['pluralApis', endPoint], `${endPoint}s` );
	}
	
	return {
		beforeQuery(
			queryDesc: WebApiAdapter.IQueryDescriptor
		): WebApiAdapter.IQueryDescriptor {
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
			} as any )[queryType] as WebApiAdapter.EHttpVerb;
			
			return _.defaultsDeep( { apiDesc: {
				method,
				endPoint: ( queryNum === 'many' ? getPluralEndpoint( modelName ) : modelName ).toLowerCase(),
				queryString: {
					where: select,
					options,
				},
				body: update,
			} },                   queryDesc );
		},
	};
};
