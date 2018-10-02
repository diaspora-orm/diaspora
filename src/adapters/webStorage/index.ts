import { Adapter as _WebStorageAdapter } from './adapter';
import { Adapter as _WebStorageEntity } from './entity';

export namespace Adapter.WebStorage {
	export import WebStorageAdapter = _WebStorageAdapter.WebStorage.WebStorageAdapter;
	export import WebStorageEntity  = _WebStorageEntity.WebStorage.WebStorageEntity;
}
