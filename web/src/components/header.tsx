import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '~/components/ui/navigation-menu';
import ThemeSwitcher from '~/components/theme-switcher';
import { Cog, MessageSquareText } from 'lucide-react';
import { Input } from '~/components/ui/input';
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
				<NavigationMenuItem className='flex items-center gap-2'>
					<NavigationMenuLink href='/configuration' className='flex items-center gap-2'>
						<Cog size={18} />
						Configuration
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<Input
			value={search}
			onChange={(e) => setSearch(e.target.value)}
			placeholder='Search...'
			className='relative mx-2 lg:mx-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:max-w-md'
		/>
		<ThemeSwitcher className='ml-auto' />
	</header>;
});


export default Header;