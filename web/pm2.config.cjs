module.exports = {
	name: 'sd-frontend', // Name of your application
	script: 'serve.ts', // Entry point of your application
	interpreter: 'bun', // Bun interpreter
	env: {
		PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`, // Add '~/.bun/bin/bun' to PATH
	}
};