import type { FetchedChats, SelectableChannel } from '@shared/types';
import { createJSONStorage, persist } from 'zustand/middleware';
import { create } from 'zustand';


interface ChatsState {
	chats: SelectableChannel[];

	getChats: (platform?: SelectableChannel['platform']) => SelectableChannel[];
	setChats: (chats: SelectableChannel[]) => void;
	addChat: (chat: SelectableChannel) => void;
	removeChat: (chatId: string) => void;
	moveChat: (oldIndex: number, newIndex: number) => void;
}

export const useChatsStore = create<ChatsState>()(
	persist(
		(set, get) => ({
			chats: [],

			getChats: (platform) => {
				const { chats } = get();
				return platform ? chats.filter(c => c.platform === platform) : chats;
			},

			setChats: (chats) => {
				set((state) => ({
					chats: [
						...state.chats,
						...chats
					]
				}));
			},

			addChat: (chat) => {
				set((state) => ({ chats: [...state.chats, chat] }));
			},

			removeChat: (chatId) => {
				console.log('remove chat called', chatId);
				set((state) => ({ chats: state.chats.filter(chat => chat.id !== chatId) }));
			},

			moveChat: (oldIndex, newIndex) => {
				set((state) => {
					const chats = [...state.chats];
					const [removed] = chats.splice(oldIndex, 1);
					chats.splice(newIndex, 0, removed);

					return {
						chats: chats
					};
				});
			}
		}),
		{
			name: 'chats',
			storage: createJSONStorage(() => sessionStorage),
			version: 1
		}
	)
);

export const useChats = (platform: keyof FetchedChats) => useChatsStore((state) => state.getChats(platform));

export default useChatsStore;