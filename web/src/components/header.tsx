import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '~/components/ui/navigation-menu';
import ThemeSwitcher from '~/components/theme-switcher';
import { Cog, MessageSquareText } from 'lucide-react';
import { memo } from 'react';


const Header = memo(() => {
	return <header className='flex items-center w-full p-4 border-b'>
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem className='flex gap-2'>
					<NavigationMenuLink href='/' className='group-data-[selected=true]:bg-red-500 flex items-center gap-2'>
						<MessageSquareText size={18} />
						Feed
					</NavigationMenuLink>
					<NavigationMenuLink href='/configuration' className='flex items-center gap-2'>
						<Cog size={18} />
						Configuration
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<ThemeSwitcher className='ml-auto' />
	</header>;
});


export default Header;