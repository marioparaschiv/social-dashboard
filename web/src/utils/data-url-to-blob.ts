function dataURLToBlob(dataURL: string, mimeType: string) {
	// Split the data URL to get the base64 data
	const [, base64Data] = dataURL.split(',');

	// Convert base64 to raw binary data
	const binaryData = atob(base64Data);

	// Create an array buffer from the binary data
	const arrayBuffer = new ArrayBuffer(binaryData.length);
	const uint8Array = new Uint8Array(arrayBuffer);

	// Fill the array buffer with the binary data
	for (let i = 0; i < binaryData.length; i++) {
		uint8Array[i] = binaryData.charCodeAt(i);
	}

	// Create and return the Blob
	return new Blob([arrayBuffer], { type: mimeType });
}

export default dataURLToBlob;