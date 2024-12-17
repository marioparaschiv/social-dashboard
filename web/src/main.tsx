import './styles.css';

import ThemeProvider from '~/providers/theme-provider.tsx';
import { createRoot } from 'react-dom/client';

import App from './app.tsx';


const root = document.getElementById('root')!;

createRoot(root).render(
	// <StrictMode >
	<ThemeProvider>
		<App />
	</ThemeProvider>
	// </StrictMode>,
);
