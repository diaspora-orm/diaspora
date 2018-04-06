import * as _ from 'lodash';

import { AdapterEntity } from '../base';
import { InMemoryAdapter } from '.';
import { SelfMatchingAdapterEntity } from '../base/selfMatchingEntity';
import { AutoIdAdapterEntity } from '../base/autoIdEntity';

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 */

@SelfMatchingAdapterEntity
@AutoIdAdapterEntity
export class InMemoryEntity extends AdapterEntity {}
