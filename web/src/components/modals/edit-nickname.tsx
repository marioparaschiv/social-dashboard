import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { useNicknameStore } from '~/stores/nicknames';
import type { StoreItemTypes } from '@shared/types';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Dialogs } from '~/utils';


interface EditUsernameProps {
	type: StoreItemTypes;
	authorId: string;
	uuid: string;
}

function EditNickname({ type, uuid, authorId }: EditUsernameProps) {
	const { getNickname, setNickname } = useNicknameStore();
	const buttonRef = useRef<ComponentRef<'button'>>(null);

	const [name, setName] = useState(() => getNickname(type, authorId));

	useEffect(() => {
		if (!buttonRef.current) return;

		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== 'Enter') return;

			buttonRef.current?.click();
		}

		document.addEventListener('keydown', onKeyDown);
		return () => document.removeEventListener('keydown', onKeyDown);
	}, [buttonRef.current]);


	const handleSave = () => {
		setNickname(type, authorId, name.trim());
		Dialogs.closeDialog(uuid);
	};

	return (
		<div>
			<Input
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder='Username'
			/>
			<Button
				ref={buttonRef}
				className='w-full mt-4'
				type='submit'
				onClick={handleSave}
			>
				Save
			</Button>
		</div>
	);
}

export default EditNickname;