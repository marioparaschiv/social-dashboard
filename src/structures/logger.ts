import { colorize } from '~/utilities';
import { inspect } from 'node:util';
import config from '@config.json';


export function log(...args: string[]): void {
	return console.log('»', ...args);
}

export function error(...args: string[]): void {
	return console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'red')));
}

export function success(...args: string[]): void {
	return console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'green')));
}

export function warn(...args: string[]): void {
	return console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'yellow')));
}

export function debug(...args: string[]): void {
	if (!config.debug) return;
	return console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'gray')));
}

export function info(...args: string[]): void {
	return console.info('»', ...args.map(arg => colorize(typeof arg === 'string' ? arg : inspect(arg), 'cyan')));
}

export function createLogger(...callers: string[]) {
	const prefix = '[' + callers.join(' → ') + ']';

	return {
		log: (...args: any[]) => log(prefix, ...args),
		error: (...args: any[]) => error(prefix, ...args),
		success: (...args: any[]) => success(prefix, ...args),
		warn: (...args: any[]) => warn(prefix, ...args),
		debug: (...args: any[]) => debug(prefix, ...args),
		info: (...args: any[]) => info(prefix, ...args),
	};
}