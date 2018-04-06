import { AdapterEntity } from '../base';
import { WebStorageAdapter } from '.';
import { SelfMatchingAdapterEntity } from '../base/selfMatchingEntity';
import { AutoIdAdapterEntity } from '../base/autoIdEntity';

/**
 * Entity stored in {@link Adapters.WebStorageDiasporaAdapter the local storage adapter}.
 */
@SelfMatchingAdapterEntity
@AutoIdAdapterEntity
export class WebStorageEntity extends AdapterEntity {}
