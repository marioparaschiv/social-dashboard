import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { DispatchPayload } from '@shared/types';
import ActiveChats from '~/components/active-chats';
import { Loader2, SearchX, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { DispatchType } from '@shared/constants';
import { Button } from '~/components/ui/button';
import ChatItem from '~/components/chat-item';
import useBackend from '~/hooks/use-backend';
import { forwardRef, useMemo } from 'react';
import useChatsStore from '~/stores/chats';
import { Virtuoso } from 'react-virtuoso';
import { cn, Dialogs } from '~/utils';


export function ModifyChats({ uuid }: { uuid: string; }) {
	const { chats } = useChatsStore();
	const backend = useBackend();

	const { data, error, isLoading } = useQuery({
		enabled: true,
		queryKey: ['chats'],
		queryFn: async () => {
			backend.send(DispatchType.FETCH_CHATS);

			const data = await new Promise<DispatchPayload[DispatchType.FETCH_CHATS_RESPONSE]>(resolve => {
				const remove = backend.on(DispatchType.FETCH_CHATS_RESPONSE, (payload) => {
					remove();
					resolve(payload);
				});
			});

			return data;
		}
	});

	const telegramData = useMemo(() => data?.telegram.filter((a) => !chats.includes(a)) ?? [], [data, chats]);
	const discordData = useMemo(() => data?.discord.filter((a) => !chats.includes(a)) ?? [], [data, chats]);

	console.log(discordData);

	return (
		<div className='w-full'>
			<Tabs defaultValue='active' className='w-full'>
				<TabsList className='w-full'>
					<TabsTrigger className='w-full' value='active'>Active</TabsTrigger>
					<TabsTrigger className='w-full' value='discord'>Discord</TabsTrigger>
					<TabsTrigger className='w-full' value='telegram'>Telegram</TabsTrigger>
				</TabsList>

				<TabsContent className='data-[state=active]:h-96 [overflow:overlay] flex flex-col gap-2 m-0 data-[state=active]:my-2' value='active'>
					<ActiveChats />
					{chats.length === 0 && <div className='flex flex-col items-center justify-center py-24'>
						<SearchX size={96} />
						<span className='font-bold text-center'>You haven't added any chats yet.</span>
					</div>}
				</TabsContent>

				<TabsContent className='data-[state=active]:h-96 [overflow:overlay] flex flex-col gap-2 m-0 data-[state=active]:my-2' value='discord'>
					{!isLoading && error && (
						<div className='flex flex-col gap-2 items-center justify-center py-24'>
							<X size={64} />
							<span>{error.message}</span>
						</div>
					)}
					{isLoading && !error && (
						<div className='flex items-center justify-center py-24'>
							<Loader2 size={64} className='animate-spin' />
						</div>
					)}
					{!isLoading && !error && <Virtuoso
						data={discordData}
						totalCount={discordData.length}
						itemContent={(index, chat) => <ChatItem
							className={cn('my-1', index === 0 && 'mt-0', index === (discordData.length - 1) && 'mb-0')}
							key={'chat' + index}
							type='add'
							chat={chat}
						/>}
						components={{
							Item: forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => (
								<div
									{...props}
									className={cn('flex flex-col px-1')}
									ref={ref}
								/>
							))
						}}
					/>}
				</TabsContent>

				<TabsContent className='data-[state=active]:h-96 h-full [overflow:overlay] flex flex-col gap-2 m-0 data-[state=active]:my-2' value='telegram'>
					{!isLoading && error && (
						<div className='flex flex-col gap-2 items-center justify-center py-24'>
							<X size={64} />
							<span>{error.message}</span>
						</div>
					)}
					{isLoading && !error && (
						<div className='flex items-center justify-center py-24'>
							<Loader2 size={64} className='animate-spin' />
						</div>
					)}
					{!isLoading && !error && <Virtuoso
						data={telegramData}
						totalCount={telegramData.length}
						itemContent={(index, chat) => <ChatItem
							className={cn('my-1', index === 0 && 'mt-0', index === (discordData.length - 1) && 'mb-0')}
							key={'chat' + index}
							type='add'
							chat={chat}
						/>}
						components={{
							Item: forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>) => (
								<div
									{...props}
									className={cn('flex flex-col px-1')}
									ref={ref}
								/>
							))
						}}
					/>}
				</TabsContent>
			</Tabs>

			<Button
				disabled={isLoading}
				className='w-full'
				onClick={() => {
					Dialogs.closeDialog(uuid);
				}}
			>
				Confirm
			</Button>
		</div>
	);
}



export default ModifyChats;