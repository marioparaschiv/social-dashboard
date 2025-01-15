import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import MessageAttachment from '~/components/message-attachment';
import EditNickname from '~/components/modals/edit-nickname';
import type { StoreItem, DiscordUser } from '@shared/types';
import { Link2, PencilLineIcon, Reply } from 'lucide-react';
import BackendMedia from '~/components/backend-media';
import { Separator } from '~/components/ui/separator';
import { useNickname } from '~/stores/nicknames';
import Timestamp from '~/components/timestamp';
import useBackend from '~/hooks/use-backend';
import Markdown from '~/components/markdown';
import Embed from '~/components/embed';
import config from '@web-config.json';
import { cn, Dialogs } from '~/utils';
import { useMemo } from 'react';
import { toast } from 'sonner';


interface MessageProps extends React.ComponentProps<'li'> {
	message: StoreItem;
}


function Message({ message, ...props }: MessageProps) {
	const backend = useBackend();

	const userColours = config[message.type]?.userColours;
	const authorColor = userColours?.[message.author as keyof typeof userColours] ?? 'inherit';

	const imageAttachments = useMemo(() => message.attachments.filter(a => a.type.startsWith('image/')), [message]);
	const otherAttachments = useMemo(() => message.attachments.filter(a => !a.type.startsWith('image/')), [message]);
	const nickname = useNickname(message.type, message.author.id);

	return <li
		data-is-replying={backend.replyingTo === message}
		onDoubleClick={() => backend.replyTo(message)}
		className='relative flex gap-2 items-center group hover:bg-foreground/10 rounded-md data-[is-replying=true]:bg-amber-600/20'
		{...props}
	>
		<div className='group-hover:flex absolute hidden border right-1 top-1 rounded-lg'>
			<button
				onClick={() => backend.replyTo(message)}
				className='flex gap-1 items-center text-xs bg-background/40 hover:bg-background/60 rounded-md rounded-tr-none rounded-br-none p-1'
			>
				<Reply size={18} /> Reply
			</button>
			<Separator orientation='vertical' />
			<button
				className='flex gap-1 items-center text-xs bg-background/40 hover:bg-background/60 rounded-md rounded-tl-none rounded-bl-none p-1'
				onClick={() => {
					let url;

					switch (message.type) {
						case 'discord': {
							const msg = message as StoreItem<'discord'>;

							url = `discord://discord.com/channels/${msg.parameters.guildId ?? '@me'}/${msg.parameters.channelId}/${msg.parameters.messageId}`;
						} break;

						case 'telegram': {
							const msg = message as StoreItem<'telegram'>;

							if (msg.parameters.originId.startsWith('-100')) {
								// Channel
								const channelId = msg.parameters.originId.slice(4); // Remove "-100" prefix
								url = `tg://privatepost?channel=${channelId}&post=${msg.parameters.messageId}`;
							} else {
								// Private chat or DM
								return toast.error('Failed to open telegram link. Please keep in mind that the telegram URL scheme does not support DM chats.');
							}
						} break;
					}

					if (!url) return;

					try {
						// Try to open Discord app
						window.open(url, '_blank', 'noopener,noreferrer');
					} catch (error) {
						console.error('Failed top open external URL:', error);
					}
				}}
			>
				<Link2 size={18} /> Open
			</button>
		</div>
		<div className='flex-shrink-0 m-2 self-start'>
			{message.author.avatar === 'none' ? <div className='w-11 h-11 rounded-full bg-foreground/20 flex items-center justify-center'>
				{(message.type === 'telegram' ?
					formatTelegramOrigin(message.origin.entity).at(0)?.toUpperCase() :
					formatDiscordOrigin(message.origin.entity).at(0)?.toUpperCase()) ?? '?'}
			</div> : <BackendMedia
				className='w-11 h-11 rounded-full'
				path={message.author.avatar}
				name='avatar.png'
			/>}
		</div>
		<div className='flex flex-col overflow-hidden w-full mr-2'>
			<div className='flex gap-2 items-center'>
				<h1
					className='font-bold text-base'
					role='button'
					style={{ color: authorColor }}
					onClick={() => {
						const uuid = `edit-name-${message.author.name}`;

						Dialogs.openDialog({
							uuid,
							title: <span>Edit Nickname</span>,
							content: <EditNickname
								type={message.type}
								authorId={message.author.id}
								uuid={uuid}
							/>,
						});
					}}
				>
					{nickname || message.author.name}
				</h1>
				<Timestamp className='text-xs text-foreground/60' timestamp={message.savedAt} />
				<TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger className='flex gap-1 items-center flex-shrink-0'>
							{message.origin.avatar === 'none' ? <div className='w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center'>
								{(message.type === 'telegram' ?
									formatTelegramOrigin(message.origin).at(0)?.toUpperCase() :
									formatDiscordOrigin(message.origin).at(0)?.toUpperCase()) ?? '?'}
							</div> : <BackendMedia
								className='w-6 h-6 rounded-full'
								path={message.origin.avatar}
								name='avatar.png'
							/>}
							<span className='text-xs text-foreground/60'><b>{message.listeners.join(', ')}</b></span>
						</TooltipTrigger>
						<TooltipContent className='flex flex-col gap-2'>
							<span className='text-sm'>Matched: <b>{message.groups.join(', ')}</b></span>
							<span className='text-sm'>Origin: <b>{message.type === 'telegram' ? formatTelegramOrigin(message.origin.entity) : formatDiscordOrigin(message.origin.entity)}</b></span>
							<span className='text-sm'>Source: <b className='capitalize'>{message.type}</b></span>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				{message.edited && <TooltipProvider delayDuration={100}>
					<Tooltip>
						<TooltipTrigger className='flex gap-1 items-center flex-shrink-0'>
							<div className='w-6 h-6 flex items-center justify-center text-center rounded-full bg-foreground/10'>
								<PencilLineIcon className='rounded-md' size={14} />
							</div>
						</TooltipTrigger>
						<TooltipContent className='flex flex-col gap-2'>
							This message was edited.
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>}
			</div>
			{message.reply && <div className='bg-foreground/15 py-1 px-2 rounded-lg text-sm my-1'>
				<span className='font-bold'>{message.reply.author}</span>
				<p className='truncate whitespace-nowrap'>{message.reply.content}</p>
				{message.reply.attachmentCount !== 0 && <p className='font-light italic'>
					{message.reply.attachmentCount} attachment(s)
				</p>}
			</div>}
			<div className='flex gap-2 items-center'>
				<span className='prose'>
					<Markdown>{message.content}</Markdown>
				</span>
			</div>
			{/* Images */}
			{imageAttachments.length !== 0 && <div className={cn('my-1 w-full grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 items-stretch', message.content && 'mt-2')}>
				{imageAttachments.map((attachment, index) => <MessageAttachment
					attachment={attachment}
					onClick={() => backend.viewImages(message.attachments)}
					key={`message-${message.savedAt}-attachment-${index}`}
				/>)}
			</div>}
			{otherAttachments.length !== 0 && <div className={cn('my-1 w-full grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 items-stretch', imageAttachments.length || message.content && 'mt-2')}>
				{/* Attachments */}
				{message.attachments.filter(r => !r.type.startsWith('image/')).map((attachment, index) => <MessageAttachment
					attachment={attachment}
					key={`message-${message.savedAt}-attachment-${index}`}
				/>)}
			</div>}
			{message.embeds.length !== 0 && <div className='flex flex-col gap-2 my-2 w-full'>
				{message.embeds.map(embed => <Embed embed={embed} />)}
			</div>}
		</div>
	</li>;
}

function formatTelegramOrigin(entityDetails: StoreItem<'telegram'>['origin']['entity']): string {
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

function formatDiscordOrigin(details: StoreItem<'discord'>['origin']['entity']) {
	if (!details) return 'Unknown';

	switch (details.type) {
		case 'group': {
			// Use group title if it exists
			if (details.title) {
				return details.title + ' (Group)';
			}

			// Otherwise join recipient usernames
			return details.recipients ? details.recipients.map((r: DiscordUser) => r.username)?.join(', ') + ' (Group)' : 'Unknown Group';
		}

		case 'dm': {
			return `${details.username} (DM)`;
		}

		case 'guild': {
			return `${details.name} → ${details.channelName}`;
		}

		default: {
			return 'Unknown';
		}
	}
}

export default Message;
