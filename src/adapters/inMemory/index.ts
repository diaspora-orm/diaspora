import { Adapter as _InMemoryAdapter } from './adapter';
import { Adapter as _InMemoryEntity } from './entity';

export namespace Adapter.InMemory {
	export import InMemoryAdapter = _InMemoryAdapter.InMemory.InMemoryAdapter;
	export import InMemoryEntity  = _InMemoryEntity.InMemory.InMemoryEntity;
}
