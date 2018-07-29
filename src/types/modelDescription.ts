import { IEventHandler } from 'sequential-event';

/**
 * Lists types recognized by Diaspora
 *
 * @author Gerkin
 */
export enum EFieldType {
	ANY = 'any',
	ARRAY = 'array',
	BOOLEAN = 'boolean',
	DATETIME = 'datetime',
	FLOAT = 'float',
	INTEGER = 'integer',
	OBJECT = 'object',
	STRING = 'string',
}

export interface ISourcesHash {
	[key: string]: object;
}

export namespace Raw {	
	/**
	 * Object describing a model.
	 *
	 * @author gerkin
	 */
	export interface IModelDescription {
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

	export interface IAttributesDescription {
		[key: string]: FieldDescriptor | EFieldType;
	}

	export type FieldDescriptor = FieldDescriptor.IPrimitiveFieldDescriptor
	| FieldDescriptor.IArrayFieldDescriptor
	| FieldDescriptor.IObjectFieldDescriptor;

	export namespace FieldDescriptor{
		export interface IBaseFieldDescriptor {
			/**
			 * Expected type of the value. Either `type` or `model` should be defined, or none.
			 *
			 * @author gerkin
			 */
			type?: EFieldType;
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
			enum?: any[];
		}
		export interface IPrimitiveFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.ANY
			| EFieldType.BOOLEAN
			| EFieldType.DATETIME
			| EFieldType.FLOAT
			| EFieldType.INTEGER
			| EFieldType.STRING;
		}
		export interface IArrayFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.ARRAY;
			/**
			 * Description (or array of descriptions) of possible values for this field
			 *
			 * @author gerkin
			 */
			of?: Array<FieldDescriptor | EFieldType> | FieldDescriptor | EFieldType;
		}
		export interface IObjectFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.OBJECT;
			attributes?: { [key: string]: FieldDescriptor | EFieldType };
		}
		export const FieldDescriptorTypeChecks = {
			isFieldDescriptor(
				fieldDescriptor: FieldDescriptor | EFieldType
			): fieldDescriptor is FieldDescriptor {
				return typeof fieldDescriptor === 'object' && fieldDescriptor.hasOwnProperty( 'type' );
			},
		};
	}
}

export interface IModelDescription {
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
	sources: ISourcesHash;
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

export interface IAttributesDescription {
	[key: string]: FieldDescriptor;
}
export type FieldDescriptor = FieldDescriptor.IPrimitiveFieldDescriptor
| FieldDescriptor.IArrayFieldDescriptor
| FieldDescriptor.IObjectFieldDescriptor;

export namespace FieldDescriptor{
	export interface IBaseFieldDescriptor {
		/**
		 * Expected type of the value. Either `type` or `model` should be defined, or none.
		 *
		 * @author gerkin
		 */
		type: EFieldType;
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
		required: boolean;
		default: Function | any;
		enum?: any[];
	}
	export interface IPrimitiveFieldDescriptor extends IBaseFieldDescriptor {
		type: EFieldType.ANY
		| EFieldType.BOOLEAN
		| EFieldType.DATETIME
		| EFieldType.FLOAT
		| EFieldType.INTEGER
		| EFieldType.STRING;
	}
	export interface IArrayFieldDescriptor extends IBaseFieldDescriptor {
		type: EFieldType.ARRAY;
		/**
		 * Description (or array of descriptions) of possible values for this field
		 *
		 * @author gerkin
		 */
		of?: FieldDescriptor[] | FieldDescriptor;
	}
	export interface IObjectFieldDescriptor extends IBaseFieldDescriptor {
		type: EFieldType.OBJECT;
		attributes?: { [key: string]: FieldDescriptor };
	}
	export const FieldDescriptorTypeChecks = {
	};
}
