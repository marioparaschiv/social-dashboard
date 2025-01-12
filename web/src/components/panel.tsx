import { forwardRef, memo, useCallback, useRef, type ComponentRef } from 'react';
import type { StoreItem, StoreItemTypes } from '@shared/types';
import { ResizablePanel } from '~/components/ui/resizable';
import { Separator } from '~/components/ui/separator';
import Message from '~/components/message';
import { Virtuoso } from 'react-virtuoso';


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
	const virtuosoRef = useRef<ComponentRef<typeof Virtuoso>>(null);
	const timeoutRef = useRef<Timer | null>(null);
	const isScrollingRef = useRef(false);
	const lastScrollTopRef = useRef(0);

	// Track when user is manually scrolling
	const handleScroll = useCallback<React.UIEventHandler<HTMLDivElement>>((e) => {
		if (!virtuosoRef.current) return;

		const target = e.target as HTMLElement;
		const scrollTop = target.scrollTop;
		const maxScrollTop = target.scrollHeight - target.clientHeight;
		const isScrollingDown = scrollTop > lastScrollTopRef.current;
		const isNearBottom = maxScrollTop - scrollTop < 50;

		// Clear any existing timeout
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		if (isScrollingDown && isNearBottom) {
			isScrollingRef.current = false;
			virtuosoRef.current.autoscrollToBottom();
		} else if (!isScrollingDown) {
			isScrollingRef.current = true;

			// Re-enable autoscroll after 5 seconds of no manual scrolling
			timeoutRef.current = setTimeout(() => {
				isScrollingRef.current = false;
			}, 5000);
		}

		lastScrollTopRef.current = scrollTop;
	}, []);

	const followOutput = useCallback(() => {
		return !isScrollingRef.current;
	}, []);

	return <Virtuoso
		data={data}
		className='overflow-x-clip'
		ref={virtuosoRef}
		totalCount={data.length}
		initialTopMostItemIndex={{ index: 'LAST' }}
		followOutput={followOutput}
		onScroll={handleScroll}
		atBottomStateChange={atBottom => {
			if (atBottom) {
				isScrollingRef.current = false;
			}
		}}
		itemContent={(index, message) => <PanelListItem
			data={data}
			key={`message-${message.savedAt}`}
			index={index}
			message={message}
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
	message: StoreItem<StoreItemTypes>;
}

const PanelListItem = memo(({ data, index, message }: PanelListItemProps) => {
	return <div className='flex flex-col mt-1'>
		<Message message={message}
		/>
		{index !== (data.length - 1) && <Separator className='!bg-foreground/10 mt-1' />}
		{index === (data.length - 1) && <div className='mb-1' />}
	</div>;
});

export default Panel;