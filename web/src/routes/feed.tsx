import useBackend from '~/hooks/use-backend';
import Page from '~/components/page';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable';
import { useMemo } from 'react';
import { splitBy } from '~/utils';
import { Separator } from '~/components/ui/separator';
import config from '@web-config.json';
import Message from '~/components/message';


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

	return <Page>
		{backend.loading && 'Loading...'}
		{!backend.authenticated && 'Please auth.'}
		{backend.authenticated && !backend.loading && <ResizablePanelGroup
			direction="horizontal"
			className="flex h-full w-full rounded-lg border flex-1"
		>
			{groups.length !== 0 ? groups.map((group, index) => data[group]?.length !== 0 && <>
				<ResizablePanel defaultSize={50}>
					<h1 className='font-bold p-3'>{group}</h1>
					<Separator />
					<div className="flex flex-col gap-2 h-full p-3">
						{data[group].map(message => <Message message={message} />)}
					</div>
				</ResizablePanel>
				{index !== groups.length - 1 && <ResizableHandle withHandle={true} />}
			</>) : <span className='p-2 font-bold w-full text-center'>No messages have been processed yet.</span>}
		</ResizablePanelGroup>}
	</Page>;
};