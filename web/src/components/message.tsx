import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import MessageAttachment from '~/components/message-attachment';
import BackendImage from '~/components/backend-image';
import Timestamp from '~/components/timestamp';
import type { StoreItem, User } from '@types';
import config from '@web-config.json';
import { useMemo } from 'react';
import { cn } from '~/utils';


interface MessageProps extends React.ComponentProps<'li'> {
	message: StoreItem;
}


function Message({ message, ...props }: MessageProps) {
	const highlightedUsers = config[message.type]?.highlightedUsers;
	const authorColor = highlightedUsers?.[message.author as keyof typeof highlightedUsers] ?? 'inherit';

	const imageAttachments = useMemo(() => message.attachments.filter(a => a.type.startsWith('image/')), [message]);
	const otherAttachments = useMemo(() => message.attachments.filter(a => !a.type.startsWith('image/')), [message]);

	return <li className='flex gap-2 items-center' {...props}>
		<div className='flex-shrink-0 m-2 self-start'>
			<BackendImage
				className='w-11 h-11 rounded-full'
				hash={message.authorAvatar}
				name='avatar.png'
			/>
		</div>
		<div className='flex flex-col'>
			<div className='flex gap-2 items-center'>
				<h1 className='font-bold text-base' style={{ color: authorColor }}>
					{message.author}
				</h1>
				<Timestamp className='text-xs text-foreground/60' timestamp={message.savedAt} />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger className='flex gap-1 items-center flex-shrink-0'>
							{message.originAvatar === 'none' ? <div className='w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center'>
								{(message.type === 'telegram' ?
									formatTelegramOrigin(message.origin).at(0)?.toUpperCase() :
									formatDiscordOrigin(message.origin).at(0)?.toUpperCase()) ?? '?'}
							</div> : <BackendImage
								className='w-6 h-6 rounded-full'
								hash={message.originAvatar}
								name='avatar.png'
							/>}
							<span className='text-xs text-foreground/60'><b>{message.listeners.join(', ')}</b></span>
						</TooltipTrigger>
						<TooltipContent className='flex flex-col gap-2'>
							<span className='text-sm'>Matched: <b>{message.listeners.join(', ')}</b></span>
							<span className='text-sm'>Origin: <b>{message.type === 'telegram' ? formatTelegramOrigin(message.origin) : formatDiscordOrigin(message.origin)}</b></span>
							<span className='text-sm'>Source: <b className='capitalize'>{message.type}</b></span>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
			<p>{message.content}</p>
			{/* Images */}
			{imageAttachments.length !== 0 && <div className={cn('mt-1 w-full grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2 items-stretch', message.content && 'mt-2')}>
				{imageAttachments.map((attachment, index) => <MessageAttachment
					attachment={attachment}
					key={`message-${message.savedAt}-attachment-${index}`}
				/>)}
			</div>}
			{otherAttachments.length !== 0 && <div className={cn('mt-1 flex gap-2', imageAttachments.length && 'mt-2')}>
				{/* Attachments */}
				{message.attachments.filter(r => !r.type.startsWith('image/')).map((attachment, index) => <MessageAttachment
					attachment={attachment}
					key={`message-${message.savedAt}-attachment-${index}`}
				/>)}
			</div>}
		</div>
	</li>;
}

function formatTelegramOrigin(entityDetails: StoreItem<'telegram'>['origin']): string {
	if (!entityDetails) return '';

	// Handle forum cases
	if (entityDetails.forum) {
		if (!entityDetails.forumName) {
			return `${entityDetails.title}`;
		}

		return `${entityDetails.title} > ${entityDetails.forumName}`;
	}

	// Handle user/DM case
	if (entityDetails.type === 'user') {
		return `${entityDetails.fullName} (DM)`;
	}

	// Default case - just return title
	return entityDetails.title ?? '?';
}

function formatDiscordOrigin(details: StoreItem<'discord'>['origin']) {
	if (!details) return 'Unknown';

	switch (details.type) {
		case 'group': {
			// Use group title if it exists
			if (details.title) {
				return details.title + ' (Group)';
			}

			// Otherwise join recipient usernames
			return details.recipients ? details.recipients.map((r: User) => r.username)?.join(', ') + ' (Group)' : 'Unknown Group';
		}

		case 'dm': {
			return `${details.username} (DM)`;
		}

		case 'guild': {
			return `${details.name} > ${details.channelName}`;
		}

		default: {
			return 'Unknown';
		}
	}
}

export default Message;