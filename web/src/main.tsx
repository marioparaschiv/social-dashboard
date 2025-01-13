import './styles.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ThemeProvider from '~/providers/theme-provider.tsx';
import BackendProvider from '~/providers/backend-provider';
import SearchProvider from '~/providers/search-provider';
import { Toaster } from '~/components/ui/sonner';
import { createRoot } from 'react-dom/client';
import * as Pages from '~/routes';


const routes = Object.values(Pages).map(({ path, element: Component }: Pages.Page) => ({ path, element: <Component /> }));
const router = createBrowserRouter(routes);

const root = document.getElementById('root')!;

createRoot(root).render(
	<ThemeProvider>
		<SearchProvider>
			<BackendProvider>
				<Toaster />
				<RouterProvider router={router} />
			</BackendProvider>
		</SearchProvider>
	</ThemeProvider>
);
