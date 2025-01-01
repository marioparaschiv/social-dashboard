import { ResizablePanel } from '~/components/ui/resizable';
import { Separator } from '~/components/ui/separator';
import Message from '~/components/message';
import { Virtuoso } from 'react-virtuoso';
import type { StoreItem } from '@types';
import { forwardRef } from 'react';


interface PanelOptions {
	data: Array<StoreItem>;
	group: string;
	index: number;
}

function Panel(props: PanelOptions) {
	const { index, group, data } = props;

	return <ResizablePanel
		className='flex flex-col h-full'
		key={'panel-' + index}
		defaultSize={50}
	>
		<h1 className='font-bold p-3'>{group}</h1>
		<Separator />
		<div className='h-full'>
			<Virtuoso
				data={data}
				itemContent={(index, message) => {
					console.log(index, data.length);
					return <div className='flex flex-col mt-1'>
						<Message
							key={group + '-message-' + index}
							message={message}
						/>
						{index !== (data.length - 1) && <Separator className='!bg-foreground/10 mt-1' />}
						{index === (data.length - 1) && <div className='mb-1' />}
					</div>;
				}}
				components={{
					Item: forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => (
						<div
							{...props}
							className='flex flex-col px-1'
							ref={ref}
						/>
					))
				}}
				followOutput
				initialTopMostItemIndex={data.length - 1} // Start at the bottom of the list
			/>
		</div>
	</ResizablePanel>;
}

export default Panel;