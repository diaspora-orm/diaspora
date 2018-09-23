import { Adapter as _WebApiAdapter } from './adapter';
import { Adapter as _WebApiEntity } from './entity';

/*#ifset _BROWSER
// tslint:disable-next-line:comment-format
//#if _BROWSER
import { Adapter as _BrowserWebApiAdapter } from './subAdapters/browserAdapter';
// tslint:disable-next-line:comment-format
//#else
import { Adapter as _NodeWebApiAdapter } from './subAdapters/nodeAdapter';
// tslint:disable-next-line:comment-format
//#endif
// If we are in unbuilt state (like for unit tests), include all adapters aliased if required
//#else //*/
import { Adapter as _BrowserWebApiAdapter } from './subAdapters/browserAdapter';
import { Adapter as _NodeWebApiAdapter } from './subAdapters/nodeAdapter';
import BrowserWebApiAdapter = _BrowserWebApiAdapter.WebApi.BrowserWebApiAdapter;
import NodeWebApiAdapter = _NodeWebApiAdapter.WebApi.NodeWebApiAdapter;
// tslint:disable-next-line:comment-format
//#endif

export namespace Adapter.WebApi {
	export import AWebApiAdapter = _WebApiAdapter.WebApi.AWebApiAdapter;
	export import WebApiEntity  = _WebApiEntity.WebApi.WebApiEntity;
	
	/*#ifset _BROWSER
	// tslint:disable-next-line:comment-format
	//#if _BROWSER
	export import WebApiAdapter = _BrowserWebApiAdapter.WebApi.BrowserWebApiAdapter;
	// tslint:disable-next-line:comment-format
	//#else
	export import WebApiAdapter = _NodeWebApiAdapter.WebApi.NodeWebApiAdapter;
	// tslint:disable-next-line:comment-format
	//#endif

	// If we are in unbuilt state (like for unit tests), include all adapters aliased if required
	//#else //*/
	export type WebApiAdapter = NodeWebApiAdapter | BrowserWebApiAdapter;
	export import BrowserWebApiAdapter = _BrowserWebApiAdapter.WebApi.BrowserWebApiAdapter;
	export import NodeWebApiAdapter = _NodeWebApiAdapter.WebApi.NodeWebApiAdapter;
	// tslint:disable-next-line:comment-format
	//#endif

}
