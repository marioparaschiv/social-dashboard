import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '~/components/ui/navigation-menu';
import AddChatsContent from '~/components/add-chats-content';
import ThemeSwitcher from '~/components/theme-switcher';
import { MessageSquareText, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import openDialog from '~/utils/openDialog';
import useSearch from '~/hooks/use-search';
import { memo } from 'react';


const Header = memo(() => {
	const { search, setSearch } = useSearch();

	return <header className='relative flex items-center w-full p-4 border-b'>
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem className='flex gap-2'>
					<NavigationMenuLink href='/' className='flex items-center gap-2'>
						<MessageSquareText size={18} />
						Feed
					</NavigationMenuLink>
				</NavigationMenuItem>
				{/* <NavigationMenuItem className='flex items-center gap-2'>
					<NavigationMenuLink href='/configuration' className='flex items-center gap-2'>
						<Cog size={18} />
						Configuration
					</NavigationMenuLink>
				</NavigationMenuItem> */}
			</NavigationMenuList>
		</NavigationMenu>
		<Input
			value={search}
			onChange={(e) => setSearch(e.target.value)}
			placeholder='Search...'
			className='relative mx-2 lg:mx-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md'
		/>
		<div className='ml-auto flex gap-2 items-center'>
			<ThemeSwitcher className='ml-auto' />
			<Button className='w-9 h-9' size='icon' variant='outline' onClick={() => {
				openDialog({
					title: <span>Add Chat</span>,
					content: <AddChatsContent />
				});
			}}>
				<Plus />
			</Button>
		</div>
	</header>;
});


export default Header;