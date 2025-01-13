import type { StoreItemAttachment } from '@shared/types';
import BackendMedia from '~/components/backend-media';
import { FileIcon, X } from 'lucide-react';
import { memo, useState } from 'react';
import { cn } from '~/utils';


interface MessageAttachmentProps extends React.ComponentProps<'div'> {
	attachment: StoreItemAttachment;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const MessageAttachment = memo(({ attachment, className, onClick, ...props }: MessageAttachmentProps) => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Memoize the error state UI
	const errorContent = error && (
		<div className='flex flex-col bg-foreground/10 px-6 py-4 text-center m-auto items-center justify-center rounded-md'>
			<X />
			Failed to load.
		</div>
	);

	// Memoize the media type check
	const isMedia = attachment.type.startsWith('image/') ||
		attachment.type.startsWith('video/') ||
		attachment.type === 'application/x-tgsticker' ||
		attachment.type === 'image/gif';

	const isVideo = attachment.type.startsWith('video/');

	if (error) return errorContent;

	if (isMedia) {
		return (
			<BackendMedia
				onClick={onClick}
				className={cn('rounded-md', isVideo && 'max-w-full max-h-[400px]')}
				name={attachment.name}
				path={attachment.path}
				type={attachment.type}
			/>
		);
	}

	return (
		<div
			{...props}
			className={cn(
				'flex select-none items-center gap-2 bg-foreground/30 hover:bg-foreground/50 w-fit transition-colors rounded-full px-3 py-1.5',
				isLoading && 'animate-pulse',
				!error && 'cursor-pointer',
				className
			)}
		>
			{error ? <X className='w-4 h-4' /> : <FileIcon className='w-4 h-4' />}
			<span className='text-sm truncate max-w-[200px]'>
				{isLoading ? 'Loading...' : attachment.name}
			</span>
		</div>
	);
});

MessageAttachment.displayName = 'MessageAttachment';

export default MessageAttachment;