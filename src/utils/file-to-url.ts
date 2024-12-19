import mime from 'mime-types';
import fs from 'fs';


function fileToURL(filePath: string): string {
	const fileBuffer = fs.readFileSync(filePath);

	const mimeType = mime.lookup(filePath) || 'application/octet-stream';

	const base64String = fileBuffer.toString('base64');

	return `data:${mimeType};base64,${base64String}`;
}


export default fileToURL;