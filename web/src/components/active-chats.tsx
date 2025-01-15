import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableChatItem } from '~/components/chat-item';
import useChatsStore from '~/stores/chats';


// Main Ordering Component
export function ActiveChats() {
	const chats = useChatsStore();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 2,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over?.id && active.id !== over?.id) {
			const activeChats = chats.chats;
			const oldIndex = activeChats.findIndex(chat => chat.id === active.id);
			const newIndex = activeChats.findIndex(chat => chat.id === over?.id);

			chats.moveChat(oldIndex, newIndex);
		}
	};

	return (
		<div className='flex flex-col gap-2 w-full overflow-hidden'>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext
					items={chats.chats.map(chat => chat.id)}
					strategy={verticalListSortingStrategy}
				>
					{chats.chats.map(chat => (
						<SortableChatItem
							key={chat.id}
							chat={chat}
						/>
					))}
				</SortableContext>
			</DndContext>
		</div>
	);
}

export default ActiveChats;