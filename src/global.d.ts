/// <reference types="node" />
/// <reference path="types/sequential-event.d.ts"/>

import Bluebird from 'bluebird';
import * as LoDash from 'lodash';

declare global {
	interface Promise<T> extends Bluebird<T> {}
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
