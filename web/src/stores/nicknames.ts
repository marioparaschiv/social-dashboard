import { persist } from 'zustand/middleware';
import { create } from 'zustand';


interface NicknameStorage {
	telegram: Record<string, string>;
	discord: Record<string, string>;
}

interface NicknameState extends NicknameStorage {
	getNickname: (platform: keyof NicknameStorage, authorId: string) => string;
	setNickname: (platform: keyof NicknameStorage, authorId: string, username: string) => void;
}

export const useNicknameStore = create<NicknameState>()(
	persist(
		(set, get) => ({
			telegram: {},
			discord: {},

			getNickname: (platform, authorId) => {
				return get()[platform]?.[authorId];
			},

			setNickname: (platform, authorId, username) => {
				set((state) => ({
					[platform]: {
						...state[platform],
						[authorId]: username
					}
				}));
			}
		}),
		{
			name: 'nicknames'
		}
	)
);

export const useNickname = (platform: keyof NicknameStorage, authorId: string) => useNicknameStore((state) => state.getNickname(platform, authorId));

export default useNicknameStore;