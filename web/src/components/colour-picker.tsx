import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Input } from '~/components/ui/input';
import { cn } from '~/utils';


interface ColourPickerProps extends ComponentProps<'div'> {
	value: string;
	onColourChange: (colour: string) => any;
}

function ColourPicker({ onColourChange, value, ...props }: ColourPickerProps) {
	const ref = useRef<HTMLInputElement | null>(null);
	const [colour, setColour] = useState(value);

	useEffect(() => {
		onColourChange?.(colour);
	}, [colour]);

	return <div {...props} className={cn('flex gap-1 items-center', props.className)}>
		<div
			role='button'
			className='border rounded-md w-9 h-9 flex-shrink-0'
			style={{ background: colour }}
			onClick={(e) => {
				if (!ref.current) return;

				const rect = (e.target as HTMLDivElement).getBoundingClientRect();

				ref.current.style.position = 'fixed';
				ref.current.style.left = `${rect.left}px`;
				ref.current.style.top = `${rect.bottom + 2}px`;

				ref.current.click();
			}}
		/>
		<input className='absolute opacity-0' ref={ref} type='color' value={value} onChange={(e) => setColour(e.target.value)} />
		<Input className='w-fit' placeholder='Colour' value={value} />
	</div>;
}

export default ColourPicker;