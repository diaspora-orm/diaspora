import * as _ from 'lodash';

import {
	AutoIdAdapterEntity,
	IAutoIdAdapterEntityStatic,
} from '../base/autoIdEntity';
import { AdapterEntity } from '../base';
import {
	SelfMatchingAdapterEntity,
	ISelfMatchingAdapterEntityStatic,
} from '../base/selfMatchingEntity';

import { InMemoryAdapter } from '.';

/**
 * Entity stored in {@link Adapters.InMemoryDiasporaAdapter the in-memory adapter}.
 */

export class InMemoryEntityBase extends AdapterEntity {}
export const InMemoryEntityAutoId = AutoIdAdapterEntity(InMemoryEntityBase);
export const InMemoryEntitySelfMatching = SelfMatchingAdapterEntity(
	InMemoryEntityAutoId
);
export type InMemoryEntity = InMemoryEntitySelfMatching;
