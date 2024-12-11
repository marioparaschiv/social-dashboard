export * as CreateProduct from './create-product';
export * as ListedItems from './listed-items';
export * as Accounts from './accounts';

export type Page = {
	path: string,
	element: React.ComponentType;
};