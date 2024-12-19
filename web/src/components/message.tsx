import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import type { StoreItem, StoreItemTypes } from '@types';
import BackendImage from '~/components/backend-image';
import Timestamp from '~/components/timestamp';


interface MessageProps extends React.ComponentProps<'li'> {
	message: StoreItem<StoreItemTypes>;
}

function Message({ message, ...props }: MessageProps) {
	return <li className='flex gap-2 items-center' {...props}>
		<div>
			<BackendImage
				className='w-11 h-11 rounded-full'
				hash={message.authorAvatar}
			/>
		</div>
		<div className='flex-col gap-2'>
			<div className='flex gap-2 items-center'>
				<h1 className='font-bold text-base'>
					{message.author}
				</h1>
				<Timestamp className='text-xs text-foreground/60' timestamp={message.savedAt} />
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger className='flex gap-1 items-center'>
							{message.originAvatar === 'none' ? <div className='w-6 h-6 rounded-full bg-foreground/20 flex items-center justify-center'>
								{message.type === 'telegram' ?
									formatTelegramOrigin(message.origin).at(0).toUpperCase() :
									formatDiscordOrigin(message.origin).at(0).toUpperCase()}
							</div> : <BackendImage
								className='w-6 h-6 rounded-full'
								hash={message.originAvatar}
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
			<p className='text-sm'>{message.content}</p>
		</div>
	</li>;
}

function formatTelegramOrigin(entityDetails: StoreItem<'telegram'>['origin']) {
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
			return details.recipients ? details.recipients.map(r => r.username)?.join(', ') + ' (Group)' : 'Unknown Group';
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