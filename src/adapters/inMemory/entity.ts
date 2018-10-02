import { Adapter as _AAdapterEntity } from '../base';
import AAdapterEntity = _AAdapterEntity.Base.AAdapterEntity;

import { SelfMatchingAdapterEntity } from '../base/selfMatchingEntity';
import { AutoIdAdapterEntity } from '../base/autoIdEntity';

export namespace Adapter.InMemory {
	/**
	 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
	 */

	@SelfMatchingAdapterEntity
	@AutoIdAdapterEntity
	export class InMemoryEntity extends AAdapterEntity {}
}
