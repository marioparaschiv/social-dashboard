function idToColor(id: string | number): string {
	// Convert id to absolute value number to handle negative numbers
	const numericId = BigInt(Math.abs(Number(id)));

	// Use modulo to get a number in the valid color range (0-FFFFFF)
	const colorInt = numericId % 16777215n; // 16777215 is FFFFFF in decimal

	// Convert to hex and pad with zeros if needed
	const hex = colorInt.toString(16).padStart(6, '0');

	return `#${hex}`;
}

export default idToColor;