import { createContext, useState, type PropsWithChildren } from 'react';


type SearchProviderState = {
	search: string;
	setSearch: (search: string) => void;
};

const initial = {
	search: '',
	setSearch: () => void 0
};

export const SearchProviderContext = createContext<SearchProviderState>(initial);

export default function SearchProvider({ children }: PropsWithChildren) {
	const [search, setSearch] = useState('');

	const ctx = {
		search,
		setSearch
	};

	return (
		<SearchProviderContext.Provider value={ctx}>
			{children}
		</SearchProviderContext.Provider>
	);
}