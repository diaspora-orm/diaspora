/**
 * Reflects the state of the entity.
 *
 * @author Gerkin
 */
export enum EEntityState {
	ORPHAN = 'orphan',
	SYNCING = 'syncing',
	SYNC = 'sync',
}

export type EntityUid = string | number;

export interface IEntityAttributes {
	[key: string]: any;
}
export interface IEntityProperties extends IEntityAttributes {
	id: EntityUid;
	idHash: IIdHash;
}

export interface IIdHash {
	[key: string]: EntityUid;
}
