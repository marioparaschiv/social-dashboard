import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { DispatchPayload } from '@shared/types';
import { useQuery } from '@tanstack/react-query';
import { DispatchType } from '@shared/constants';
import { Button } from '~/components/ui/button';
import ChatItem from '~/components/chat-item';
import useBackend from '~/hooks/use-backend';


function AddChatsContent() {
	const backend = useBackend();

	// const [chats, setChats] = useState<FetchedChats>({ discord: [], telegram: [] });

	const { data, error, isLoading } = useQuery({
		enabled: true,
		queryKey: [],
		queryFn: async () => {
			backend.send(DispatchType.FETCH_CHATS);

			console.log('sent fetch chats');
			const data = await new Promise<DispatchPayload[DispatchType.FETCH_CHATS_RESPONSE]>(resolve => {
				const remove = backend.on(DispatchType.FETCH_CHATS_RESPONSE, (payload) => {
					remove();
					resolve(payload);
				});
			});

			return data;
		}
	});

	console.log(data, error, isLoading);

	return <div className='w-full'>
		<Tabs defaultValue='discord' className='w-full'>
			<TabsList className='w-full'>
				<TabsTrigger className='w-full' value='discord'>Discord</TabsTrigger>
				<TabsTrigger className='w-full' value='telegram'>Telegram</TabsTrigger>
			</TabsList>
			<TabsContent className='max-h-96 overflow-auto flex flex-col gap-2 pr-1' value='discord'>
				{data?.discord.map(d => <ChatItem chat={d} />)}
			</TabsContent>
			<TabsContent className='max-h-96 overflow-auto flex flex-col gap-2 pr-1' value='telegram'>
				{data?.telegram.map(d => <ChatItem chat={d} />)}
			</TabsContent>
		</Tabs>
		<Button className='w-full'>
			Add
		</Button>
		{/* {[...(data?.discord ?? []), ...(data?.telegram ?? [])].map(d => <ChatItem chat={d} />)} */}
	</div>;
}

export default AddChatsContent;