export function stripToken(content: string, character: string = '*', length: number = 28) {
	return content.slice(0, length) + character.repeat(content.length).slice(length);
}

export function stripPhoneNumber(number: string) {
	// Remove all non-digit characters (spaces, dashes, parentheses, etc.)
	const digitsOnly = number.replace(/\D/g, '');

	// Get the last 5 digits
	const lastFiveDigits = digitsOnly.slice(-5);

	// Anonymize the rest of the number, keeping only the last 5 digits
	const anonymizedNumber = '*'.repeat(digitsOnly.length - 5) + lastFiveDigits;

	return anonymizedNumber;
}
