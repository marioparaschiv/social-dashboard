function splitBy<
	T extends Record<string, any>,
	K extends keyof T,
>(items: T[], key: K, sorter?: (a: T, b: T) => number): Record<PropertyKey, T[]> {
	const out: Record<PropertyKey, T[]> = { unknown: [] };

	if (sorter !== undefined) {
		items = [...items].sort(sorter);
	}

	for (const item of items) {
		const value = item[key];

		if (value === undefined || value === null) {
			out['unknown'].push(item);
			continue;
		}

		if (Array.isArray(value)) {
			for (const subValue of value as any[]) {
				out[subValue as PropertyKey] ??= [];
				out[subValue as PropertyKey].push(item);
			}
		} else {
			out[value as PropertyKey] ??= [];
			out[value as PropertyKey].push(item);
		}
	}

	return out;
}

export default splitBy;