import { memo, useEffect, useMemo, useRef } from 'react';
import { API_URL } from '@shared/constants';
import lottie from 'lottie-web';
import { cn } from '~/utils';
import pako from 'pako';


type BackendMediaProps = {
	name: string;
	path: string;
	type?: string;
	className?: string;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
};

// Move this outside component to prevent recreation
const buildBackendURL = (path: string) => `${API_URL}/media/${path}`;

// Cache for video elements to prevent recreation during virtualization
const videoCache = new Map<string, HTMLVideoElement>();
const lottieCache = new Map<string, any>();

const Video = memo(({ path, type, className, onClick }: BackendMediaProps) => {
	const url = useMemo(() => buildBackendURL(path), [path]);
	const containerRef = useRef<HTMLDivElement>(null);

	// Initialize or get cached video
	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		let video = videoCache.get(path);

		if (!video) {
			// Create new video element if not in cache
			video = document.createElement('video');
			video.className = "w-full h-full object-contain aspect-video appearance-none bg-foreground/10 rounded-md";
			video.controls = type !== 'image/gif'; // No controls for GIFs
			video.preload = "metadata";
			video.loop = type === 'image/gif'; // Loop GIFs
			video.autoplay = type === 'image/gif'; // Autoplay GIFs
			video.muted = type === 'image/gif'; // Mute GIFs
			video.playsInline = true; // Add playsinline for mobile support

			const source = document.createElement('source');
			source.src = url;
			source.type = type ?? 'video/mp4';
			video.appendChild(source);

			// Start playing as soon as enough data is loaded for GIFs
			if (type === 'image/gif') {
				video.addEventListener('loadeddata', () => {
					video!.play().catch(console.error);
				}, { once: true });
			}

			videoCache.set(path, video);
		}

		// Add video to container
		container.appendChild(video);

		// For GIFs, ensure they're playing when added back to the DOM
		if (type === 'image/gif' && video.paused) {
			video.play().catch(console.error);
		}

		// Cleanup
		return () => {
			if (container.contains(video)) {
				container.removeChild(video);
			}
		};
	}, [path, url, type]);

	return (
		<div ref={containerRef} className={cn('relative w-full', className)} onClick={onClick} />
	);
});

Video.displayName = 'Video';

const Image = memo(({ path, className, onClick }: BackendMediaProps) => {
	const url = useMemo(() => buildBackendURL(path), [path]);

	return (
		<img
			className={cn('rounded-md w-full h-full', className)}
			role="button"
			loading="lazy"
			decoding="async"
			src={url}
			onClick={onClick}
		/>
	);
});

Image.displayName = 'Image';

const Sticker = memo(({ path, className, onClick }: BackendMediaProps) => {
	const url = useMemo(() => buildBackendURL(path), [path]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		console.log('Loading sticker:', url);

		let animation = lottieCache.get(path);

		const loadSticker = async () => {
			try {
				// Fetch the compressed data
				const response = await fetch(url);
				const arrayBuffer = await response.arrayBuffer();

				// Decompress the gzipped data
				const decompressed = pako.inflate(new Uint8Array(arrayBuffer));

				// Convert to JSON
				const jsonString = new TextDecoder().decode(decompressed);
				const animationData = JSON.parse(jsonString);

				// Create new animation with the decompressed data
				animation = lottie.loadAnimation({
					container,
					renderer: 'svg',
					loop: true,
					autoplay: true,
					animationData,
				});

				// Add debug event listeners
				animation.addEventListener('data_ready', () => {
					console.log('Lottie data ready for:', path);
				});

				animation.addEventListener('DOMLoaded', () => {
					console.log('Lottie DOM loaded for:', path);
				});

				animation.addEventListener('error', (error) => {
					console.error('Lottie error for:', path, error);
				});

				lottieCache.set(path, animation);
			} catch (error) {
				console.error('Failed to load sticker:', error);
			}
		};

		loadSticker();

		return () => {
			if (animation) {
				animation.destroy();
			}
		};
	}, [path, url]);

	return (
		<div
			ref={containerRef}
			className={cn('relative w-32 h-32', className)}
			onClick={onClick}
		/>
	);
});

Sticker.displayName = 'Sticker';

const BackendMedia = memo(({ path, type = 'image/png', ...props }: BackendMediaProps) => {
	// Add sticker detection
	const isSticker = useMemo(() => type === 'application/x-tgsticker', [type]);
	const isVideo = useMemo(() => type.startsWith('video/') || type === 'image/gif', [type]);

	if (isSticker) {
		return <Sticker path={path} {...props} />;
	}

	return isVideo ?
		<Video path={path} type={type} {...props} /> :
		<Image path={path} {...props} />;
});

BackendMedia.displayName = 'BackendMedia';

export default BackendMedia;