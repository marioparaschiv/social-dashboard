export * as Configuration from './configuration';
export * as Feed from './feed';

export type Page = {
	path: string,
	element: React.ComponentType;
};