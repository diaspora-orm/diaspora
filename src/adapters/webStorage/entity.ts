import { Adapter as _AAdapterEntity } from '../base';
import AAdapterEntity = _AAdapterEntity.Base.AAdapterEntity;

import { SelfMatchingAdapterEntity } from '../base/selfMatchingEntity';
import { AutoIdAdapterEntity } from '../base/autoIdEntity';

export namespace Adapter.WebStorage {
	/**
	 * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
	 */
	@SelfMatchingAdapterEntity
	@AutoIdAdapterEntity
	export class WebStorageEntity extends AAdapterEntity {}
}

