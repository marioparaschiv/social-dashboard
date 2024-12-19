import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable';
import { CheckCircle2, LoaderCircle, MessageCircleOff, Moon } from 'lucide-react';
import { Separator } from '~/components/ui/separator';
import useBackend from '~/hooks/use-backend';
import Message from '~/components/message';
import config from '@web-config.json';
import Page from '~/components/page';
import { splitBy } from '~/utils';
import { useMemo } from 'react';


export const path = '/';
export const element = Feed;

function Feed() {
	const backend = useBackend();

	const data = useMemo(() => splitBy(backend.data, 'groups', (a, b) => a.savedAt - b.savedAt), [backend.data]);
	const groups = useMemo(() => {
		const keys = Object.keys(data);

		return keys
			.filter(d => data[d]?.length !== 0)
			.sort((a, b) => config.categoryOrder.indexOf(a) - config.categoryOrder.indexOf(b));
	}, [data]);

	return <Page className='max-h-dvh overflow-hidden'>
		{(backend.state !== 'ready' || !backend.authenticated) && <div className='font-bold flex-1 w-full h-full flex items-center justify-center text-center'>
			{backend.state !== 'ready' && <div className='flex items-center gap-2'>
				{backend.state === 'idle' && <Moon size={16} />}
				{backend.state === 'connecting' && <LoaderCircle className='animate-spin' size={16} />}
				{backend.state === 'connected' && <CheckCircle2 size={16} />}
				<span className='capitalize'>Initializing... ({backend.state})</span>
			</div>}
			{backend.state === 'ready' && !backend.authenticated && 'Please auth.'}
		</div>}
		{backend.authenticated && backend.state === 'ready' && <ResizablePanelGroup
			direction='horizontal'
			className='flex h-full w-full rounded-lg border flex-1'
		>
			{groups.length !== 0 ? groups.map((group, index) => data[group]?.length !== 0 && <>
				<ResizablePanel key={'panel-' + index} defaultSize={50}>
					<h1 className='font-bold p-3'>{group}</h1>
					<Separator />
					<div className='flex flex-col gap-4 h-full p-3 overflow-auto'>
						{data[group]?.map((message, index) => <Message
							key={group + '-message-' + index}
							message={message}
						/>)}
					</div>
				</ResizablePanel>
				{index !== groups.length - 1 && <ResizableHandle key={'handle-' + index} withHandle={true} />}
			</>) : <p className='p-2 font-bold w-full h-full flex items-center gap-2 justify-center m-auto'>
				<MessageCircleOff size={16} />
				No messages have been processed yet.
			</p>}
		</ResizablePanelGroup>}
	</Page>;
};