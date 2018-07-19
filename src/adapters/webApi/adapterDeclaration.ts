import { BrowserWebApiAdapter } from './subAdapters/browserAdapter';
import { NodeWebApiAdapter } from './subAdapters/nodeAdapter';


export const declareWebApi = ( Diaspora: any ) => Diaspora.registerAdapter( 'webApi', process.browser ? BrowserWebApiAdapter : NodeWebApiAdapter );
