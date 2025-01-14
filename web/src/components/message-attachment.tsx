import type { StoreItemAttachment } from '@shared/types';
import BackendMedia from '~/components/backend-media';
import { FileIcon } from 'lucide-react';
import { memo } from 'react';
import { cn } from '~/utils';


interface MessageAttachmentProps extends React.ComponentProps<'div'> {
	attachment: StoreItemAttachment;
	onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

const MessageAttachment = memo(({ attachment, className, onClick, ...props }: MessageAttachmentProps) => {
	// Memoize the media type check
	const isMedia = attachment.type.startsWith('image/') ||
		attachment.type.startsWith('video/') ||
		attachment.type === 'application/x-tgsticker' ||
		attachment.type === 'image/gif';

	const isVideo = attachment.type.startsWith('video/');

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
				className
			)}
		>
			<FileIcon className='w-4 h-4' />
			<span className='text-sm truncate max-w-[200px]'>
				{attachment.name}
			</span>
		</div>
	);
});

MessageAttachment.displayName = 'MessageAttachment';

export default MessageAttachment;