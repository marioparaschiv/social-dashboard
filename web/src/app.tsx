import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import * as Pages from '@/routes';


const routes = Object.values(Pages).map(({ path, element: Component }: Pages.Page) => ({ path, element: <Component /> }));
const router = createBrowserRouter(routes);

console.log(routes);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
