import * as _ from 'lodash';
import * as requestPromise from 'request-promise';

import { WebApiAdapter } from '../index';

export interface INodeWebApiAdapterConfig extends WebApiAdapter.IWebApiAdapterConfig  {
	/**
	 * Hostname of the endpoint. On server environment, this parameter is *required*.
	 */
	host: string;
	/**
	 * Scheme to use. On server environment, this parameter is *required*. On browser environment, it defaults to a relative scheme (IE ``). Note that it will be suffixed with `//`.
	 */
	scheme: string;
}

export class NodeWebApiAdapter extends WebApiAdapter{
	public constructor(
		dataSourceName: string,
		config: INodeWebApiAdapterConfig,
		eventProviders?: WebApiAdapter.IEventProvider []
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
		method: WebApiAdapter.EHttpVerb ,
		endPoint: string,
		data?: object | true,
		queryObject?: object
	): Promise<WebApiAdapter.TEntitiesJsonResponse > {
		if ( _.isNil( data ) ) {
			data = true;
		}
		const methodNormalized = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'options';
		// requestPromise typings does not support the `options` method. Thus, cast as any
		return ( requestPromise as any )[methodNormalized]( endPoint, {
			json: data,
			qs: _.mapValues(
				queryObject,
			data => ( _.isPlainObject( data ) ? JSON.stringify( data ) : data )
			),
		} );
	}
}
