import { Skeleton } from '~/components/ui/skeleton';
import { memo, useEffect, useState } from 'react';
import { DispatchType } from '@shared/constants';
import useBackend from '~/hooks/use-backend';
import type { ImageResponse } from '@types';
import { openDataURL } from '~/utils';


const cache: Record<string, string> = {};
const pending: Record<string, Promise<string>> = {};

function createPendingPromise(hash: string, backend: ReturnType<typeof useBackend>): Promise<string> {
	return new Promise((resolve) => {
		function onImageLoad(payload: ImageResponse) {
			if (payload.hash !== hash) return;

			if (cache[hash] !== payload.data) {
				cache[hash] = payload.data;
			}

			delete pending[hash];
			resolve(payload.data);
		}

		backend.on(DispatchType.IMAGE_RESPONSE, onImageLoad);
		backend.send(DispatchType.REQUEST_IMAGE, { hash });

		return () => backend.off(DispatchType.IMAGE_RESPONSE, onImageLoad);
	});
}

interface BackendImageProps extends Omit<React.ComponentProps<'img'>, 'src'> {
	hash: string;
	name?: string;
	type?: string;
}

const BackendImage = memo(({ hash, name = 'image.png', type = 'image/png', ...props }: BackendImageProps) => {
	const [src, setSrc] = useState<string | undefined>(cache[hash]);
	const backend = useBackend();

	useEffect(() => {
		if (src || !hash) return;

		if (cache[hash]) {
			setSrc(cache[hash]);
			return;
		}

		let cleanup: (() => void) | undefined;

		if (pending[hash] != void 0) {
			pending[hash].then(setSrc);
		} else {
			pending[hash] = createPendingPromise(hash, backend);
			cleanup = () => {
				if (pending[hash] != void 0) {
					delete pending[hash];
				}
			};
			pending[hash].then(setSrc);
		}

		return cleanup;
	}, [hash, backend]);

	if (!src) return <Skeleton {...props} />;

	return <img {...props} role='button' onClick={() => openDataURL(src, name, type)} src={src} />;
});

export default BackendImage;