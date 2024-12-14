import type { StoreItem, StoreItemTypes } from '@types';
import Store from '~/structures/store';


const storage = new Store<StoreItem<StoreItemTypes>>();

export default storage;