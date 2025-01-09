import { SearchProviderContext } from '~/providers/search-provider';
import { useContext } from 'react';


function useSearch() {
	const context = useContext(SearchProviderContext);

	if (context === undefined) {
		throw new Error('useSearch must be used within a ThemeProvider');
	}

	return context;
};

export default useSearch;