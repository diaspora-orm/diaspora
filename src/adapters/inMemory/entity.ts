import { AdapterEntity, Adapter } from '../base';
import { IRawEntityAttributes } from '../../entityFactory';
import { InMemoryAdapter } from '.';

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 */
export class InMemoryEntity extends AdapterEntity<InMemoryAdapter> {}
