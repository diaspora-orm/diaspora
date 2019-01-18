import { defaults, isNil, mapValues } from 'lodash';
import * as requestPromise from 'request-promise';

import { Adapter as _AWebApiAdapter } from '../adapter';
import AWebApiAdapter = _AWebApiAdapter.WebApi.AWebApiAdapter;
import { IWebApiAdapterConfig, TEntitiesJsonResponse, EHttpVerb } from '../types';


export namespace Adapter.WebApi {
	export class NodeWebApiAdapter extends AWebApiAdapter {
		/**
		 * Converts the user-provided universal config to an adapter-specific one.
		 * 
		 * @author Gerkin
		 * @param options - The user-provided config to transform
		 */
		protected normalizeConfig( options: NodeWebApiAdapter.INodeWebApiAdapterConfig ){
			return defaults( options, {host: '127.0.0.1', scheme: 'http', port: 80} );
		}
		
		public constructor(
			dataSourceName: string,
			config: NodeWebApiAdapter.INodeWebApiAdapterConfig,
			eventProviders?: AWebApiAdapter.IEventProvider[]
		) {
			const defaultedConfig = defaults( config, {
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
			method: EHttpVerb,
			endPoint: string,
			data?: object,
			queryObject?: object
		): Promise<TEntitiesJsonResponse> {
			const methodNormalized = method.toLowerCase() as
			| 'get'
			| 'post'
			| 'put'
			| 'delete'
			| 'options';
			// requestPromise typings does not support the `options` method. Thus, cast as any
			
			try {
				return await ( requestPromise as any )[methodNormalized]( endPoint, {
					json: isNil( data ) ? true : data,
					qs: mapValues( queryObject, qsData => JSON.stringify( qsData ) ),
				} );
			} catch ( error ) {
				throw NodeWebApiAdapter.handleError( error.error, error.statusCode );
			}
		}
	}
	export namespace NodeWebApiAdapter {
		export interface INodeWebApiAdapterConfig extends AWebApiAdapter.IWebApiAdapterConfig {
			/**
			 * Hostname of the endpoint. On server environment, this parameter is *required*.
			 */
			host: string;
			/**
			 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
			 */
			scheme: string;
		}
	}
}
