import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import BackendProvider from '~/providers/backend-provider';
import * as Pages from '~/routes';


const routes = Object.values(Pages).map(({ path, element: Component }: Pages.Page) => ({ path, element: <Component /> }));
const router = createBrowserRouter(routes);

function App() {
	return <BackendProvider>
		<RouterProvider router={router} />
	</BackendProvider>;
}

export default App;
