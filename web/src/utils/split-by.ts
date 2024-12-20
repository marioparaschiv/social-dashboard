function splitBy<
	T extends Array<Record<K, any>>,
	K extends keyof T[number]
>(items: T, key: K, sorter?: Parameters<T['sort']>['0']): Record<PropertyKey, T> {
	const out: Record<string, T[]> = { unknown: [] };

	if (sorter !== void 0) {
		items = items.sort(sorter);
	}

	for (let i = 0; i < items.length; i++) {
		const item = items[i] as T;  // Type of `item` is `T[number]`, or `Record<K, any>`
		const value = item[key];

		// If the key is undefined or null, push the item to the 'unknown' category
		if (value == void 0) {
			out['unknown'].push(item);
			continue;
		}

		if (typeof value === 'object' && Array.isArray(value)) {
			for (const key of value) {
				// Ensure there's an object for the key value in `out`
				out[key] ??= [];
				out[key].push(item);
			}
		} else if (typeof value === 'string') {
			// Ensure there's an object for the key value in `out`
			out[value] ??= [];
			out[value].push(item);
		}
	}

	return out;
}

export default splitBy;
