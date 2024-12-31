import react from '@vitejs/plugin-react-swc';
import paths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';


// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), paths()]
});
