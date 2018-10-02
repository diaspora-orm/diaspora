import * as _ from 'lodash';

import { Adapter as _AWebApiAdapter } from '../adapter';
import AWebApiAdapter = _AWebApiAdapter.WebApi.AWebApiAdapter;

type ResolveResponse = ( value?: | AWebApiAdapter.TEntitiesJsonResponse | PromiseLike<AWebApiAdapter.TEntitiesJsonResponse> ) => void;

export namespace Adapter.WebApi {
	export class BrowserWebApiAdapter extends AWebApiAdapter {
		public constructor(
			dataSourceName: string,
			config: AWebApiAdapter.IWebApiAdapterConfig,
			eventProviders?: AWebApiAdapter.IEventProvider[]
		) {
			const defaultedConfig = _.defaults( config, {
				scheme: false,
				host: false,
				port: false,
			} );
			const baseEndPoint =
			false === defaultedConfig.host ? defaultedConfig.path : undefined;
			super(
				dataSourceName,
				_.assign( { baseEndPoint }, defaultedConfig ),
				eventProviders
			);
		}
		
		/**
		 * Serialize a query object to be injected in a query string.
		 *
		 * @author Gerkin
		 * @param queryObject - Query to serialize for a query string
		 */
		private static queryObjectToString( queryObject?: object ) {
			const filteredQueryObject = _.cloneDeep( queryObject ) as any;
			if ( filteredQueryObject && filteredQueryObject.options ) {
				filteredQueryObject.options = _.omitBy(
					filteredQueryObject.options,
					v => _.isNumber( v ) && !isFinite( v )
				);
			}
			return (
				_.chain( filteredQueryObject )
				.thru( _.cloneDeep )
				.omitBy( val => _.isObject( val ) && _.isEmpty( val ) )
				// { foo: 1, bar: { baz: 2 } }
				.mapValues( _.unary( JSON.stringify ) )
				// { foo: '1', bar: '{"baz": "2"}' }
				.toPairs()
				// [ [ 'foo', '1' ], [ 'bar', '{"baz":2}' ] ]
				.map( _.partial( _.map, _.partial.placeholder, encodeURIComponent ) )
				// [ [ 'foo', '1' ], [ 'bar', '%7B%22baz%22%3A2%7D' ] ]
				.map( arr => `${arr[0]}=${arr[1]}` )
				// [ 'foo=1', 'bar=%7B%22baz%22%3A2%7D' ]
				.join( '&' )
				.value()
			);
		}
		
		/**
		 * Binds `resolve` & `reject` to XHR events.
		 *
		 * @param	xhr		- XHR request to bind
		 * @param	resolve	- Promise resolution function that will be triggered if `onload` is ran & the status is a 2xx.
		 * @param	reject	- Promise rejection function to trigger if `onerror` is ran, or a non 2xx status is returned.
		 * @returns XHR with resolution bound to a promise.
		 */
		private static defineXhrEvents(
			xhr: XMLHttpRequest,
			resolve: (
				thenableOrResult?:
				| AWebApiAdapter.TEntitiesJsonResponse
				| PromiseLike<AWebApiAdapter.TEntitiesJsonResponse>
				| undefined
			) => void,
			reject: ( thenableOrResult?: {} | PromiseLike<any> | undefined ) => void
		) {
			xhr.onload = () => {
				try {
					if ( _.inRange( xhr.status, 200, 299 ) ) {
						return resolve( xhr.responseText === '' ? undefined : JSON.parse( xhr.responseText ) );
					} else {
						reject( BrowserWebApiAdapter.handleError(
							JSON.parse( xhr.responseText ),
							xhr.status
						) );
					}
				} catch ( err ) {
					return reject( BrowserWebApiAdapter.handleError( {}, xhr.status ) );
				}
			};
			xhr.onerror = () => reject( BrowserWebApiAdapter.handleError(
				{ message: xhr.responseText },
				xhr.status
			) );
			return xhr;
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
			return new Promise( ( resolve: ResolveResponse, reject ) => {
				const xhr = BrowserWebApiAdapter.defineXhrEvents(
					new XMLHttpRequest(),
					resolve,
					reject
				);
				const queryString = BrowserWebApiAdapter.queryObjectToString(
					queryObject
				);
				xhr.responseType = 'json';
				xhr.open(
					method,
					`${endPoint}${queryString ? `?${queryString}` : ''}`,
					true
				);
				xhr.setRequestHeader( 'Content-Type', 'application/json' );
				xhr.send( _.isNil( data ) ? undefined : JSON.stringify( data ) );
			} );
		}
	}
}
