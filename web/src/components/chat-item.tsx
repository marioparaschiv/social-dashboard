import type { SelectableChannel } from '@shared/types';
import { GripVertical, Plus, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { Button } from '~/components/ui/button';
import type { ComponentProps } from 'react';
import useChatsStore from '~/stores/chats';
import { CSS } from '@dnd-kit/utilities';
import Telegram from '~/icons/telegram';
import Discord from '~/icons/discord';
import { cn } from '~/utils';


interface ChatItemProps extends ComponentProps<'div'> {
	chat: SelectableChannel;
	type: 'add' | 'remove';
	draggable?: boolean;
	showPlatformIcon?: boolean;
}

function ChatItem({ className, type, draggable, showPlatformIcon, chat, ...props }: ChatItemProps) {
	const { addChat, removeChat } = useChatsStore();

	return <div
		{...props}
		className={cn('flex items-center gap-2 p-2 bg-background text-foreground rounded-md border hover:cursor-grab active:cursor-grabbing', className)}
	>
		{draggable && <GripVertical size={16} />}
		<span>{chat.name}</span>
		{showPlatformIcon && (chat.platform === 'discord' ? <Discord /> : <Telegram />)}
		{type === 'remove' && <Button className='cursor-pointer ml-auto w-6 h-6' size='icon' variant='ghost' onClick={() => removeChat(chat.id)}>
			<X />
		</Button>}
		{type === 'add' && <Button className='cursor-pointer ml-auto w-6 h-6' size='icon' variant='ghost' onClick={() => addChat(chat)}>
			<Plus />
		</Button>}
	</div>;
}


interface SortableChatItemProps {
	chat: SelectableChannel;
}

export function SortableChatItem({ chat }: SortableChatItemProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({ id: chat.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return <ChatItem
		type='remove'
		showPlatformIcon
		draggable
		ref={setNodeRef}
		style={style}
		chat={chat}
		{...attributes}
		{...listeners}
	/>;
}

export default ChatItem;