import * as _ from 'lodash';
import { EHttpVerb, IEventProviderFactory, IApiDescription } from '.';

export const DefaultQueryTransformerFactory: IEventProviderFactory = (
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
			queryType: string,
			queryNum: string,
			modelName: string,
			select: any,
			update: any,
			options: any,
			apiDesc: IApiDescription
		): IApiDescription {
			const method = ( {
				find: 'GET',
				update: 'PATCH',
				delete: 'DELETE',
				insert: 'POST',
			} as any )[queryType] as EHttpVerb;

			return _.defaultsDeep(
				{
					method,
					endPoint: ( queryNum === 'many'
						? getPluralEndpoint( modelName )
						: modelName
					).toLowerCase(),
					queryString: {
						where: select,
						options,
					},
					body: update,
				},
				apiDesc
			);
		},
	};
};
