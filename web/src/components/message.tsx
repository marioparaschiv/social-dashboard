import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import MessageAttachment from '~/components/message-attachment';
import EditNickname from '~/components/modals/edit-nickname';
import { Link2, PencilLineIcon, Reply } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import { useNickname } from '~/stores/nicknames';
import type { StoreItem } from '@shared/types';
import Timestamp from '~/components/timestamp';
import useBackend from '~/hooks/use-backend';
import Markdown from '~/components/markdown';
import idToColor from '~/utils/id-to-color';
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
	const authorColor = userColours?.[message.author as keyof typeof userColours] ?? idToColor(message.author.id);

	const imageAttachments = useMemo(() => message.attachments.filter(a => a.type.startsWith('image/')), [message]);
	const otherAttachments = useMemo(() => message.attachments.filter(a => !a.type.startsWith('image/')), [message]);
	const nickname = useNickname(message.type, message.author.id);

	return <li
		data-is-replying={backend.replyingTo === message}
		onDoubleClick={() => backend.replyTo(message)}
		className='relative flex gap-2 items-center group hover:bg-foreground/10 rounded-md data-[is-replying=true]:bg-amber-600/20'
		{...props}
	>
		<div className='group-hover:flex absolute hidden border right-0.5 rounded-lg'>
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
		<div className='flex gap-1 overflow-hidden w-full mr-2'>
			<div className='flex flex-shrink-0 items-start'>
				<div className='flex gap-1 items-center'>
					{message.edited && <TooltipProvider delayDuration={100}>
						<Tooltip>
							<TooltipTrigger className='flex-shrink-0 flex gap-1 items-center'>
								<div className='w-6 h-6 flex items-center justify-center text-center rounded-full bg-foreground/10'>
									<PencilLineIcon className='rounded-md' size={14} />
								</div>
							</TooltipTrigger>
							<TooltipContent className='flex flex-col gap-2'>
								This message was edited.
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>}
					<Timestamp className='flex-shrink-0 text-xs text-foreground/60' timestamp={message.savedAt} />
					<h1
						className='flex-shrink-0 font-bold text-base'
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
				</div>
			</div>
			{message.reply && <div className='bg-foreground/15 py-1 px-2 rounded-lg text-sm my-1'>
				<span className='font-bold'>{message.reply.author}</span>
				<p className='truncate whitespace-nowrap'>{message.reply.content}</p>
				{message.reply.attachmentCount !== 0 && <p className='font-light italic'>
					{message.reply.attachmentCount} attachment(s)
				</p>}
			</div>}
			<div className='flex gap-2 items-center w-full'>
				<Markdown className='[line-height:initial] w-full prose [overflow-wrap:break-word]'>{message.content}</Markdown>
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
	</li >;
}

export default Message;