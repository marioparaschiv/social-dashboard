import { ResizablePanel } from '~/components/ui/resizable';
import { Separator } from '~/components/ui/separator';
import { useEffect, useRef, useState } from 'react';
import Message from '~/components/message';
import type { StoreItem } from '@types';


interface PanelOptions {
	data: Array<StoreItem>;
	group: string;
	index: number;
}

function Panel(props: PanelOptions) {
	const { index, group, data } = props;
	const ref = useRef<HTMLDivElement | null>(null);
	const [isFirstRender, setIsFirstRender] = useState(true);

	useEffect(() => {
		if (!ref.current || !ref.current.children) return;

		const lastChild = ref.current.children[ref.current.children.length - 1];
		if (!lastChild) return;

		const isNearBottom = ref.current.scrollHeight - ref.current.scrollTop - ref.current.clientHeight < 100;

		if (isNearBottom || isFirstRender) {
			lastChild.scrollIntoView({ behavior: 'smooth' });
			if (isFirstRender) setIsFirstRender(false);
		}
	}, [ref.current, data.length, isFirstRender]);

	return <ResizablePanel
		className='flex flex-col'
		key={'panel-' + index}
		defaultSize={50}
	>
		<h1 className='font-bold p-3'>{group}</h1>
		<Separator />
		<div ref={ref} className='flex flex-col gap-3 p-3 overflow-auto'>
			{data.map((message, index) => <Message
				key={group + '-message-' + index}
				message={message}
			/>)}
		</div>
	</ResizablePanel>;
}

export default Panel;