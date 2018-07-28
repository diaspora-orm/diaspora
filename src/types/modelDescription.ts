import { IEventHandler } from 'sequential-event';

/**
 * Lists types recognized by Diaspora
 * 
 * @author Gerkin
 */
export enum EType{
	STRING = 'string',
	INTEGER = 'integer',
	FLOAT = 'float',
	DATE = 'date',
	BOOLEAN = 'boolean',
	ANY = 'any',
	OBJECT = 'object',
	ARRAY = 'array',
	RELATION = 'relation',
}

export interface SourcesHash {
	[key: string]: object;
}

export namespace Raw{
	export interface IAttributesDescription{
		[key: string]: FieldDescriptor | EType;
	}

	/**
	 * Object describing a model.
	 *
	 * @author gerkin
	 */
	export interface ModelDescription {
		/**
		 * List of sources to use with this model.
		 *
		 * @author gerkin
		 */
		sources: string | string[] | { [key: string]: object | boolean };
		/**
		 * Attributes of the model.
		 *
		 * @author gerkin
		 */
		attributes: IAttributesDescription;
		/**
		 * Methods to add to entities prototype.
		 *
		 * @author gerkin
		 */
		methods?: { [key: string]: Function };
		/**
		 * Static methods to add to entities.
		 *
		 * @author gerkin
		 */
		staticMethods?: { [key: string]: Function };
		/**
		 * Events to bind on entities.
		 *
		 * @author gerkin
		 */
		lifecycleEvents?: { [key: string]: IEventHandler | IEventHandler[] };
	}

}

export interface IAttributesDescription{
	[key: string]: FieldDescriptor;
}
export interface ModelDescription {
	/**
	 * Attributes of the model.
	 *
	 * @author gerkin
	 */
	attributes: IAttributesDescription;
	/**
	 * List of sources to use with this model.
	 *
	 * @author gerkin
	 */
	sources: SourcesHash;
	/**
	 * Methods to add to entities prototype.
	 *
	 * @author gerkin
	 */
	methods?: { [key: string]: Function };
	/**
	 * Static methods to add to entities.
	 *
	 * @author gerkin
	 */
	staticMethods?: { [key: string]: Function };
	/**
	 * Events to bind on entities.
	 *
	 * @author gerkin
	 */
	lifecycleEvents?: { [key: string]: IEventHandler | IEventHandler[] };
}

/**
 * Object describing the attributes of a {@link Model~Model}.
 *
 * @author gerkin
 */
export interface IBaseFieldDescriptor {
	/**
	 * Expected type of the value. Either `type` or `model` should be defined, or none.
	 *
	 * @author gerkin
	 */
	type?: EType;
	/**
	 * Custom validation callback.
	 *
	 * @author gerkin
	 */
	validate?: Function | Function[];
	/**
	 * Set to `true` to require a value. Even when `true`, empty arrays are allowed. To require at least one element in an array, use the `minLength` property
	 *
	 * @author gerkin
	 */
	required?: boolean;
	default?: Function | any;
}
export interface INonRelationalFieldDescriptor extends IBaseFieldDescriptor{
	enum?: any[];
}
export interface INativeFieldDescriptor extends INonRelationalFieldDescriptor{
	type: EType.ANY | EType.BOOLEAN | EType.DATE | EType.FLOAT | EType.INTEGER | EType.STRING;
}
export interface IArrayFieldDescriptor extends INonRelationalFieldDescriptor {
	type: EType.ARRAY;
	/**
	 * Description (or array of descriptions) of possible values for this field
	 *
	 * @author gerkin
	 */
	of: FieldDescriptor | FieldDescriptor[];
}
export interface IObjectFieldDescriptor extends INonRelationalFieldDescriptor {
	type: EType.OBJECT;
	attributes: { [key: string]: FieldDescriptor };
}

export interface IRelationalFieldDescriptor extends IBaseFieldDescriptor {
	type: undefined | EType.RELATION;
	/**
	 * Expected model of the value. Either `type` or `model` should be defined, or none.
	 *
	 * @author gerkin
	 */
	model: string;
}

export const FieldDescriptorTypeChecks = {
	isFieldDescriptor(
		fieldDescriptor: FieldDescriptor | EType
	): fieldDescriptor is FieldDescriptor {
		return fieldDescriptor.hasOwnProperty( 'type' ) || fieldDescriptor.hasOwnProperty( 'model' );
	},
	isRelationalFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is IRelationalFieldDescriptor{
		return !fieldDescriptor.hasOwnProperty( 'type' ) || fieldDescriptor.type === EType.RELATION;
	},
};

export type NonRelationalFieldDescriptor = INativeFieldDescriptor
| IArrayFieldDescriptor
| IObjectFieldDescriptor;
export type FieldDescriptor = NonRelationalFieldDescriptor | IRelationalFieldDescriptor;
