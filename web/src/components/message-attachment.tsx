import BackendImage from '~/components/backend-image';
import type { StoreItemAttachment } from '@types';
import { DispatchType } from '@shared/constants';
import { useCallback, useState } from 'react';
import { cn, downloadDataURL } from '~/utils';
import useBackend from '~/hooks/use-backend';
import { FileIcon } from 'lucide-react';


interface MessageAttachmentProps extends React.ComponentProps<'div'> {
	attachment: StoreItemAttachment;
}

function MessageAttachment({ attachment, className, ...props }: MessageAttachmentProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const backend = useBackend();

	const download = useCallback(() => {
		setIsLoading(true);
		setError(null);

		backend.send(DispatchType.REQUEST_IMAGE, { hash: attachment.identifier });

		const remove = backend.on(DispatchType.IMAGE_RESPONSE, (payload) => {
			try {
				downloadDataURL(payload.data, attachment.name);
			} catch (err) {
				setError('Failed to load attachment');
			} finally {
				setIsLoading(false);
				remove();
			}
		});
	}, []);

	if (attachment.type.startsWith('image/')) {
		return <BackendImage
			className='rounded-md'
			role='button'
			hash={attachment.identifier}
			name={attachment.name}
			type={attachment.type}
		/>;
	}

	return <div
		{...props}
		className={cn('flex select-none items-center gap-2 bg-foreground/30 hover:bg-foreground/50 w-fit transition-colors rounded-full px-3 py-1.5 cursor-pointer', className)}
		onClick={download}
	>
		<FileIcon className='w-4 h-4' />
		<span className='text-sm truncate max-w-[200px]'>
			{attachment.name}
		</span>
	</div>;
}

export default MessageAttachment;