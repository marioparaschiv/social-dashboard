function downloadDataURL(data: string, filename: string) {
	const link = document.createElement('a');
	link.href = data;
	link.download = filename;
	link.click();
}

export default downloadDataURL;