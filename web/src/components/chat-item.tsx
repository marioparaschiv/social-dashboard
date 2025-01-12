import type { SelectableChannel } from '@shared/types';


interface ChatItemProps {
	chat: SelectableChannel;
}

function ChatItem(props: ChatItemProps) {
	return <div className='p-2 bg-foreground/10 rounded-md'>
		{props.chat.name}
	</div>;
}

export default ChatItem;