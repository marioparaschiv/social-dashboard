import { EventEmitter } from 'node:events';


class Store<T> extends EventEmitter {
	storage: T[] = [];
	maxItems: number;

	constructor(maxItems = 500) {
		super();
		this.maxItems = maxItems;
	}

	add(item: T): T[] {
		// Add the new item to the beginning
		this.storage.unshift(item);

		// If the storage exceeds the limit, remove the last item
		if (this.storage.length > this.maxItems) {
			this.storage.pop();
		}

		this.emit('updated');
		return this.storage;
	}

	delete(item: T): boolean {
		const index = this.storage.indexOf(item);
		if (index !== -1) {
			this.storage.splice(index, 1);
			this.emit('updated');
			return true;
		}

		return false;
	}
}

export default Store;