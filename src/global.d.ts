/// <reference types="node" />
/// <reference path="types/sequential-event.d.ts"/>

import * as Bluebird from 'bluebird';
import * as LoDash from 'lodash';

export interface BluebirdDummyConstructor extends Bluebird<any> {
	new <T>(): Bluebird<T>;
	all: any;
	race: any;
}

declare global {
	interface Promise<T> extends Bluebird<T> {}
	interface PromiseConstructor extends BluebirdDummyConstructor {}
	namespace NodeJS {
		interface Process {
			browser: boolean;
		}
		interface Global {
			_?: LoDash.LoDashStatic;
			SequentialEvent?: any;
		}
	}
}
//declare module 'winston';
