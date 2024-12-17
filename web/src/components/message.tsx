import type { StoreItem, StoreItemTypes } from '@types';
import { Skeleton } from '~/components/ui/skeleton';

interface MessageProps extends React.ComponentProps<'li'> {
	message: StoreItem<StoreItemTypes>;
}

function Message({ message, ...props }: MessageProps) {
	return <li className='flex gap-2 items-center' {...props}>
		<div>
			<Skeleton className='w-11 h-11 rounded-full' />
		</div>
		<div className='flex-col gap-2'>
			<h1 className='font-bold'>{message.author}</h1>
			<p>{message.content}</p>
		</div>
	</li>;
}

export default Message;