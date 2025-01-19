import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, } from '@dnd-kit/sortable';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, } from '@dnd-kit/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Form, FormControl, FormItem, FormLabel } from '~/components/ui/form';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import ColourPicker from '~/components/colour-picker';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { useForm } from 'react-hook-form';
import { CSS } from '@dnd-kit/utilities';
import Page from '~/components/page';
import { cn } from '~/utils';
import React from 'react';


// Sortable Category Item Component
const SortableCategory = ({ category, index, onDelete, onChange }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: category });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes}{...listeners} className={cn('flex gap-1 p-2 items-center hover:cursor-move', index !== 0 && 'border-t')}>
			<GripVertical className='h-4 w-4 mx-1' />
			<FormItem className='flex-1'>
				<FormControl>
					<Input
						value={category}
						onChange={(e) => onChange(index, e.target.value)}
					/>
				</FormControl>
			</FormItem>
			<Button
				className='h-9 w-9'
				type='button'
				variant='outline'
				size='icon'
				onClick={() => onDelete(index)}
			>
				<Trash2 className='h-4 w-4' />
			</Button>
		</div>
	);
};

export const path = '/configuration';
export const element = Configuration;

function Configuration() {
	return <Page>
		<Tabs defaultValue='display'>
			<TabsList className='w-full'>
				<TabsTrigger className='w-full' value='display'>Display Configuration</TabsTrigger>
				<TabsTrigger className='w-full' value='data'>Data Configuration</TabsTrigger>
			</TabsList>
			<TabsContent value='display'>
				<ConfigForm />
			</TabsContent>
			<TabsContent value='data'>
				Change your password here.
			</TabsContent>
		</Tabs>
	</Page>;
}

const ConfigForm = () => {
	const form = useForm({
		defaultValues: {
			ip: 'localhost',
			port: 29435,
			apiPort: 29436,
			apiSSL: false,
			telegram: {
				userColours: {
					ripeternal: 'rgba(255, 0, 255)'
				}
			},
			discord: {
				userColours: {}
			},
			highlightedKeywords: {
				pink: 'rgba(255, 0, 255)',
				'hey|hello': 'rgba(255, 0, 0)'
			},
			categoryOrder: ['High', 'Medium', 'Low']
		}
	});

	const [telegramUsers, setTelegramUsers] = React.useState(
		Object.entries(form.getValues().telegram.userColours)
	);
	const [discordUsers, setDiscordUsers] = React.useState(
		Object.entries(form.getValues().discord.userColours)
	);
	const [keywords, setKeywords] = React.useState(
		Object.entries(form.getValues().highlightedKeywords)
	);
	const [categories, setCategories] = React.useState(
		form.getValues().categoryOrder
	);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5
			}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over) return;

		if (active.id !== over.id) {
			setCategories((items) => {
				const oldIndex = items.indexOf(active.id as string);
				const newIndex = items.indexOf(over.id as string);
				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const onSubmit = (data) => {
		data.telegram.userColours = Object.fromEntries(telegramUsers);
		data.discord.userColours = Object.fromEntries(discordUsers);
		data.highlightedKeywords = Object.fromEntries(keywords);
		data.categoryOrder = categories;
		console.log(data);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
				{/* <div className='flex gap-4 w-full'>
					<Card className='w-full'>
						<CardHeader>
							<CardTitle>Telegram User Colors</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{telegramUsers.map(([username, color], index) => (
								<div key={index} className='flex gap-4 items-end'>
									<FormItem className='flex-1'>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												value={username}
												onChange={(e) => {
													const newUsers = [...telegramUsers];
													newUsers[index][0] = e.target.value;
													setTelegramUsers(newUsers);
												}}
											/>
										</FormControl>
									</FormItem>
									<FormItem className='flex-1'>
										<FormLabel>Color</FormLabel>
										<FormControl>
											<ColourPicker
												value={color}
												onColourChange={(newColor) => {
													const newUsers = [...telegramUsers];
													newUsers[index][1] = newColor;
													setTelegramUsers(newUsers);
												}}
											/>
										</FormControl>
									</FormItem>
									<Button
										type='button'
										variant='destructive'
										size='icon'
										onClick={() => {
											setTelegramUsers(telegramUsers.filter((_, i) => i !== index));
										}}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							))}
							<Button
								type='button'
								onClick={() => setTelegramUsers([...telegramUsers, ['', '']])}
								className='w-full'
							>
								<Plus className='h-4 w-4 mr-2' />
								Add User
							</Button>
						</CardContent>
					</Card>

					<Card className='w-full'>
						<CardHeader>
							<CardTitle>Discord User Colors</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							{discordUsers.map(([username, color], index) => (
								<div key={index} className='flex gap-4 items-end'>
									<FormItem className='flex-1'>
										<FormLabel>Username</FormLabel>
										<FormControl>
											<Input
												value={username}
												onChange={(e) => {
													const newUsers = [...discordUsers];
													newUsers[index][0] = e.target.value;
													setDiscordUsers(newUsers);
												}}
											/>
										</FormControl>
									</FormItem>
									<FormItem className='flex-1'>
										<FormLabel>Color</FormLabel>
										<FormControl>
											<ColourPicker
												value={color}
												onColourChange={(newColor) => {
													const newUsers = [...discordUsers];
													newUsers[index][1] = newColor;
													setDiscordUsers(newUsers);
												}}
											/>
										</FormControl>
									</FormItem>
									<Button
										type='button'
										variant='destructive'
										size='icon'
										onClick={() => {
											setDiscordUsers(discordUsers.filter((_, i) => i !== index));
										}}
									>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
							))}
							<Button
								type='button'
								onClick={() => setDiscordUsers([...discordUsers, ['', '']])}
								className='w-full'
							>
								<Plus className='h-4 w-4 mr-2' />
								Add User
							</Button>
						</CardContent>
					</Card>
				</div> */}

				<div className='flex flex-col gap-2'>
					<Label className='text-lg font-bold' htmlFor='highlighted-keywords'>User Customizations</Label>
					<div className='border rounded-lg' id='highlighted-keywords'>
						{keywords.length === 0 && <div className='p-2 text-center font-bold text-sm'>
							No items.
						</div>}
						{keywords.length !== 0 && keywords.map(([keyword, color], index) => (
							<div key={index} className={cn('flex gap-1 p-2 items-end hover:cursor-move', index !== 0 && 'border-t')}>
								<FormItem className='flex-1'>
									{index === 0 && <FormLabel className='font-bold'>
										Username
									</FormLabel>}
									<FormControl>
										<Input
											value={keyword}
											onChange={(e) => {
												const newKeywords = [...keywords];
												newKeywords[index][0] = e.target.value;
												setKeywords(newKeywords);
											}}
										/>
									</FormControl>
								</FormItem>
								<FormItem className='flex-1'>
									{index === 0 && <FormLabel className='font-bold'>
										Nickname
									</FormLabel>}
									<FormControl>
										<Input
											placeholder='Nickname'
											value={keyword}
											onChange={(e) => {
												const newKeywords = [...keywords];
												newKeywords[index][0] = e.target.value;
												setKeywords(newKeywords);
											}}
										/>
									</FormControl>
								</FormItem>
								<FormItem className='flex-1'>
									{index === 0 && <FormLabel className='font-bold'>
										Platform
									</FormLabel>}
									<FormControl>
										{/* <Input
											value={keyword}
											onChange={(e) => {
												const newKeywords = [...keywords];
												newKeywords[index][0] = e.target.value;
												setKeywords(newKeywords);
											}}
										/> */}
										<Select defaultValue='discord'>
											<SelectTrigger>
												<SelectValue placeholder='Discord' />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value='discord'>Discord</SelectItem>
												<SelectItem value='telegram'>Telegram</SelectItem>
											</SelectContent>
										</Select>

									</FormControl>
								</FormItem>
								<FormItem>
									{index === 0 && <FormLabel className='font-bold'>
										Colour
									</FormLabel>}
									<FormControl>
										<ColourPicker
											value={color}
											onColourChange={(newColor) => {
												const newKeywords = [...keywords];
												newKeywords[index][1] = newColor;
												setKeywords(newKeywords);
											}}
										/>
									</FormControl>
								</FormItem>
								<Button
									className='h-9 w-9'
									type='button'
									variant='outline'
									size='icon'
									onClick={() => setKeywords(keywords.filter((_, i) => i !== index))}
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						))}
						<Button
							variant='ghost'
							onClick={() => setKeywords([...keywords, ['Keyword', '#ff0000']])}
							className='w-full border-y-0 border-x-0 border-t rounded-t-none rounded-b-md'
						>
							<Plus className='h-4 w-4' />
							Add Customization
						</Button>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label className='text-lg font-bold' htmlFor='highlighted-keywords'>Highlighted Keywords</Label>
					<div className='border rounded-lg' id='highlighted-keywords'>
						{keywords.length === 0 && <div className='p-2 text-center font-bold text-sm'>
							No items.
						</div>}
						{keywords.length !== 0 && keywords.map(([keyword, color], index) => (
							<div key={index} className={cn('flex gap-1 p-2 items-end hover:cursor-move', index !== 0 && 'border-t')}>
								<FormItem className='flex-1'>
									{index === 0 && <FormLabel className='font-bold'>
										Keyword
									</FormLabel>}
									<FormControl>
										<Input
											value={keyword}
											onChange={(e) => {
												const newKeywords = [...keywords];
												newKeywords[index][0] = e.target.value;
												setKeywords(newKeywords);
											}}
										/>
									</FormControl>
								</FormItem>
								<FormItem>
									{index === 0 && <FormLabel className='font-bold'>
										Colour
									</FormLabel>}
									<FormControl>
										<ColourPicker
											value={color}
											onColourChange={(newColor) => {
												const newKeywords = [...keywords];
												newKeywords[index][1] = newColor;
												setKeywords(newKeywords);
											}}
										/>
									</FormControl>
								</FormItem>
								<Button
									className='h-9 w-9'
									type='button'
									variant='outline'
									size='icon'
									onClick={() => setKeywords(keywords.filter((_, i) => i !== index))}
								>
									<Trash2 className='h-4 w-4' />
								</Button>
							</div>
						))}
						<Button
							variant='ghost'
							onClick={() => setKeywords([...keywords, ['Keyword', '#ff0000']])}
							className='w-full border-y-0 border-x-0 border-t rounded-t-none rounded-b-md'
						>
							<Plus className='h-4 w-4' />
							Add Keyword
						</Button>
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<Label className='text-lg font-bold' htmlFor='category-order'>Category Order</Label>
					<div className='border rounded-lg' id='category-order'>
						{categories.length === 0 && <div className='p-2 text-center font-bold text-sm'>
							No items.
						</div>}
						{categories.length !== 0 && <DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={categories}
								strategy={verticalListSortingStrategy}
							>
								{categories.map((category, index) => (
									<SortableCategory
										key={category + index}
										category={category}
										index={index}
										onDelete={(index) => {
											setCategories(categories.filter((_, i) => i !== index));
										}}
										onChange={(index, value) => {
											const newCategories = [...categories];
											newCategories[index] = value;
											setCategories(newCategories);
										}}
									/>
								))}
							</SortableContext>
						</DndContext>}
						<Button
							variant='ghost'
							onClick={() => setCategories([...categories, ''])}
							className='w-full border-y-0 border-x-0 border-t rounded-t-none rounded-b-md'
						>
							<Plus className='h-4 w-4' />
							Add Category
						</Button>
					</div>
				</div>

				{/* <Button type='submit'>Save Configuration</Button> */}
			</form>
		</Form >
	);
};

export default ConfigForm;