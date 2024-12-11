import { EventEmitter } from 'node:events';


class Store<T> extends EventEmitter {
	storage = new Set<T>();

	constructor(...args: ConstructorParameters<typeof Set<T>>) {
		super();

		this.storage = new Set<T>(...args);
	}

	add(item: T): Set<T> {
		this.storage.add(item);
		this.emit('updated');

		return this.storage;
	}

	delete(item: T): boolean {
		const result = this.storage.delete(item);
		if (result) this.emit('updated');

		return result;
	}
}

export default Store;