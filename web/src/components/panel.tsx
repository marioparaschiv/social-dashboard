import { ResizablePanel } from '~/components/ui/resizable';
import type { StoreItem, StoreItemTypes } from '@types';
import { Separator } from '~/components/ui/separator';
import Message from '~/components/message';
import { Virtuoso } from 'react-virtuoso';
import { forwardRef, memo } from 'react';


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
			<PanelContent data={data} group={group} />
		</div>
	</ResizablePanel>;
}

interface PanelContentProps {
	data: StoreItem<StoreItemTypes>[];
	group: string;
}

const PanelContent = memo(({ data, group }: PanelContentProps) => {
	return <Virtuoso
		data={data}
		initialTopMostItemIndex={{ index: 'LAST' }}
		followOutput='smooth'
		itemContent={(index, message) => <PanelListItem
			data={data}
			index={index}
			message={message}
			group={group}
		/>}
		components={{
			Item: forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => (
				<div
					{...props}
					className='flex flex-col px-1'
					ref={ref}
				/>
			))
		}}
	/>;
});

interface PanelListItemProps {
	data: StoreItem<StoreItemTypes>[];
	index: number;
	group: string;
	message: StoreItem<StoreItemTypes>;
}

const PanelListItem = memo(({ data, index, message, group }: PanelListItemProps) => {
	return <div className='flex flex-col mt-1'>
		<Message
			key={group + '-message-' + index}
			message={message}
		/>
		{index !== (data.length - 1) && <Separator className='!bg-foreground/10 mt-1' />}
		{index === (data.length - 1) && <div className='mb-1' />}
	</div>;
});

export default Panel;