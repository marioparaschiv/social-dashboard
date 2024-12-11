import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, } from "@/components/ui/sidebar";
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeSwitcher from '@/components/theme-switcher';
import { type LucideIcon } from "lucide-react";
import React from "react";


export function NavSecondary({
	items,
	...props
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		variant?: React.ComponentProps<typeof SidebarMenuButton>['variant'];
		badge?: React.ReactNode;
	}[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
	const { pathname } = useLocation();
	const navigate = useNavigate();

	return (
		<SidebarGroup {...props}>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton variant={item.variant} asChild isActive={pathname == '/' ? item.url === pathname : item.url.startsWith(pathname)}>
								<a href={item.url} onClick={(e) => (e.preventDefault(), navigate(item.url))}>
									<item.icon />
									<span>{item.title}</span>
								</a>
							</SidebarMenuButton>
							{item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
						</SidebarMenuItem>
					))}
					<ThemeSwitcher />
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}
