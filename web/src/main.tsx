import './styles.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MediaCacheProvider } from '~/components/backend-media';
import ThemeProvider from '~/providers/theme-provider.tsx';
import BackendProvider from '~/providers/backend-provider';
import SearchProvider from '~/providers/search-provider';
import { createRoot } from 'react-dom/client';
import * as Pages from '~/routes';


const routes = Object.values(Pages).map(({ path, element: Component }: Pages.Page) => ({ path, element: <Component /> }));
const router = createBrowserRouter(routes);

const root = document.getElementById('root')!;

createRoot(root).render(
	<ThemeProvider>
		<SearchProvider>
			<BackendProvider>
				<MediaCacheProvider>
					<RouterProvider router={router} />
				</MediaCacheProvider>
			</BackendProvider>
		</SearchProvider>
	</ThemeProvider>
);
