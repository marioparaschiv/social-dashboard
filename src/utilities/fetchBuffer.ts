function fetchBuffer(url: string, options: Parameters<typeof fetch>[1] = {}): Promise<ArrayBuffer> {
	return fetch(url, options).then(r => r.arrayBuffer());
}

export default fetchBuffer;