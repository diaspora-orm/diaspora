import { Adapter as _Base } from './base';
import { Adapter as _InMemory } from './inMemory';
import { Adapter as _WebApi } from './webApi';
import { Adapter as _WebStorage } from './webStorage';

import { Adapter as _DataAccessLayer } from './dataAccessLayer';

export namespace Adapter {
	export import IAdapterCtr = _Base.IAdapterCtr;
	export import EAdapterState = _Base.EAdapterState;
	
	export import Base = _Base.Base;
	export import WebApi = _WebApi.WebApi;
	export import InMemory = _InMemory.InMemory;
	export import WebStorage = _WebStorage.WebStorage;

	export import DataAccessLayer = _DataAccessLayer.DataAccessLayer;
	export import TDataSource = _DataAccessLayer.TDataSource;
	export import EntityUid = _DataAccessLayer.EntityUid;
}
