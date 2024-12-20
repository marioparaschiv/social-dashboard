import dataURLToBlob from '~/utils/data-url-to-blob';


function openDataURL(data: string, fileName: string, mimeType: string) {
	const blob = dataURLToBlob(data, mimeType);
	const file = URL.createObjectURL(blob);

	const link = document.createElement('a');

	link.href = file;
	link.download = fileName;  // Set the filename here
	link.target = '_blank';

	link.click();

	setTimeout(() => {
		URL.revokeObjectURL(file);
	}, 100);
}


export default openDataURL;