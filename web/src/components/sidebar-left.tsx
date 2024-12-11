import { Sidebar, SidebarContent, SidebarHeader, SidebarRail, } from '@/components/ui/sidebar';
import { CircleUserRound, Package, Plus } from 'lucide-react';
import { NavSecondary } from '@/components/nav-secondary';
import { Separator } from '@/components/ui/separator';
import { NavMain } from '@/components/nav-main';
import EBay from '@/components/icons/ebay';
import * as React from 'react';


// This is sample data.
const data = {
	navMain: [
		{
			title: 'Listed Items',
			url: '/',
			icon: Package,
			isActive: true,
		},
		{
			title: 'Accounts',
			url: '/accounts',
			icon: CircleUserRound,
		}
	],
	navSecondary: [
		{
			title: 'Create Product',
			variant: 'outline',
			url: '/create-product',
			icon: Plus,
		}
	]
};

export function SidebarLeft({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar className='border-r-0' {...props}>
			<SidebarHeader>
				<span className='w-full flex items-center gap-2 truncate justify-center font-semibold text-center py-2'>
					<EBay width={46} height={46} /> Account Manager
				</span>
				<Separator />
				<NavMain items={data.navMain} />
			</SidebarHeader>
			<SidebarContent>
				{/* <NavFavorites favorites={data.favorites} /> */}
				<NavSecondary items={data.navSecondary} className='mt-auto' />
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
