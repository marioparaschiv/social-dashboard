import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { createContext, type PropsWithChildren } from 'react';
import type { InternalDialogOptions } from '@shared/types';
import useDialogStore from '~/stores/dialogs';


type DialogProviderState = {
	dialogs: Record<string, InternalDialogOptions>,
	addDialog: (options: InternalDialogOptions) => void,
	closeDialog: (options: InternalDialogOptions) => void;
};

const initial: DialogProviderState = {
	dialogs: {},
	addDialog: (options: InternalDialogOptions) => void 0,
	closeDialog: (options: InternalDialogOptions) => void 0
};

export const DialogProviderContext = createContext<DialogProviderState>(initial);

export default function DialogProvider({ children }: PropsWithChildren) {
	const { dialogs, addDialog, removeDialog, closeDialog } = useDialogStore();

	const ctx = {
		dialogs,
		addDialog,
		closeDialog
	};

	return (
		<DialogProviderContext.Provider value={ctx}>
			{Object.entries(dialogs).map(([uuid, dialog]) => <Dialog
				open={!dialog.closing}
				key={uuid}
				onOpenChange={(open) => {
					if (open) return;

					closeDialog(dialog);
					setTimeout(() => removeDialog(dialog), 200);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle asChild>
							{dialog.title}
						</DialogTitle>
						{dialog.description && <DialogDescription asChild>
							{dialog.description}
						</DialogDescription>}
					</DialogHeader>
					{dialog.content}
					{dialog.footer && <DialogFooter>
						{dialog.footer}
					</DialogFooter>}
				</DialogContent>
			</Dialog>)}
			{children}
		</DialogProviderContext.Provider>
	);
}