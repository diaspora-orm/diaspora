import { IEventHandler } from 'sequential-event';

export interface SourcesHash {
	[key: string]: object;
}

/**
 * Object describing a model.
 *
 * @author gerkin
 */
export interface ModelDescriptionRaw {
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
	attributes: { [key: string]: FieldDescriptor | string };
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
export interface ModelDescription extends ModelDescriptionRaw {
	attributes: { [key: string]: FieldDescriptor };
	sources: SourcesHash;
}

/**
 * Object describing the attributes of a {@link Model~Model}.
 *
 * @author gerkin
 */
export interface BaseFieldDescriptor {
	/**
	 * Expected type of the value. Either `type` or `model` should be defined, or none.
	 *
	 * @author gerkin
	 */
	type?: string;
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
	default?: Function | string;
}
export interface ArrayFieldDescriptor extends BaseFieldDescriptor {
	/**
	 * Description (or array of descriptions) of possible values for this field
	 *
	 * @author gerkin
	 */
	of: FieldDescriptor | FieldDescriptor[];
}
export interface ObjectFieldDescriptor extends BaseFieldDescriptor {
	attributes: { [key: string]: FieldDescriptor };
}
export interface EnumFieldDescriptor extends BaseFieldDescriptor {
	enum: any[];
}
export interface RelationalFieldDescriptor extends BaseFieldDescriptor {
	/**
	 * Expected model of the value. Either `type` or `model` should be defined, or none.
	 *
	 * @author gerkin
	 */
	model: string;
}

export const FieldDescriptorTypeChecks = {
	isArrayFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is ArrayFieldDescriptor {
		return fieldDescriptor.hasOwnProperty( 'of' );
	},
	isObjectFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is ObjectFieldDescriptor {
		return fieldDescriptor.hasOwnProperty( 'attributes' );
	},
	isEnumFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is EnumFieldDescriptor {
		return fieldDescriptor.hasOwnProperty( 'enum' );
	},
	isRelationalFieldDescriptor(
		fieldDescriptor: FieldDescriptor
	): fieldDescriptor is RelationalFieldDescriptor {
		return fieldDescriptor.hasOwnProperty( 'model' );
	},
};

export type FieldDescriptor =
	| BaseFieldDescriptor
	| ArrayFieldDescriptor
	| ObjectFieldDescriptor
	| EnumFieldDescriptor
	| RelationalFieldDescriptor;
