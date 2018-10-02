import { Adapter as _AAdapter } from './adapter';
import { Adapter as _AAdapterEntity } from './entity';

export namespace Adapter {
	export import EAdapterState      = _AAdapter.EAdapterState;
	export import IAdapterCtr        = _AAdapter.IAdapterCtr;
	export import IAdapterEntityCtr  = _AAdapterEntity.IAdapterEntityCtr;
}

export namespace Adapter.Base {
	export import AAdapter       = _AAdapter.Base.AAdapter;
	export import AAdapterEntity = _AAdapterEntity.Base.AAdapterEntity;
}
