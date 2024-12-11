"use client";

import { type LucideIcon } from "lucide-react";

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, useNavigate } from 'react-router-dom';

export function NavMain({
	items,
}: {
	items: {
		title: string;
		url: string;
		icon: LucideIcon;
		isActive?: boolean;
	}[];
}) {
	const { pathname } = useLocation();
	const navigate = useNavigate();

	return (
		<SidebarMenu>
			{items.map((item) => (
				<SidebarMenuItem key={item.title}>
					<SidebarMenuButton asChild isActive={pathname == '/' ? item.url === pathname : item.url.startsWith(pathname)}>
						<a href={item.url} onClick={(e) => (e.preventDefault(), navigate(item.url))}>
							<item.icon />
							<span>{item.title}</span>
						</a>
					</SidebarMenuButton>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	);
}
