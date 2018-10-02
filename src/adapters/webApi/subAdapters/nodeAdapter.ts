import * as _ from 'lodash';
import * as requestPromise from 'request-promise';

import { Adapter as _AWebApiAdapter } from '../adapter';
import AWebApiAdapter = _AWebApiAdapter.WebApi.AWebApiAdapter;


export namespace Adapter.WebApi {
	export interface INodeWebApiAdapterConfig
	extends AWebApiAdapter.IWebApiAdapterConfig {
		/**
		 * Hostname of the endpoint. On server environment, this parameter is *required*.
		 */
		host: string;
		/**
		 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
		 */
		scheme: string;
	}

	export class NodeWebApiAdapter extends AWebApiAdapter {
		public constructor(
			dataSourceName: string,
			config: INodeWebApiAdapterConfig,
			eventProviders?: AWebApiAdapter.IEventProvider[]
		) {
			const defaultedConfig = _.defaults( config, {
				port: false,
			} );
			super( dataSourceName, defaultedConfig, eventProviders );
		}
		/**
		 * Creates a request, send it and get the result
		 *
		 * @param method      - HTTP verb that describes the request type
		 * @param endPoint    - Url to send on
		 * @param data        - Object to send
		 * @param queryObject - Object to put in query string
		 */
		protected async httpRequest(
			method: AWebApiAdapter.EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<AWebApiAdapter.TEntitiesJsonResponse> {
			const methodNormalized = method.toLowerCase() as
			| 'get'
			| 'post'
			| 'put'
			| 'delete'
			| 'options';
			// requestPromise typings does not support the `options` method. Thus, cast as any
			
			try {
				return await ( requestPromise as any )[methodNormalized]( endPoint, {
					json: _.isNil( data ) ? true : data,
					qs: _.mapValues( queryObject, qsData => JSON.stringify( qsData ) ),
				} );
			} catch ( error ) {
				throw NodeWebApiAdapter.handleError( error.error, error.statusCode );
			}
		}
	}
}
