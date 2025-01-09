import { memo, useEffect, useState, createContext, useContext, useRef } from 'react';
import { Skeleton } from '~/components/ui/skeleton';
import { DispatchType } from '@shared/constants';
import useBackend from '~/hooks/use-backend';
import { cn, dataURLToBlob } from '~/utils';


// Create a context to handle the cache
interface MediaCacheContextType {
	cache: Record<string, string>;
	pending: Record<string, Promise<string>>;
}

const MediaCacheContext = createContext<MediaCacheContextType>({
	cache: {},
	pending: {}
});

export const MediaCacheProvider = ({ children }: { children: React.ReactNode; }) => {
	const cacheRef = useRef<MediaCacheContextType>({
		cache: {},
		pending: {}
	});

	return (
		<MediaCacheContext.Provider value={cacheRef.current}>
			{children}
		</MediaCacheContext.Provider>
	);
};

function createPendingPromise(
	hash: string,
	ext: string,
	backend: ReturnType<typeof useBackend>,
	cache: Record<string, string>,
	pending: Record<string, Promise<string>>,
	isVideo: boolean
): [Promise<string>, () => void] {
	let cleanup: (() => void) | undefined;

	const promise = new Promise<string>((resolve) => {
		function onResponse(payload: { hash: string; data: string; }) {
			if (payload.hash !== hash) return;

			if (cache[hash] !== payload.data) {
				cache[hash] = payload.data;
			}

			delete pending[hash];
			resolve(payload.data);
		}

		const responseType = isVideo ? DispatchType.VIDEO_RESPONSE : DispatchType.IMAGE_RESPONSE;
		const requestType = isVideo ? DispatchType.REQUEST_VIDEO : DispatchType.REQUEST_IMAGE;

		backend.on(responseType, onResponse);
		backend.send(requestType, { hash, ext });

		cleanup = () => {
			backend.off(responseType, onResponse);
			delete pending[hash];
		};
	});

	return [promise, cleanup!];
}

type BackendMediaProps = {
	hash: string;
	name: string;
	ext: string;
	type?: string;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

const BackendMedia = memo(({ hash, ext, name, type = 'image/png', className, onClick }: BackendMediaProps) => {
	const { cache, pending } = useContext(MediaCacheContext);
	const [src, setSrc] = useState<string | undefined>(cache[hash]);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const backend = useBackend();
	const cleanupRef = useRef<(() => void) | undefined>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const isVideo = type.startsWith('video/');

	useEffect(() => {
		if (src || !hash) return;

		if (cache[hash]) {
			setSrc(cache[hash]);
			return;
		}

		setIsLoading(true);
		if (pending[hash] != void 0) {
			pending[hash].then(setSrc);
		} else {
			const [promise, cleanup] = createPendingPromise(hash, ext, backend, cache, pending, isVideo);
			pending[hash] = promise;
			cleanupRef.current = cleanup;
			promise.then((data) => {
				if (isVideo) {
					const blob = dataURLToBlob(data, type);
					const blobUrl = URL.createObjectURL(blob);
					cache[hash] = blobUrl; // Store the Blob URL in cache
					setSrc(blobUrl);
				} else {
					cache[hash] = data;
					setSrc(data);
				}
			});
		}

		return () => {
			cleanupRef.current?.();
			cleanupRef.current = undefined;
		};
	}, [hash, backend, src, isVideo, type]);

	// Add cleanup for all Blob URLs when component unmounts
	useEffect(() => {
		return () => {
			if (isVideo && src?.startsWith('blob:')) {
				URL.revokeObjectURL(src);
			}
		};
	}, [isVideo, src]);

	if (!src) return <Skeleton className={className} />;

	if (isVideo) {
		return (
			<div className={cn('relative w-full', className)}>
				{isLoading && (
					<div className="absolute inset-0 flex items-center justify-center bg-background/50">
						<Skeleton className="w-12 h-12 rounded-full" />
					</div>
				)}
				<video
					ref={videoRef}
					className={cn('w-full h-full object-contain aspect-video appearance-none bg-foreground/10 rounded-md', isLoading && 'opacity-0')}
					controls
					preload="metadata"
					src={src}
					onLoadedData={() => {
						setIsLoading(false);
						setError(null);
					}}
					onError={(e) => {
						console.error('Video loading error:', e);
						setError('Failed to load video');
						setIsLoading(false);
					}}
					onClick={(e) => onClick?.(e)}
				>
					{error && <div className="absolute inset-0 flex items-center justify-center text-red-500">{error}</div>}
					Your browser does not support the video tag.
				</video>
			</div>
		);
	}

	return (
		<img
			className={cn('rounded-md w-full h-full', className)}
			role="button"
			loading='eager'
			decoding='async'
			src={src}
			onClick={(e) => onClick?.(e)}
			onError={() => setError('Failed to load image')}
		/>
	);
});

export default BackendMedia;