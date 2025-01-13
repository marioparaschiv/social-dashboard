import type { InternalDialogOptions } from '@shared/types';
import { create } from 'zustand';


interface DialogStore {
	dialogs: Record<string, InternalDialogOptions>,
	addDialog: (options: InternalDialogOptions) => void,
	removeDialog: (options: InternalDialogOptions) => void;
	closeDialog: (uuid: string) => void;
};

const useDialogStore = create<DialogStore>((set) => ({
	dialogs: {},
	addDialog: (options: InternalDialogOptions) => set(state => {
		state.dialogs = ({ ...state.dialogs, [options.uuid]: options });
		return { ...state };
	}),
	removeDialog: (options: InternalDialogOptions) => set(state => {
		delete state.dialogs[options.uuid as keyof typeof state.dialogs];

		return { ...state };
	}),
	closeDialog: (uuid: string) => set(state => {
		const dialog = state.dialogs[uuid];
		if (dialog) dialog.closing = true;


		return { ...state };
	})
}));

export default useDialogStore;