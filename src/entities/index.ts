import {
	IEntityFactory as _IEntityFactory,
	IRawEntityAttributes as _IRawEntityAttributes,
	EntityFactory as _EntityFactory,
	Entity as _Entity
} from './entityFactory';
import {Set as _Set} from './set';

export namespace Entities{
	export type IRawEntityAttributes = _IRawEntityAttributes;
	export type IEntityFactory = _IEntityFactory;
 export const EntityFactory = _EntityFactory;
 export const Entity        = _Entity;
 export type  Entity        = _Entity;
 export const Set           = _Set;
 export type  Set           = _Set;
}
