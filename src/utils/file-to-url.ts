import mime from 'mime-types';
import fs from 'fs';


function fileToURL(filePath: string): string {
	const fileBuffer = fs.readFileSync(filePath);
	const mimeType = mime.lookup(filePath);

	if (!mimeType) {
		console.warn(`Could not determine MIME type for ${filePath}, falling back to octet-stream`);
		return `data:application/octet-stream;base64,${fileBuffer.toString('base64')}`;
	}

	return `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
}

export default fileToURL;