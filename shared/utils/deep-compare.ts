function deepCompare(obj1: Record<any, any> | any[], obj2: Record<any, any> | any[]) {
	// If objects are not the same type, return false
	if (typeof obj1 !== typeof obj2) {
		return false;
	}

	// If objects are both null or undefined, return true
	if (obj1 === null && obj2 === null) {
		return true;
	}

	// If objects are both primitive types, compare them directly
	if (typeof obj1 !== 'object') {
		return obj1 === obj2;
	}

	// If objects are arrays, compare their elements recursively
	if (Array.isArray(obj1) && Array.isArray(obj2)) {
		if (obj1.length !== obj2.length) {
			return false;
		}
		for (let i = 0; i < obj1.length; i++) {
			if (!deepCompare(obj1[i], obj2[i])) {
				return false;
			}
		}
		return true;
	}
	// If objects are both objects, compare their properties recursively
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let key of keys1) {
		if (!obj2.hasOwnProperty(key) || !deepCompare(obj1[key], obj2[key])) {
			return false;
		}
	}

	return true;
}

export default deepCompare;