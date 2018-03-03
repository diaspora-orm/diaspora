import BluebirdType from 'bluebird';
import LoDashType from 'lodash';
import { SequentialEvent as SequentialEventType } from 'sequential-event';

export const _: LoDashType = (global._ || require('lodash')) as LoDashType;

export const SequentialEvent: typeof SequentialEventType = (() => {
	return global.SequentialEvent || require('sequential-event');
})();

export const Promise: typeof BluebirdType = (() => {
	return global.Promise && (global.Promise as any).version
		? global.Promise
		: require('bluebird');
})();
