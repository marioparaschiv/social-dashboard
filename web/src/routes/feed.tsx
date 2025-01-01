import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { CheckCircle2, LoaderCircle, LockKeyhole, MessageCircleOff, Moon } from 'lucide-react';
import { ResizableHandle, ResizablePanelGroup } from '~/components/ui/resizable';
import { DispatchType } from '@shared/constants';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import useBackend from '~/hooks/use-backend';
import { useMemo, useState } from 'react';
import Panel from '~/components/panel';
import config from '@web-config.json';
import Page from '~/components/page';
import { splitBy } from '~/utils';


export const path = '/';
export const element = Feed;

function Feed() {
	const [authenticating, setAuthenticating] = useState(false);
	const [authFailed, setAuthFailed] = useState(false);
	const [authOpen, setAuthOpen] = useState(false);
	const [password, setPassword] = useState('');
	const backend = useBackend();

	// const data = useMemo(() => splitBy(backend.data, 'groups', (a, b) => a.savedAt - b.savedAt), [backend.data]);

	const data = useMemo(() => {
		console.log('Messages:', backend.data); // Log incoming messages
		console.log('Category Order:', config.categoryOrder); // Log category order
		const result = splitBy(backend.data, 'groups', (a, b) => a.savedAt - b.savedAt);
		console.log('Split Result:', result); // Log the result
		return result;
	}, [backend.data]);

	const groups = useMemo(() => {
		const keys = Object.keys(data);

		return keys
			.filter(d => data[d]?.length !== 0)
			.sort((a, b) => config.categoryOrder.indexOf(a) - config.categoryOrder.indexOf(b));
	}, [data]);

	return <Page className='flex flex-col max-h-dvh h-dvh' containerClassName='overflow-hidden'>
		{(backend.state !== 'ready' || !backend.authenticated) && <div className='font-bold h-full w-full flex items-center flex-1 justify-center text-center'>
			{backend.state !== 'ready' && <div className='flex items-center gap-2'>
				{backend.state === 'idle' && <Moon size={16} />}
				{backend.state === 'connecting' && <LoaderCircle className='animate-spin' size={16} />}
				{backend.state === 'connected' && <CheckCircle2 size={16} />}
				<span className='capitalize'>Initializing... ({backend.state})</span>
			</div>}
			{backend.state === 'ready' && !backend.authenticated && <div className='flex gap-4 flex-col items-center'>
				<LockKeyhole size={64} />
				<span className='font-bold text-xl'>You must be authenticated to access this page.</span>
				<Dialog open={authOpen} onOpenChange={(open) => setAuthOpen(open)}>
					<DialogTrigger asChild>
						<Button className='w-1/3'>
							Authenticate
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								Authenticate
							</DialogTitle>
							<DialogDescription>
								Please enter the password you set in the configuration to continue.
							</DialogDescription>
						</DialogHeader>
						<Input
							value={password}
							data-failed={authFailed}
							className='data-[failed=true]:!border-red-500 data-[failed=true]:border-2'
							placeholder='Password'
							type='password'
							onChange={(e) => {
								setAuthFailed(false);
								setPassword(e.target.value ?? '');
							}}
						/>
						{authFailed && <span className='text-red-500'>Incorrect password.</span>}
						<DialogFooter>
							<Button
								disabled={!password || authenticating}
								className='w-full disabled:opacity-50'
								onClick={async () => {
									setAuthenticating(true);
									setAuthFailed(false);

									backend.send(DispatchType.REQUEST_AUTH, { password });

									const success = await new Promise<boolean>((resolve) => {
										const remove = backend.on(DispatchType.AUTH_RESPONSE, (payload) => {
											remove();
											resolve(payload.success);
										});
									});

									setAuthFailed(!success);
									setAuthenticating(false);

									if (success) {
										setAuthOpen(false);
										localStorage.setItem('password', password);
									}
								}}
							>
								{authenticating ? <LoaderCircle className='animate-spin' /> : 'Submit'}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>}
		</div>}
		{backend.authenticated && backend.state === 'ready' && <ResizablePanelGroup
			className='flex-1 w-full flex rounded-md border'
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