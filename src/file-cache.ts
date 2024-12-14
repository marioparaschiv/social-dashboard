import { exists, mkdir, rm } from 'node:fs/promises';
import { FILE_CACHE_PATH } from '~/constants';
import { join } from 'node:path';


export async function initializeCache() {
	// Remove previous cache if it exists. We do not want to persist cache due to disk size limitations.
	await wipeCache();
	await mkdir(FILE_CACHE_PATH);
}

export async function wipeCache() {
	if (await exists(FILE_CACHE_PATH)) {
		await rm(FILE_CACHE_PATH, { recursive: true, force: true });
	}
}

export function createItemPath(file: string) {
	return join(FILE_CACHE_PATH, file);
}