import { EntityTransformers as _EntityTransformer } from './entityTransformer';
import { EntityTransformers as _CheckTransformer } from './checkTransformer';
import { EntityTransformers as _DefaultTransformer } from './defaultTransformer';

export namespace EntityTransformers{
	export import AEntityTransformer = _EntityTransformer.AEntityTransformer;
	export import CheckTransformer = _CheckTransformer.CheckTransformer;
	export import DefaultTransformer = _DefaultTransformer.DefaultTransformer;
}
