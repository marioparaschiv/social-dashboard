module.exports = {
	apps: [
		{
			name: 'sd-dashboard-backend',
			script: 'src/index.ts',
			interpreter: 'bun', // Bun interpreter
			env: {
				PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add '~/.bun/bin/bun' to PATH
			}
		},
		{
			name: 'sd-dashboard',
			script: 'start-web.sh'
		},
	]
};