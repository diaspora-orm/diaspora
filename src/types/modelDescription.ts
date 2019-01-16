import { IEventHandler } from 'sequential-event';
import * as _ from 'lodash';

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

export namespace ModelDescription {	
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
		attributes: AttributesDescription;
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
	 * An ObjectFieldDescriptor is a field descriptor containing more type informations than a simple [[EFieldType]].
	 * This type can be any kind of specific field descriptor for each type.
	 */
	export type ObjectFieldDescriptor = FieldDescriptor.IPrimitiveFieldDescriptor
	| FieldDescriptor.IArrayFieldDescriptor
	| FieldDescriptor.IObjectFieldDescriptor;
	/**
	 * Can be either the complete {@link ObjectFieldDescriptor} notation or the shorthand {@link EFieldType}.
	 */
	export type FieldDescriptor = ObjectFieldDescriptor | EFieldType;
	export type AttributesDescription = _.Dictionary<FieldDescriptor>;

	export namespace FieldDescriptor{
		/**
		 * Basic common fields to describe an entity field. You should not use this interface directly: use its sub-interfaces
		 */
		interface IBaseFieldDescriptor {
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
		/**
		 * Represents a primitive entity field.
		 */
		export interface IPrimitiveFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.ANY
			| EFieldType.BOOLEAN
			| EFieldType.DATETIME
			| EFieldType.FLOAT
			| EFieldType.INTEGER
			| EFieldType.STRING;
		}
		/**
		 * Represents an array entity field. This array can have one or several member definition(s).
		 */
		export interface IArrayFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.ARRAY;
			/**
			 * Description of possible values for this field
			 *
			 * @author gerkin
			 */
			of?: _.Many<FieldDescriptor>;
		}
		/**
		 * Represents an object entity field. This object can have one or several containing object(s).
		 */
		export interface IObjectFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.OBJECT;
			/**
			 * Object(s) representing properties of internal objects
			 *
			 * @author gerkin
			 */
			attributes?: _.Many<AttributesDescription>;
		}
	}
}

export namespace _ModelDescription{
	export interface IModelDescription {
		/**
		 * Attributes of the model.
		 *
		 * @author gerkin
		 */
		attributes: AttributesDescription;
		/**
		 * List of sources to use with this model.
		 *
		 * @author gerkin
		 */
		sources: _.Dictionary<_.Dictionary<string>>;
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

	export type AttributesDescription = _.Dictionary<FieldDescriptor>;
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
			 * Description of possible values for this field
			 *
			 * @author gerkin
			 */
			of: FieldDescriptor[];
		}
		export interface IObjectFieldDescriptor extends IBaseFieldDescriptor {
			type: EFieldType.OBJECT;
			attributes?: AttributesDescription[];
		}
	}
}

export const FieldDescriptorTypeChecks = {
	isObjectFieldDescriptor(
		fieldDescriptor: ModelDescription.FieldDescriptor
	): fieldDescriptor is ModelDescription.ObjectFieldDescriptor {
		return typeof fieldDescriptor === 'object' && fieldDescriptor.hasOwnProperty( 'type' );
	},
};
