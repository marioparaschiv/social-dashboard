import { EventEmitter } from 'node:events';


class Store<T> extends EventEmitter {
	storage: { [key: PropertyKey]: T[]; } = {};
	maxItems: number;

	constructor(maxItems = 500) {
		super();
		this.maxItems = maxItems;
	}

	add(category: PropertyKey, item: T) {
		// Add the new item
		this.storage[category] ??= [];
		const arr = this.storage[category];

		arr.unshift(item);

		// If the storage exceeds the limit, remove the last item
		if (arr.length > this.maxItems) {
			arr.pop();
		}

		this.emit('updated');
		return this.storage;
	}

	delete(category: PropertyKey, item: T): boolean {
		const arr = this.storage[category];
		if (!arr) return true;

		const idx = arr.indexOf(item);
		if (idx > -1) arr.splice(idx, 1);

		if (!arr.length) {
			delete this.storage[category];
		}

		this.emit('updated');

		return true;
	}
}

export default Store;