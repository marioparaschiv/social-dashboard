import { CheckCircle2, LoaderCircle, MessageCircleOff, Moon } from 'lucide-react';
import { ResizableHandle, ResizablePanelGroup } from '~/components/ui/resizable';
import useBackend from '~/hooks/use-backend';
import Panel from '~/components/panel';
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

	return <Page className='h-dvh max-h-dvh overflow-hidden flex flex-col'>
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
			className='flex w-full rounded-md border'
			direction='horizontal'
		>
			{groups.length !== 0 ? groups.map((group, index) => data[group]?.length !== 0 && <>
				<Panel
					data={data[group as keyof typeof data]}
					group={group}
					index={index}
				/>
				{index !== groups.length - 1 && <ResizableHandle key={'handle-' + index} withHandle={true} />}
			</>) : <p className='p-2 font-bold w-full h-full flex items-center gap-2 justify-center m-auto'>
				<MessageCircleOff size={16} />
				No messages have been processed yet.
			</p>}
		</ResizablePanelGroup>}
	</Page>;
};