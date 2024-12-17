import { BackendContext } from '~/providers/backend-provider';
import { useContext } from 'react';


function useBackend() {
	const context = useContext(BackendContext);

	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return context;
};

export default useBackend;