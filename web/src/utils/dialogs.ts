import type { DialogOptions, InternalDialogOptions } from '@shared/types';
import useDialogStore from '~/stores/dialogs';
import { uuid } from '@shared/utils';


function openDialog(options: DialogOptions) {
	const opts = options as InternalDialogOptions;

	opts.uuid ??= uuid();
	opts.closing = false;

	const state = useDialogStore.getState();

	state.addDialog(opts);

	return () => state.closeDialog(opts.uuid);
}

function closeDialog(uuid: string) {
	const state = useDialogStore.getState();

	state.closeDialog(uuid);
}

export default { openDialog, closeDialog };