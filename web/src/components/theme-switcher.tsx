import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '~/components/ui/dropdown-menu';
import { Button, type ButtonProps } from '~/components/ui/button';
import useTheme from '~/hooks/use-theme';
import { Moon, Sun } from 'lucide-react';
import { cn } from '~/utils';


function ThemeSwitcher(props: ButtonProps) {
	const { setTheme, rawTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button {...props} size='sm' variant='outline' className={cn('flex', props.className)}>
					<Sun size={18} className='dark:hidden' />
					<Moon size={18} className='hidden dark:block' />
					{rawTheme.at(0)?.toUpperCase() + rawTheme.slice(1)}
					<span className='sr-only'>Change Appearance</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Appearance</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuCheckboxItem
					checked={rawTheme === 'light'}
					onClick={() => setTheme('light')}
				>
					Light
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={rawTheme === 'dark'}
					onClick={() => setTheme('dark')}
				>
					Dark
				</DropdownMenuCheckboxItem>
				<DropdownMenuCheckboxItem
					checked={rawTheme === 'system'}
					onClick={() => setTheme('system')}
				>
					System
				</DropdownMenuCheckboxItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export default ThemeSwitcher;