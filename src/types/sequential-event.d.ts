declare module 'sequential-event' {
	type EventCallback = (arg: any) => any;
	export default class SequentialEvent {
		new(): SequentialEvent;
		on(eventName: string, handler: EventCallback): this;
	}
}
