import typography from '@tailwindcss/typography';
import animate from 'tailwindcss-animate';


/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class', '[data-theme="dark"]'],
	content: ['index.html', 'src/**/*.{ts,tsx,js,jsx}'],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				'background': 'hsl(var(--background))',
				'primary': 'hsl(var(--primary))',
				'foreground': 'hsl(var(--foreground))',
				'border': 'hsl(var(--border))'
			}
		}
	},
	plugins: [animate, typography],
}

